# ✅ Phase 1 - Pre-Launch Checklist

## Before You Start

### 1. Install Backend Dependencies

```bash
cd server
source venv/bin/activate
pip install -r requirements.txt
```

**Expected packages:**
- fastapi==0.110.0
- langchain==0.1.20
- pinecone-client==5.0.0 ← **Updated!**
- langchain-pinecone==0.1.0 ← **New!**
- langchain-google-genai==1.0.1
- pypdf==4.2.0

### 2. Get API Keys (Both FREE!)

#### Google AI API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

#### Pinecone API Key
1. Go to: https://www.pinecone.io/
2. Sign up for free account
3. Go to "API Keys" section
4. Copy your API key

### 3. Configure Environment

```bash
cd server
cp .env.example .env
nano .env  # or use any text editor
```

Add your keys:
```env
GOOGLE_API_KEY=AIzaSy...your_actual_key_here
PINECONE_API_KEY=pcsk_...your_actual_key_here
PINECONE_ENV=us-east-1
```

---

## Start the Application

### Terminal 1: Backend

```bash
cd /home/harish/Documents/Important_project/Doc_Gaurd/DocGuard/server
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ Backend ready at: http://localhost:8000

### Terminal 2: Frontend

```bash
cd /home/harish/Documents/Important_project/Doc_Gaurd/DocGuard/client
npm run dev
```

**Expected output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ Frontend ready at: http://localhost:5173

---

## Test Phase 1 Features

### ✅ Test 1: Check Homepage

1. Open: http://localhost:5173
2. Should see:
   - "Your Policies, Instantly Searchable" heading
   - Three feature cards
   - Search bar at bottom
   - Beautiful gradient background

### ✅ Test 2: Upload a PDF

1. Click "Ingest Manuals" card or go to http://localhost:5173/upload
2. Click "Browse Files" or drag & drop a PDF
3. Click "Ingest to RuleBook"
4. Wait 10-30 seconds (embedding generation)
5. Should see: "Ingestion Complete!" with green checkmark

**Expected backend logs:**
```
INFO:     POST /admin/upload
INFO:     Response: {"status":"success","filename":"...","chunks_created":X}
```

### ✅ Test 3: Ask a Question

1. Click back button or go to http://localhost:5173/chat
2. Type a question related to your uploaded PDF
3. Press Enter or click Send button
4. Wait 3-5 seconds for response
5. Should see:
   - AI answer in white bubble
   - "Sources" section below
   - Document name, page number, and excerpt

**Expected backend logs:**
```
INFO:     POST /employee/ask
INFO:     Response: {"answer":"...","sources":[...]}
```

### ✅ Test 4: Verify Citations

1. Check that page numbers in sources are correct
2. Verify excerpts match the actual document
3. Try different questions to test retrieval quality

---

## Common Issues & Fixes

### ❌ Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
source venv/bin/activate  # Make sure venv is active
pip install -r requirements.txt
```

---

### ❌ "Import langchain_pinecone could not be resolved"

**This is expected!** The package will be installed when you run:
```bash
pip install -r requirements.txt
```

If already installed but still showing error, it's a VSCode cache issue. Restart VSCode.

---

### ❌ Upload fails with "Connection refused"

**Fix:** Make sure backend is running on port 8000:
```bash
curl http://localhost:8000/
# Should return: {"message":"RuleBook AI Backend - Phase 1","status":"active"}
```

---

### ❌ "API key not found" error

**Fix:** Check your `.env` file:
```bash
cd server
cat .env
# Should show your actual API keys (not "your_key_here")
```

---

### ❌ No answers returned / Empty sources

**Cause:** No documents uploaded yet or question unrelated to content

**Fix:**
1. Upload a relevant PDF first
2. Ask questions about topics in that PDF
3. Check Pinecone dashboard to verify vectors exist

---

### ❌ Frontend shows "Failed to get answer"

**Fix:**
1. Open browser console (F12) and check error
2. Verify backend is running: http://localhost:8000/
3. Check CORS is enabled in `server/app/main.py`

---

## Verification Commands

### Check Backend Health
```bash
curl http://localhost:8000/
```

Should return:
```json
{"message":"RuleBook AI Backend - Phase 1","status":"active"}
```

### Test Upload Endpoint
```bash
curl -X POST "http://localhost:8000/admin/upload" \
  -F "file=@/path/to/your/document.pdf"
```

### Test Ask Endpoint
```bash
curl -X POST "http://localhost:8000/employee/ask" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the remote work policy?"}'
```

---

## Success Criteria ✅

Phase 1 is working correctly if:

- [x] Backend starts without errors
- [x] Frontend loads at localhost:5173
- [x] Can upload a PDF successfully
- [x] Can ask questions and get answers
- [x] Answers include source citations
- [x] Page numbers are accurate
- [x] No hallucinations (answers based on docs)

---

## Next Steps After Phase 1

Once everything works:

1. **Read full docs:** [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)
2. **Try different PDFs:** Employee handbooks, travel policies, etc.
3. **Test edge cases:** Questions not in docs (should say "I don't know")
4. **Plan Phase 2:** Multi-doc library, auth, analytics

---

## Quick Reference

| Component | URL | Port |
|-----------|-----|------|
| Backend API | http://localhost:8000 | 8000 |
| Frontend UI | http://localhost:5173 | 5173 |
| API Docs | http://localhost:8000/docs | 8000 |

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Home with features |
| Upload | `/upload` | Admin PDF ingestion |
| Chat | `/chat` | Employee Q&A |

---

**Ready to test? Start both servers and open http://localhost:5173!** 🚀
