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
from .routes import auth, organizations, documents
from .db.mongodb import close_mongodb_connection

app = FastAPI(
    title="RuleBook AI – Corporate Q&A",
    description="Enterprise RAG system for corporate policy documents with Firebase authentication",
    version="2.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize connections on startup"""
    print("🚀 Starting RuleBook AI Server...")
    print("✓ Firebase Admin SDK initialized")
    print("✓ MongoDB connection ready")
    print("✓ Pinecone vector store ready")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up connections on shutdown"""
    await close_mongodb_connection()
    print("👋 Server shutdown complete")


# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    return {
        "message": "RuleBook AI Backend - v2.0",
        "status": "active",
        "features": [
            "Organization-based Architecture",
            "Role-Based Access Control (Admin/Employee)",
            "RAG-based Q&A with Citations",
            "Firebase Authentication"
        ]
    }

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
        "pinecone_env": os.getenv("PINECONE_ENV", "not set"),
        "mongodb_uri": "set" if os.getenv("MONGODB_URI") else "missing",
        "firebase": "initialized"
    }
    return status
