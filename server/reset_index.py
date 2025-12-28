"""
Reset Pinecone index to use new embedding dimensions
"""
from pinecone import Pinecone
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "rulebook-ai"

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

# Delete old index if exists
index_names = [index.name for index in pc.list_indexes()]
if PINECONE_INDEX_NAME in index_names:
    print(f"Deleting old index '{PINECONE_INDEX_NAME}'...")
    pc.delete_index(PINECONE_INDEX_NAME)
    print("✅ Old index deleted successfully!")
else:
    print(f"Index '{PINECONE_INDEX_NAME}' doesn't exist yet.")

print("\nNext time you start the server, it will create a new index with 1024 dimensions for Cohere embeddings.")
