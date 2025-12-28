#!/usr/bin/env python3
"""
Debug script to test Gemini and Pinecone APIs independently
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("API DEBUG SCRIPT")
print("=" * 60)

# Check environment variables
print("\n1. CHECKING ENVIRONMENT VARIABLES:")
print("-" * 60)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")

if GOOGLE_API_KEY:
    print(f"✓ GOOGLE_API_KEY found: {GOOGLE_API_KEY[:20]}...{GOOGLE_API_KEY[-5:]}")
else:
    print("✗ GOOGLE_API_KEY not found!")

if PINECONE_API_KEY:
    print(f"✓ PINECONE_API_KEY found: {PINECONE_API_KEY[:20]}...{PINECONE_API_KEY[-5:]}")
else:
    print("✗ PINECONE_API_KEY not found!")

print(f"✓ PINECONE_ENV: {PINECONE_ENV}")

# Test Google Gemini API
print("\n2. TESTING GOOGLE GEMINI API:")
print("-" * 60)

try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    
    # Test embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=GOOGLE_API_KEY
    )
    
    # Test with simple text
    test_text = "Hello, this is a test sentence."
    print(f"Testing embeddings with: '{test_text}'")
    
    result = embeddings.embed_query(test_text)
    
    print(f"✓ Gemini API is WORKING!")
    print(f"✓ Embedding dimension: {len(result)}")
    print(f"✓ First 5 values: {result[:5]}")
    
except Exception as e:
    print(f"✗ Gemini API FAILED!")
    print(f"Error: {str(e)}")
    import traceback
    print(traceback.format_exc())

# Test Pinecone API
print("\n3. TESTING PINECONE API:")
print("-" * 60)

try:
    from pinecone import Pinecone, ServerlessSpec
    
    # Initialize Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    print("✓ Pinecone client initialized")
    
    # List existing indexes
    indexes = pc.list_indexes()
    index_names = [index.name for index in indexes]
    
    print(f"✓ Connected to Pinecone successfully")
    print(f"✓ Existing indexes: {index_names if index_names else 'None'}")
    
    # Try to create or connect to test index
    test_index_name = "rulebook-ai"
    
    if test_index_name not in index_names:
        print(f"\n→ Creating new index: {test_index_name}")
        print("  This may take 1-2 minutes...")
        
        pc.create_index(
            name=test_index_name,
            dimension=768,  # Gemini embedding dimension
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region=PINECONE_ENV or "us-east-1"
            )
        )
        print(f"✓ Index '{test_index_name}' created successfully!")
    else:
        print(f"✓ Index '{test_index_name}' already exists")
    
    # Get index stats
    index = pc.Index(test_index_name)
    stats = index.describe_index_stats()
    
    print(f"\nIndex Statistics:")
    print(f"  - Total vectors: {stats.get('total_vector_count', 0)}")
    print(f"  - Dimension: {stats.get('dimension', 'N/A')}")
    
    print("\n✓ Pinecone is WORKING correctly!")
    
except Exception as e:
    print(f"✗ Pinecone API FAILED!")
    print(f"Error: {str(e)}")
    import traceback
    print(traceback.format_exc())

# Test full integration
print("\n4. TESTING FULL INTEGRATION:")
print("-" * 60)

try:
    from langchain_community.vectorstores import Pinecone as LangchainPinecone
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from pinecone import Pinecone
    
    # Initialize
    pc = Pinecone(api_key=PINECONE_API_KEY)
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=GOOGLE_API_KEY
    )
    
    # Get index
    index = pc.Index("rulebook-ai")
    
    # Create vectorstore
    vectorstore = LangchainPinecone(
        index=index,
        embedding=embeddings,
        text_key="text"
    )
    
    print("✓ Vectorstore created successfully!")
    
    # Test adding a document
    from langchain.schema import Document
    
    test_doc = Document(
        page_content="This is a test document for RuleBook AI.",
        metadata={"source": "debug_script", "page": 1}
    )
    
    print("→ Testing document upload...")
    vectorstore.add_documents([test_doc])
    
    print("✓ Document added successfully!")
    
    # Test similarity search
    print("→ Testing similarity search...")
    results = vectorstore.similarity_search("test document", k=1)
    
    if results:
        print(f"✓ Search working! Found {len(results)} result(s)")
        print(f"  Content: {results[0].page_content[:50]}...")
    else:
        print("⚠ Search returned no results")
    
    print("\n✓ FULL INTEGRATION WORKING!")
    
except Exception as e:
    print(f"✗ Integration FAILED!")
    print(f"Error: {str(e)}")
    import traceback
    print(traceback.format_exc())

print("\n" + "=" * 60)
print("DEBUG COMPLETE")
print("=" * 60)
