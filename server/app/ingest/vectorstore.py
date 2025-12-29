
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_cohere import CohereEmbeddings
import time
import sys
import os

# Add project root to PYTHONPATH
sys.path.insert(
    0,
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    )
)

from config import (
    PINECONE_API_KEY,
    PINECONE_ENV,
    PINECONE_INDEX_NAME,
    COHERE_API_KEY
)



def get_vectorstore():
    """
    Creates or connects to a Pinecone vector store using Cohere embeddings.
    Compatible with LangChain 1.x and Pinecone SDK v3+.
    """
    # Initialize Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)

    # Check if index exists, create if not
    existing_indexes = [index.name for index in pc.list_indexes()]

    if PINECONE_INDEX_NAME not in existing_indexes:
        # Default to serverless if not specified, assuming us-east-1
        # If user has PINECONE_ENV set to something specific, we try to use it
        # But for Serverless spec, we need cloud and region.
        # This is a best-effort conversion.
        
        # Simple heuristic: if ENV looks like a region
        region = PINECONE_ENV if PINECONE_ENV else "us-east-1"
        cloud = "aws" # Default to aws

        try:
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1024,  # Cohere embed-english-v3.0 dimension
                metric="cosine",
                spec=ServerlessSpec(
                    cloud=cloud,
                    region=region
                )
            )
            # Wait for index to be ready
            time.sleep(10)
        except Exception as e:
            print(f"Index creation failed (might be pod-based or invalid region): {e}")
            # Fallback or just re-raise
            raise e

    # Initialize Cohere embeddings
    embeddings = CohereEmbeddings(
        cohere_api_key=COHERE_API_KEY,
        model="embed-english-v3.0"
    )

    # Connect to index
    index = pc.Index(PINECONE_INDEX_NAME)

    # Create LangChain vector store
    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        text_key="text"
    )

    return vectorstore
