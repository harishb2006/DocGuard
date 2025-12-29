from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
import shutil
import os
from typing import List
from datetime import datetime

from ..ingest.loader import load_pdf
from ..ingest.splitter import split_documents
from ..ingest.vectorstore import get_vectorstore
from ..auth.firebase_auth import verify_firebase_token
from ..db.mongodb import get_documents_collection, get_users_collection, get_queries_collection

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def verify_admin_access(token_data: dict = Depends(verify_firebase_token)):
    """Dependency to verify admin access"""
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"uid": token_data["uid"]})
    
    if not user or not user.get("is_admin", False):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    
    return user


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    admin_user: dict = Depends(verify_admin_access)
):
    """
    Admin endpoint to upload and process PDF documents
    Pipeline: Upload -> Load -> Chunk -> Embed -> Store in Pinecone
    Requires: Admin authentication
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Load PDF
        documents = load_pdf(file_path)
        
        # Split into chunks
        chunks = split_documents(documents)
        
        # Add metadata
        for chunk in chunks:
            chunk.metadata["document_name"] = file.filename
        
        # Store in Pinecone
        vectorstore = get_vectorstore()
        vectorstore.add_documents(chunks)
        
        # Save document metadata to MongoDB
        documents_collection = await get_documents_collection()
        await documents_collection.insert_one({
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
            "message": "Document successfully ingested into vector database"
        }
    
    except Exception as e:
        import tracebackadmin_user: dict = Depends(verify_admin_access)):
    """
    List all uploaded documents in the uploads directory
    Requires: Admin authentication
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


class DocumentInfo(BaseModel):
    filename: str
    size: int
    uploaded_at: str


@router.get("/documents", response_model=List[DocumentInfo])
async def list_documents():
    """
    List all uploaded documents in the uploads directory
    """
    try:
        documents = []
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                if filename.endswith('.pdf'):
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    file_stat = os.stat(file_path)
                    documents.append(DocumentInfo(
                        filename=filename,
                        size=file_stat.st_size,
                        uploaded_at=datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                    ))
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


@router.delete("/documents/{filename}"), admin_user: dict = Depends(verify_admin_access)):
    """
    Delete a document from uploads directory and its vectors from Pinecone
    Requires: Admin authentication
    Delete a document from uploads directory and its vectors from Pinecone
    Note: Pinecone deletion by metadata filter requires upsert IDs tracking
    For now, we just delete the file. Full vector cleanup would need enhanced metadata.
    """
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete file
        os.remove(file_path)
        
        return {
            "status": "success",
            "message": f"Document {filename} deleted successfully",
            "note": "Vector embeddings remain in Pinecone (would need enhanced tracking for full cleanup)"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")


@router.get("/stats")
async def get_stats(admin_user: dict = Depends(verify_admin_access)):
    """
    Get statistics about uploaded documents and vector store
    Requires: Admin authentication
    """
    try:
        vectorstore = get_vectorstore()
        documents_collection = await get_documents_collection()
        users_collection = await get_users_collection()
        queries_collection = await get_queries_collection()
        
        # Count documents in uploads folder
        doc_count = 0
        total_size = 0
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                if filename.endswith('.pdf'):
                    doc_count += 1
                    total_size += os.stat(os.path.join(UPLOAD_DIR, filename)).st_size
        
        # Get MongoDB stats
        total_documents = await documents_collection.count_documents({})
        total_users = await users_collection.count_documents({})
        total_queries = await queries_collection.count_documents({})
        
        return {
            "total_documents": doc_count,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "total_users": total_users,
            "total_queries": total_queries,
            "mongodb_documents": total_documents,
            "vector_store": "Pinecone (connected)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")


@router.get("/analytics/queries")
async def get_query_analytics(
    limit: int = 100,
    admin_user: dict = Depends(verify_admin_access)
):
    """
    Get analytics on employee queries - shows most common questions
    Helps HR identify confusing policies
    Requires: Admin authentication
    """
    try:
        queries_collection = await get_queries_collection()
        
        # Get recent queries
        queries = await queries_collection.find().sort(
            "timestamp", -1
        ).limit(limit).to_list(length=limit)
        
        # Get query frequency (word cloud data)
        pipeline = [
            {"$group": {
                "_id": "$question",
                "count": {"$sum": 1},
                "last_asked": {"$max": "$timestamp"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]
        
        common_queries = await queries_collection.aggregate(pipeline).to_list(length=20)
        
        return {
            "recent_queries": [
                {
                    "question": q.get("question"),
                    "user_email": q.get("user_email"),
                    "timestamp": q.get("timestamp"),
                    "has_answer": q.get("has_answer", True)
                }
                for q in queries
            ],
            "common_queries": [
                {
                    "question": q["_id"],
                    "count": q["count"],
                    "last_asked": q["last_asked"]
                }
                for q in common_queries
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting query analytics: {str(e)}"
        )


@router.get("/analytics/word-cloud")
async def get_word_cloud_data(admin_user: dict = Depends(verify_admin_access)):
    """
    Generate word cloud data from employee queries
    Returns word frequency for visualization
    Requires: Admin authentication
    """
    try:
        queries_collection = await get_queries_collection()
        
        # Get all questions
        all_queries = await queries_collection.find(
            {},
            {"question": 1}
        ).to_list(length=1000)
        
        # Simple word frequency analysis
        from collections import Counter
        import re
        
        # Combine all questions
        all_text = " ".join([q.get("question", "") for q in all_queries])
        
        # Remove common words (stop words)
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'i', 'you', 'we',
            'they', 'what', 'when', 'where', 'why', 'how', 'which', 'who'
        }
        
        # Extract words (alphabetic only, lowercase)
        words = re.findall(r'\b[a-z]+\b', all_text.lower())
        filtered_words = [w for w in words if w not in stop_words and len(w) > 3]
        
        # Count frequency
        word_freq = Counter(filtered_words)
        
        # Get top 50 words
        top_words = word_freq.most_common(50)
        
        return {
            "words": [
                {"text": word, "value": count}
                for word, count in top_words
            ],
            "total_queries": len(all_queries)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating word cloud: {str(e)}"
        )

