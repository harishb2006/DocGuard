from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import shutil
import os

# Load environment variables
load_dotenv()

from .ingest.loader import load_pdf
from .ingest.splitter import split_documents
from .ingest.vectorstore import get_vectorstore
from .routes import admin, employee

app = FastAPI(title="RuleBook AI – Corporate Q&A")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(employee.router, prefix="/employee", tags=["Employee"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "RuleBook AI Backend - Phase 1", "status": "active"}

@app.get("/health")
def health_check():
    """Check if all dependencies are working"""
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    status = {
        "server": "running",
        "google_api_key": "set" if os.getenv("GOOGLE_API_KEY") else "missing",
        "pinecone_api_key": "set" if os.getenv("PINECONE_API_KEY") else "missing",
        "pinecone_env": os.getenv("PINECONE_ENV", "not set")
    }
    return status

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
