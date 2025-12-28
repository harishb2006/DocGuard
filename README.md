# 🛡️ RuleBook AI - Corporate Q&A System

> Transform static policy documents into an interactive AI consultant. No more hunting through 100-page PDFs!

## 🎯 What is RuleBook AI?

RuleBook AI is an **enterprise RAG (Retrieval-Augmented Generation)** system that turns your company's policy documents into an intelligent Q&A chatbot. Employees can ask questions in natural language and get accurate, cited answers **without hallucinations**.

### Key Features

✅ **PDF Document Ingestion** - Upload HR policies, travel guidelines, employee handbooks  
✅ **Intelligent Chunking** - Breaks documents into semantic segments with overlap  
✅ **Vector Search** - Fast similarity search using Pinecone  
✅ **Grounded AI Responses** - LLM only uses your uploaded documents  
✅ **Source Citations** - Every answer includes page numbers and document excerpts  
✅ **Beautiful UI** - Modern, ChatGPT-like interface  

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Admin     │─────▶│   FastAPI    │─────▶│  Pinecone   │
│  Upload PDF │      │   Backend    │      │  Vector DB  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            │ RAG Pipeline
                            ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Employee   │◀─────│   Employee   │◀─────│   Google    │
│  Asks Q's   │      │   Chat UI    │      │   Gemini    │
└─────────────┘      └──────────────┘      └─────────────┘
```

### Tech Stack

- **Backend**: FastAPI, LangChain, Python
- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Embeddings**: Google Gemini (768-dim, FREE)
- **Vector DB**: Pinecone (FREE tier)
- **LLM**: Google Gemini 1.5 Flash

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Google AI API Key ([Get FREE key](https://aistudio.google.com/app/apikey))
- Pinecone API Key ([Get FREE account](https://www.pinecone.io/))

### Option 1: Automated Setup (Recommended)

```bash
cd DocGuard
./start.sh
```

Then edit `server/.env` with your API keys and follow the instructions.

### Option 2: Manual Setup

#### Backend

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📚 Usage Guide

### 1️⃣ Upload Documents (Admin)

1. Navigate to `/upload` page
2. Select a PDF file (e.g., employee handbook)
3. Click "Ingest to RuleBook"
4. Wait for processing (~10-30 seconds)

The system will:
- Extract text from PDF
- Split into 500-word chunks with 100-word overlap
- Generate embeddings using Google Gemini
- Store in Pinecone vector database

### 2️⃣ Ask Questions (Employee)

1. Navigate to `/chat` page or use the search bar
2. Type your question: *"What's the remote work policy?"*
3. Press Enter
4. Get answer with source citations

The system will:
- Search for 3 most relevant document chunks
- Send to Gemini with grounding prompt
- Return answer with page numbers and excerpts

---

## 📁 Project Structure

```
DocGuard/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Home with features
│   │   │   ├── UploadPage.tsx    # Admin PDF upload
│   │   │   └── ChatPage.tsx      # Employee Q&A
│   │   └── App.tsx               # Routes
│   └── package.json
│
├── server/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py               # API + CORS + Routers
│   │   ├── routes/
│   │   │   ├── admin.py          # /admin/upload
│   │   │   └── employee.py       # /employee/ask
│   │   └── ingest/
│   │       ├── loader.py         # PDF loading
│   │       ├── splitter.py       # Text chunking
│   │       └── vectorstore.py    # Pinecone integration
│   ├── config.py                 # Configuration
│   ├── requirements.txt
│   └── .env                      # API keys (create this)
│
├── PHASE1_COMPLETE.md         # Detailed docs
└── README.md                  # This file
```

---

## 🔑 API Endpoints

### Admin

**POST** `/admin/upload`  
Upload and process a PDF document.

```bash
curl -X POST "http://localhost:8000/admin/upload" \
  -F "file=@handbook.pdf"
```

Response:
```json
{
  "status": "success",
  "filename": "handbook.pdf",
  "pages": 45,
  "chunks_created": 89
}
```

### Employee

**POST** `/employee/ask`  
Ask a question about uploaded documents.

```bash
curl -X POST "http://localhost:8000/employee/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the leave policy?"}'
```

Response:
```json
{
  "answer": "According to the handbook, employees are entitled to...",
  "sources": [
    {
      "page": 14,
      "content": "Employees are entitled to 15 days...",
      "document_name": "handbook.pdf"
    }
  ]
}
```

---

## 🎨 Features in Detail

### RAG Pipeline (Retrieval-Augmented Generation)

1. **Chunking**: Documents split into overlapping segments
2. **Embedding**: Each chunk converted to 768-dim vector
3. **Indexing**: Stored in Pinecone with metadata
4. **Retrieval**: Top-3 similar chunks found for each query
5. **Generation**: LLM generates answer using only retrieved context

### Grounding Prompt

The system uses a strict prompt to prevent hallucinations:

```
You are a corporate policy assistant. Answer ONLY using the context below.

RULES:
- If answer not in context, say "I don't have information about that"
- Always cite sources ([Source 1], [Source 2])
- Be concise and professional
- Never make up information

CONTEXT: [Retrieved chunks]
QUESTION: [User question]
```

---

## 🔧 Configuration

### Environment Variables

Create `server/.env`:

```env
# Required
GOOGLE_API_KEY=your_google_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENV=us-east-1

# Optional
PINECONE_INDEX_NAME=rulebook-ai
CHUNK_SIZE=500
CHUNK_OVERLAP=100
```

### Adjusting Chunk Size

Edit `server/config.py`:

```python
CHUNK_SIZE = 500      # Words per chunk
CHUNK_OVERLAP = 100   # Overlap between chunks
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Make sure venv is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check .env file exists
ls -la server/.env
```

### Frontend can't connect

- Verify backend is running: `curl http://localhost:8000/`
- Check CORS settings in `server/app/main.py`
- Ensure port 8000 is not in use

### Upload fails

- Verify file is a PDF (not image/scan)
- Check Pinecone API key is valid
- Look at terminal logs for errors
- Ensure Pinecone free tier has capacity

### No answers returned

- Upload at least one document first
- Question must be related to uploaded content
- Check Pinecone index has vectors: `curl http://localhost:8000/`

---

## 📈 Phase 1 Status: ✅ COMPLETE

All core functionality is working:

- ✅ PDF upload and processing
- ✅ Chunking and embedding
- ✅ Vector storage (Pinecone)
- ✅ RAG-based Q&A
- ✅ Source citations
- ✅ Beautiful UI
- ✅ Full integration

---

## 🔜 Future Enhancements (Phase 2+)

- [ ] Multi-document library (toggle between PDFs)
- [ ] Admin analytics dashboard (common questions)
- [ ] User authentication (Admin vs Employee)
- [ ] Chat history persistence
- [ ] Document versioning
- [ ] Export Q&A for training
- [ ] Support for Word/Excel files
- [ ] Advanced search filters

---

## 📄 License

This project is for educational/enterprise use.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For detailed documentation, see [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)

**Happy Policy Searching! 🎉**