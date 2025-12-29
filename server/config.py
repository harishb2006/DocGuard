import os

# Pinecone Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX_NAME = "rulebook-ai"

# LLM APIs
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# MongoDB Configuration
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://Harishb2006:<db_password>@cluster0.ybfsvu0.mongodb.net/?appName=Cluster0"
)
MONGODB_DB_NAME = "rulebook_ai"

# Firebase Configuration
FIREBASE_CREDENTIALS_PATH = os.path.join(
    os.path.dirname(__file__),
    "app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json"
)

# Document Processing
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

# Upload Configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
