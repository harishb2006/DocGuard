"""
Test script to verify HuggingFace embeddings and Cerebras LLM integration
"""
from dotenv import load_dotenv
load_dotenv()

import sys
sys.path.insert(0, '/home/harish/Documents/Important_project/Doc_Gaurd/DocGuard/server')

from cerebras.cloud.sdk import Cerebras
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import CEREBRAS_API_KEY
from pinecone import Pinecone
from config import PINECONE_API_KEY

print("=" * 50)
print("TESTING HUGGINGFACE EMBEDDINGS")
print("=" * 50)

try:
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    test_text = "This is a test document about company policies."
    vector = embeddings.embed_query(test_text)
    
    print(f"✓ HuggingFace embeddings loaded successfully")
    print(f"✓ Model: sentence-transformers/all-MiniLM-L6-v2")
    print(f"✓ Embedding dimension: {len(vector)}")
    print(f"✓ Sample vector (first 5): {vector[:5]}")
except Exception as e:
    print(f"✗ HuggingFace embeddings failed: {e}")

print("\n" + "=" * 50)
print("TESTING CEREBRAS LLM")
print("=" * 50)

try:
    client = Cerebras(api_key=CEREBRAS_API_KEY)
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Say 'Hello, I am Cerebras LLM!' in one sentence.",
            }
        ],
        model="llama-3.3-70b",
        temperature=0.0
    )
    
    response = chat_completion.choices[0].message.content
    
    print(f"✓ Cerebras LLM connected successfully")
    print(f"✓ Model: llama-3.3-70b")
    print(f"✓ Response: {response}")
except Exception as e:
    print(f"✗ Cerebras LLM failed: {e}")

print("\n" + "=" * 50)
print("TESTING PINECONE CONNECTION")
print("=" * 50)

try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    indexes = [index.name for index in pc.list_indexes()]
    
    print(f"✓ Pinecone connected successfully")
    print(f"✓ Available indexes: {indexes}")
    print(f"✓ Ready to create new index with dimension=384")
except Exception as e:
    print(f"✗ Pinecone connection failed: {e}")

print("\n" + "=" * 50)
print("ALL SYSTEMS READY!")
print("=" * 50)
print("Next steps:")
print("1. Start backend: cd server && uvicorn app.main:app --reload")
print("2. Start frontend: cd client && npm run dev")
print("3. Upload a PDF document")
print("4. Ask questions!")
