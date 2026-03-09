from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from langchain_groq import ChatGroq
import tempfile
import os
import uuid
from typing import List, Optional
from datetime import datetime

from ..ingest.loader import load_pdf
from ..ingest.splitter import split_documents
from ..ingest.vectorstore import get_vectorstore
from ..auth.firebase_auth import verify_firebase_token
from ..db.mongodb import get_documents_collection, get_users_collection, get_queries_collection
from ..models.organization import RoleEnum
from config import GROQ_API_KEY, GROQ_MODEL

router = APIRouter()

# --- Dependencies ---

async def verify_org_membership(org_id: str, token_data: dict = Depends(verify_firebase_token)):
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
    user, role = await verify_org_membership(org_id, token_data)
    if role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Organization Admin privileges required")
    return user

from ..models.document import DocumentInfo, QuestionRequest, SourceCitation, AnswerResponse

# --- Routes ---

@router.post("/{org_id}/upload")
async def upload_pdf(
    org_id: str,
    file: UploadFile = File(...),
    admin_user: dict = Depends(verify_org_admin)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Security Fix: Prevent Path Traversal
        safe_filename = os.path.basename(file.filename)
        
        # Unique ID to track the document in Pinecone for later deletion
        document_id = str(uuid.uuid4())
        
        # Read file content and get size
        content = await file.read()
        file_size = len(content)
        
        # Use temp file for processing (auto-deleted after)
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp_file:
            tmp_file.write(content)
            tmp_file.flush()
            
            # Process PDF from temp file
            documents = await run_in_threadpool(load_pdf, tmp_file.name)
            chunks = await run_in_threadpool(split_documents, documents)
        
        # Add metadata including our tracking document_id
        for chunk in chunks:
            chunk.metadata.update({
                "document_name": safe_filename,
                "document_id": document_id,
                "org_id": org_id
            })
        
        # Offload network call to Pinecone to threadpool
        vectorstore = get_vectorstore()
        await run_in_threadpool(vectorstore.add_documents, chunks)
        
        # Save document metadata to MongoDB (no file_path needed - embeddings are in Pinecone)
        documents_collection = await get_documents_collection()
        await documents_collection.insert_one({
            "document_id": document_id, 
            "org_id": org_id,
            "filename": safe_filename,
            "file_size": file_size,  # Store size in MongoDB
            "pages": len(documents),
            "chunks_created": len(chunks),
            "uploaded_by": admin_user["uid"],
            "uploaded_by_email": admin_user.get("email", "unknown"),
            "uploaded_at": datetime.utcnow(),
            "status": "active"
        })
        
        return {
            "status": "success",
            "filename": safe_filename,
            "pages": len(documents),
            "chunks_created": len(chunks),
            "message": "Document successfully ingested"
        }
    
    except Exception as e:
        import traceback
        print(f"ERROR: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


@router.get("/{org_id}/list", response_model=List[DocumentInfo])
async def list_documents(org_id: str, membership_info: tuple = Depends(verify_org_membership)):
    try:
        documents_collection = await get_documents_collection()
        docs = await documents_collection.find({"org_id": org_id}).to_list(length=100)
        
        results = []
        for doc in docs:
            results.append(DocumentInfo(
                filename=doc["filename"],
                size=doc.get("file_size", 0),  # Get from MongoDB, not filesystem
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
    user, role = membership_info
    
    try:
        vectorstore = get_vectorstore()
        
        filter_dict = {"org_id": org_id}
        if request.document_filter:
            filter_dict["document_name"] = {"$in": request.document_filter}
            
        # Threadpool for Pinecone network call
        results = await run_in_threadpool(
            vectorstore.similarity_search_with_score,
            request.question,
            k=3,
            filter=filter_dict
        )

        if not results:
            return AnswerResponse(answer="Not mentioned in the uploaded documents.", sources=[])

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
        prompt = f"""You are a helpful assistant for {role}s at their organization. Answer the question ONLY using the provided context below.
CRITICAL RULES:
- If the answer is not in the context, say "Not mentioned in the uploaded documents."
- Always cite which source ([Source 1], [Source 2]) you used.
- Be concise.

CONTEXT:
{context}

QUESTION: {request.question}
ANSWER:"""

        llm = ChatGroq(model=GROQ_MODEL, api_key=GROQ_API_KEY, temperature=0.0)
        
        # Threadpool for Groq API call to prevent blocking
        response = await run_in_threadpool(llm.invoke, prompt)
        answer = response.content
        
        queries_collection = await get_queries_collection()
        await queries_collection.insert_one({
            "org_id": org_id,
            "question": request.question,
            "answer": answer,
            "user_uid": user["uid"],
            "has_answer": "Not mentioned" not in answer,
            "timestamp": datetime.utcnow()
        })

        return AnswerResponse(answer=answer, sources=sources)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")


@router.delete("/{org_id}/{filename}")
async def delete_document(
    org_id: str,
    filename: str,
    admin_user: dict = Depends(verify_org_admin)
):
    try:
        documents_collection = await get_documents_collection()
        
        # Security: Sanitize filename before database operations
        safe_filename = os.path.basename(filename)
        
        doc = await documents_collection.find_one({
            "org_id": org_id,
            "filename": safe_filename
        })
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        # 1. Delete from Pinecone cleanly using the tracked ID
        document_id = doc.get("document_id")
        if document_id:
            vectorstore = get_vectorstore()
            await run_in_threadpool(
                vectorstore.delete,
                filter={"document_id": document_id}
            )
        
        # 2. Delete from MongoDB
        await documents_collection.delete_one({"_id": doc["_id"]})
        
        # No local file to delete - embeddings were in Pinecone, metadata in MongoDB
            
        return {"status": "success", "message": f"Document {safe_filename} deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}"}