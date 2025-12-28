from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import shutil
import os
from typing import List
from datetime import datetime

from ..ingest.loader import load_pdf
from ..ingest.splitter import split_documents
from ..ingest.vectorstore import get_vectorstore

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Admin endpoint to upload and process PDF documents
    Pipeline: Upload -> Load -> Chunk -> Embed -> Store in Pinecone
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
        
        return {
            "status": "success",
            "filename": file.filename,
            "pages": len(documents),
            "chunks_created": len(chunks),
            "message": "Document successfully ingested into vector database"
        }
    
    except Exception as e:
        import traceback
        print(f"ERROR in upload: {str(e)}")
        print(traceback.format_exc())
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


@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    """
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
async def get_stats():
    """
    Get statistics about uploaded documents and vector store
    """
    try:
        vectorstore = get_vectorstore()
        
        # Count documents in uploads folder
        doc_count = 0
        total_size = 0
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                if filename.endswith('.pdf'):
                    doc_count += 1
                    total_size += os.stat(os.path.join(UPLOAD_DIR, filename)).st_size
        
        return {
            "total_documents": doc_count,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "vector_store": "Pinecone (connected)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")
