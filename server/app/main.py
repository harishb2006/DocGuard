from fastapi import FastAPI, UploadFile, File
import shutil
import os

from ingest.loader import load_pdf
from ingest.splitter import split_documents
from ingest.vectorstore import get_vectorstore

app = FastAPI(title="RuleBook AI – Admin Ingestion")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/admin/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file
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
        "chunks_created": len(chunks)
    }
