import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Pinecone Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX_NAME = "rulebook-ai"

# LLM APIs
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:7b")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# MongoDB Configuration (Now securely loaded)
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set! Check your .env file.")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "rulebook_ai")

# Firebase Configuration
# SECURITY: Never hardcode credentials path, use environment variable
FIREBASE_CREDENTIALS_PATH = os.getenv(
    "FIREBASE_CREDENTIALS_PATH",
    os.path.join(os.path.dirname(__file__), "app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json")
)
if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
    raise ValueError(f"Firebase credentials file not found at: {FIREBASE_CREDENTIALS_PATH}")

# Document Processing
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

# Upload Configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB