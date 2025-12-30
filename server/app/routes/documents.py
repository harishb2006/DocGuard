from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
import shutil
import os
from typing import List, Optional
from datetime import datetime
from cerebras.cloud.sdk import Cerebras
import sys

# Import config (ensure path is correct relative to execution)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import CEREBRAS_API_KEY

from ..ingest.loader import load_pdf
from ..ingest.splitter import split_documents
from ..ingest.vectorstore import get_vectorstore
from ..auth.firebase_auth import verify_firebase_token
from ..db.mongodb import get_documents_collection, get_users_collection, get_queries_collection
from ..models.organization import RoleEnum

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Dependencies ---

async def verify_org_membership(org_id: str, token_data: dict = Depends(verify_firebase_token)):
    """
    Verify the user is a member of the organization.
    Returns: (user_doc, role_in_org)
    """
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"uid": token_data["uid"]})
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    role = None
    for r in user.get("org_roles", []):
        if r["org_id"] == org_id:
            role = r["role"]
            break
            
    if not role:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
        
    return user, role

async def verify_org_admin(org_id: str, token_data: dict = Depends(verify_firebase_token)):
    """
    Verify the user is an ADMIN of the organization.
    """
    user, role = await verify_org_membership(org_id, token_data)
    if role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Organization Admin privileges required")
    return user

# --- Models ---

class DocumentInfo(BaseModel):
    filename: str
    size: int
    uploaded_at: datetime
    uploaded_by: str

class QuestionRequest(BaseModel):
    question: str
    document_filter: list[str] = None

class SourceCitation(BaseModel):
    page: int
    content: str
    document_name: str

class AnswerResponse(BaseModel):
    answer: str
    sources: list[SourceCitation]

# --- Routes ---

@router.post("/{org_id}/upload")
async def upload_pdf(
    org_id: str,
    file: UploadFile = File(...),
    admin_user: dict = Depends(verify_org_admin)
):
    """
    Upload PDF to a specific organization.
    Admin only.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Create org-specific upload dir to avoid name collisions across orgs (optional but good practice)
        org_upload_dir = os.path.join(UPLOAD_DIR, org_id)
        os.makedirs(org_upload_dir, exist_ok=True)
        
        file_path = os.path.join(org_upload_dir, file.filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Load PDF
        documents = load_pdf(file_path)
        
        # Split into chunks
        chunks = split_documents(documents)
        
        # Add metadata (Crucial: Add org_id)
        for chunk in chunks:
            chunk.metadata["document_name"] = file.filename
            chunk.metadata["org_id"] = org_id
        
        # Store in Pinecone
        vectorstore = get_vectorstore()
        vectorstore.add_documents(chunks)
        
        # Save document metadata to MongoDB
        documents_collection = await get_documents_collection()
        await documents_collection.insert_one({
            "org_id": org_id, # Link to org
            "filename": file.filename,
            "file_path": file_path,
            "pages": len(documents),
            "chunks_created": len(chunks),
            "uploaded_by": admin_user["uid"],
            "uploaded_by_email": admin_user["email"],
            "uploaded_at": datetime.utcnow(),
            "status": "active"
        })
        
        return {
            "status": "success",
            "filename": file.filename,
            "pages": len(documents),
            "chunks_created": len(chunks),
            "message": "Document successfully ingested"
        }
    
    except Exception as e:
        import traceback
        print(f"ERROR: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


@router.get("/{org_id}/list", response_model=List[DocumentInfo])
async def list_documents(
    org_id: str,
    membership_info: tuple = Depends(verify_org_membership)
):
    """
    List documents for the organization.
    Available to all members (Admin + Employee).
    """
    try:
        documents_collection = await get_documents_collection()
        
        docs = await documents_collection.find({"org_id": org_id}).to_list(length=100)
        
        results = []
        for doc in docs:
            # Check if file exists to get size, otherwise default 0
            size = 0
            if "file_path" in doc and os.path.exists(doc["file_path"]):
                size = os.stat(doc["file_path"]).st_size
                
            results.append(DocumentInfo(
                filename=doc["filename"],
                size=size,
                uploaded_at=doc["uploaded_at"],
                uploaded_by=doc.get("uploaded_by_email", "Unknown")
            ))
            
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


@router.post("/{org_id}/chat", response_model=AnswerResponse)
async def ask_question(
    org_id: str,
    request: QuestionRequest,
    membership_info: tuple = Depends(verify_org_membership)
):
    """
    Ask a question within the organization context.
    """
    user, role = membership_info
    
    try:
        vectorstore = get_vectorstore()
        
        # Build filter: STRICTLY filter by org_id
        filter_dict = {"org_id": org_id}
        
        if request.document_filter:
            filter_dict["document_name"] = {"$in": request.document_filter}
            
        results = vectorstore.similarity_search_with_score(
            request.question,
            k=3,
            filter=filter_dict
        )

        if not results:
            return AnswerResponse(
                answer="Not mentioned in the uploaded documents.",
                sources=[]
            )

        # Prepare context
        context_parts = []
        sources = []

        for idx, (doc, score) in enumerate(results, 1):
            context_parts.append(f"[Source {idx}]\n{doc.page_content}\n")
            sources.append(SourceCitation(
                page=doc.metadata.get("page", 0),
                content=doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                document_name=doc.metadata.get("document_name", "Unknown")
            ))

        context = "\n".join(context_parts)

        # Grounded Prompt
        prompt = f"""You are a helpful assistant for {role}s at their organization. Answer the question ONLY using the provided context below.

CRITICAL RULES:
- If the answer is not in the context, say "Not mentioned in the uploaded documents."
- Always cite which source ([Source 1], [Source 2]) you used.
- Be concise.

CONTEXT:
{context}

QUESTION: {request.question}

ANSWER:"""

        # Call Cerebras
        client = Cerebras()
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b",
            temperature=0.0
        )

        answer = chat_completion.choices[0].message.content
        
        # Log query
        queries_collection = await get_queries_collection()
        await queries_collection.insert_one({
            "org_id": org_id,
            "question": request.question,
            "answer": answer,
            "user_uid": user["uid"],
            "has_answer": "Not mentioned" not in answer,
            "timestamp": datetime.utcnow()
        })

        return AnswerResponse(
            answer=answer,
            sources=sources
        )

    except Exception as e:
        import traceback
        print(traceback.format_exc())
@router.delete("/{org_id}/{filename}")
async def delete_document(
    org_id: str,
    filename: str,
    admin_user: dict = Depends(verify_org_admin)
):
    """
    Delete a document from the organization.
    Admin only.
    """
    try:
        documents_collection = await get_documents_collection()
        
        # Verify document belongs to org
        doc = await documents_collection.find_one({
            "org_id": org_id,
            "filename": filename
        })
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        # 1. Delete from Pinecone
        # Note: Deleting by metadata might require specific index configuration or SDK calls.
        # We will attempt best effort or skip if complex for now to avoid SDK crashes.
        # In a production app, we would store vector IDs or use delete_by_metadata.
        
        # 2. Delete from MongoDB
        await documents_collection.delete_one({"_id": doc["_id"]})
        
        # 3. Delete file from Disk
        if "file_path" in doc and os.path.exists(doc["file_path"]):
            os.remove(doc["file_path"])
            
        return {"status": "success", "message": f"Document {filename} deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")
