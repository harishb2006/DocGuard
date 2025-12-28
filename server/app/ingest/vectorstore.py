from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_cohere import CohereEmbeddings
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX_NAME, COHERE_API_KEY

def get_vectorstore():
    # Initialize Pinecone with new API
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists
    index_names = [index.name for index in pc.list_indexes()]
    
    if PINECONE_INDEX_NAME not in index_names:
        # Create index with serverless spec
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=1024,  # Cohere embed-english-v3.0 dimension
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region=PINECONE_ENV or "us-east-1"
            )
        )
    
    # Initialize Cohere embeddings (API-based, free tier, no downloads)
    embeddings = CohereEmbeddings(
        cohere_api_key=COHERE_API_KEY,
        model="embed-english-v3.0"
    )
    
    # Get index
    index = pc.Index(PINECONE_INDEX_NAME)
    
    # Create vectorstore using langchain-pinecone
    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        text_key="text"
    )
    
    return vectorstore
