"""
Test script to verify the setup is working correctly
Phase 1: Test Gemini embeddings and basic functionality
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_google_api():
    """Test if Google API key is configured"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GOOGLE_API_KEY not found in .env file")
        print("   Get your key from: https://aistudio.google.com/app/apikey")
        return False
    print(f"✓ Google API key found (starts with: {api_key[:10]}...)")
    return True

def test_gemini_embeddings():
    """Test Gemini embeddings"""
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        from config import GOOGLE_API_KEY
        
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=GOOGLE_API_KEY
        )
        
        # Test embedding
        test_text = "This is a test document for embedding."
        result = embeddings.embed_query(test_text)
        
        print(f"✓ Gemini embeddings working! (dimension: {len(result)})")
        return True
    except Exception as e:
        print(f"❌ Gemini embeddings failed: {e}")
        return False

def test_pdf_loader():
    """Test PDF loading"""
    try:
        from app.ingest.loader import load_pdf
        print("✓ PDF loader imported successfully")
        return True
    except Exception as e:
        print(f"❌ PDF loader failed: {e}")
        return False

def test_text_splitter():
    """Test text splitter"""
    try:
        from app.ingest.splitter import split_documents
        print("✓ Text splitter imported successfully")
        return True
    except Exception as e:
        print(f"❌ Text splitter failed: {e}")
        return False

def test_pinecone_config():
    """Test Pinecone configuration"""
    api_key = os.getenv("PINECONE_API_KEY")
    env = os.getenv("PINECONE_ENV")
    
    if not api_key or not env:
        print("⚠️  Pinecone not configured (optional for now)")
        print("   Get your keys from: https://www.pinecone.io/")
        return False
    
    print(f"✓ Pinecone configured")
    return True

if __name__ == "__main__":
    print("="*50)
    print("DocGuard Phase 1 - Setup Test")
    print("="*50)
    print()
    
    tests = [
        ("Google API Configuration", test_google_api),
        ("PDF Loader", test_pdf_loader),
        ("Text Splitter", test_text_splitter),
        ("Pinecone Configuration", test_pinecone_config),
    ]
    
    # Only test embeddings if API key is present
    if os.getenv("GOOGLE_API_KEY"):
        tests.insert(1, ("Gemini Embeddings", test_gemini_embeddings))
    
    results = []
    for name, test_func in tests:
        print(f"\nTesting: {name}")
        print("-" * 40)
        results.append((name, test_func()))
    
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if not os.getenv("GOOGLE_API_KEY"):
        print("\n⚠️  ACTION REQUIRED:")
        print("1. Create a .env file (copy from .env.example)")
        print("2. Get Google API key: https://aistudio.google.com/app/apikey")
        print("3. Add: GOOGLE_API_KEY=your_key_here")
