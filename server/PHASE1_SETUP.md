# DocGuard Server - Phase 1 Setup

## ✅ Changes Made

### 1. **Replaced sentence-transformers with Google Gemini Embeddings**
   - **Why**: Solved disk space issues and installation problems
   - **Benefits**: 
     - Free tier available (15 requests/minute)
     - No local model download needed
     - 768-dimensional embeddings (better quality than sentence-transformers' 384)

### 2. **Updated Dependencies**
   ```
   - Removed: sentence-transformers, torch (saves ~4GB)
   + Added: langchain-google-genai (lightweight API client)
   ```

### 3. **Updated Configuration**
   - [config.py](config.py): Added `GOOGLE_API_KEY`
   - [vectorstore.py](app/ingest/vectorstore.py): Using `GoogleGenerativeAIEmbeddings`
   - Pinecone index dimension: 384 → 768

## 🚀 Setup Instructions

### Step 1: Get Google AI API Key (FREE)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys:
# GOOGLE_API_KEY=your_google_api_key_here
# PINECONE_API_KEY=your_pinecone_key (optional for now)
# PINECONE_ENV=your_pinecone_env (optional for now)
```

### Step 3: Activate Virtual Environment
```bash
cd /home/harish/Documents/Important_project/Doc_Gaurd/DocGuard/server

# IMPORTANT: Always activate venv first
source venv/bin/activate

# Verify you're in venv (should show venv path)
which python
```

### Step 4: Test the Setup
```bash
python test_setup.py
```

## 📝 Project Structure

```
server/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── ingest/
│   │   ├── loader.py          # PDF loading
│   │   ├── splitter.py        # Text chunking
│   │   └── vectorstore.py     # Gemini embeddings + Pinecone
│   └── routes/
│       ├── admin.py
│       └── employee.py
├── config.py                   # Configuration
├── requirements.txt            # Dependencies
├── test_setup.py              # Setup verification
└── .env                       # API keys (create this)
```

## 🧪 Testing Phase 1 Features

### Test 1: Verify Imports
```bash
source venv/bin/activate
python test_setup.py
```

### Test 2: Start the Server
```bash
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Test 3: Upload a PDF (once server is running)
```bash
curl -X POST "http://localhost:8000/admin/upload-pdf" \
  -F "file=@your_document.pdf"
```

## 🔑 API Keys Required

| Service | Required | Cost | Get Key |
|---------|----------|------|---------|
| Google AI (Gemini) | ✅ Yes | FREE (15 req/min) | https://aistudio.google.com/app/apikey |
| Pinecone | For vector storage | FREE tier available | https://www.pinecone.io/ |

## 📊 Google Gemini Free Tier Limits
- **Requests**: 15 per minute
- **Embeddings**: 1,500 per day
- **Model**: embedding-001 (768 dimensions)
- **Perfect for**: Development and small-scale production

## ⚠️ Important Notes

### Always Activate Virtual Environment
```bash
# Run this BEFORE any pip or python command:
source venv/bin/activate

# Your terminal should show (venv) at the start
```

### Common Issues

**Issue**: "ModuleNotFoundError"
**Solution**: Make sure venv is activated (`source venv/bin/activate`)

**Issue**: "GOOGLE_API_KEY not found"
**Solution**: Create `.env` file with your API key

**Issue**: "Disk space error"
**Solution**: We solved this! Gemini uses API, no local models

## 🎯 Next Steps

1. ✅ Get Google API key and add to `.env`
2. ✅ Run `test_setup.py` to verify everything works
3. 🔄 Test embedding generation with sample text
4. 🔄 Set up Pinecone (optional, for vector storage)
5. 🔄 Test full PDF upload pipeline

## 📞 Support

If you encounter issues:
1. Check venv is activated
2. Run `python test_setup.py` to see what's failing
3. Check API key is in `.env` file
4. Verify internet connection (needed for Gemini API)
