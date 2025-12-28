import pinecone
from langchain_community.vectorstores import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX_NAME, GOOGLE_API_KEY

def get_vectorstore():
    pinecone.init(
        api_key=PINECONE_API_KEY,
        environment=PINECONE_ENV
    )

    if PINECONE_INDEX_NAME not in pinecone.list_indexes():
        pinecone.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=768,  # Gemini embedding dimension
            metric="cosine"
        )

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=GOOGLE_API_KEY
    )

    index = pinecone.Index(PINECONE_INDEX_NAME)

    vectorstore = Pinecone(
        index=index,
        embedding=embeddings,
        text_key="text"
    )

    return vectorstore
