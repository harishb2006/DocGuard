"""
Script to recreate Pinecone index with correct dimensions (384 for HuggingFace)
"""
from dotenv import load_dotenv
load_dotenv()

from pinecone import Pinecone
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME

def recreate_index():
    # Initialize Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Get list of existing indexes
    index_names = [index.name for index in pc.list_indexes()]
    
    print(f"Existing indexes: {index_names}")
    
    # Delete old index if it exists
    if PINECONE_INDEX_NAME in index_names:
        print(f"Deleting old index: {PINECONE_INDEX_NAME}")
        pc.delete_index(PINECONE_INDEX_NAME)
        print(f"✓ Index '{PINECONE_INDEX_NAME}' deleted successfully")
    else:
        print(f"Index '{PINECONE_INDEX_NAME}' not found, nothing to delete")
    
    print("\nNext time you upload a PDF, a new index will be created with dimension=384")

if __name__ == "__main__":
    recreate_index()
