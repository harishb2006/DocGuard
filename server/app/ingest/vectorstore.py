import pinecone
from langchain_community.vectorstores import Pinecone
from langchain.embeddings import HuggingFaceEmbeddings
from config import PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX_NAME

def get_vectorstore():
    pinecone.init(
        api_key=PINECONE_API_KEY,
        environment=PINECONE_ENV
    )

    if PINECONE_INDEX_NAME not in pinecone.list_indexes():
        pinecone.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=384,  # sentence-transformers
            metric="cosine"
        )

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    index = pinecone.Index(PINECONE_INDEX_NAME)

    vectorstore = Pinecone(
        index=index,
        embedding=embeddings,
        text_key="text"
    )

    return vectorstore
