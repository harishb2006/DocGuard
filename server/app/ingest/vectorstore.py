import os
import sys

import pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_cohere import CohereEmbeddings

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
    pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV or "us-east-1")

    # Check if index exists, create if not
    if PINECONE_INDEX_NAME not in pinecone.list_indexes():
        pinecone.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=1024,  # Cohere embed-english-v3.0 dimension
            metric="cosine"
        )

    # Initialize Cohere embeddings
    embeddings = CohereEmbeddings(
        cohere_api_key=COHERE_API_KEY,
        model="embed-english-v3.0"
    )

    # Connect to index
    index = pinecone.Index(PINECONE_INDEX_NAME)

    # Create LangChain vector store
    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        text_key="text"
    )

    return vectorstore
