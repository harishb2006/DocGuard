from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os

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
