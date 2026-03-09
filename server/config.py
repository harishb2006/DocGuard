import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Pinecone Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX_NAME = "rulebook-ai"

# LLM APIs
GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # Set in .env or Render dashboard
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# MongoDB Configuration (Now securely loaded)
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set! Check your .env file.")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "rulebook_ai")

# Firebase Configuration
# SECURITY: Use environment variable for credentials JSON in production (Render)
# For local dev, can still use file path
FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON")  # JSON string for Render
FIREBASE_CREDENTIALS_PATH = os.getenv(
    "FIREBASE_CREDENTIALS_PATH",
    os.path.join(os.path.dirname(__file__), "app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json")
)

# Validate: Either JSON env var OR file path must exist
if not FIREBASE_CREDENTIALS_JSON and not os.path.exists(FIREBASE_CREDENTIALS_PATH):
    raise ValueError(
        "Firebase credentials not found! Set FIREBASE_CREDENTIALS_JSON env var "
        "or provide a valid FIREBASE_CREDENTIALS_PATH"
    )

# Document Processing
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

# Upload Configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB