# 🚀 DocGuard Setup Guide

## 📋 Files You MUST Configure Before Running

### 1. **Backend Environment Variables** (REQUIRED)
File: `server/.env`

Copy `server/.env.example` to `server/.env` and fill in:
```bash
cp server/.env.example server/.env
```

Required values:
- `CEREBRAS_API_KEY` - Your Cerebras AI API key
- `COHERE_API_KEY` - Your Cohere API key
- `PINECONE_API_KEY` - Your Pinecone vector database API key
- `PINECONE_ENV` - Your Pinecone environment
- `MONGODB_URI` - Your MongoDB connection string

### 2. **Firebase Admin SDK Credentials** (REQUIRED)
File: `server/app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json`

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file to `server/app/` with the exact filename above

⚠️ **SECURITY WARNING:** This file is automatically ignored by git. NEVER commit it!

### 3. **Frontend Firebase Config** (Already in code)
File: `client/src/firebase.ts`

The Firebase web config is already hardcoded in the file. If you need to change projects:
- Get config from Firebase Console > Project Settings > General > Your apps
- Update the `firebaseConfig` object

---

## 📦 Installation

### Backend
```bash
cd server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd client
npm install
```

---

## 🏃 Running the Application

### Backend
```bash
cd server
source venv/bin/activate
uvicorn app.main:app --reload
```
Server runs at: http://localhost:8000

### Frontend
```bash
cd client
npm run dev
```
Frontend runs at: http://localhost:5173

---

## 📁 What Files to Commit to Git

### ✅ COMMIT These Files:
```
DocGuard/
├── .gitignore (root)
├── README.md
├── SETUP.md (this file)
│
├── client/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig*.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/ (all source files)
│   └── public/
│
└── server/
    ├── .gitignore
    ├── requirements.txt
    ├── .env.example
    ├── config.py
    ├── app/
    │   ├── main.py
    │   ├── auth/
    │   ├── db/
    │   ├── ingest/
    │   ├── models/
    │   └── routes/
    └── uploads/.gitkeep
```

### ❌ NEVER COMMIT These Files:
```
# Environment variables
server/.env
client/.env

# Firebase credentials
server/app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json
server/app/*.json (except package.json)

# Dependencies
server/venv/
client/node_modules/

# Build outputs
client/dist/
server/__pycache__/

# User uploads
server/uploads/* (except .gitkeep)

# System files
.DS_Store
.vscode/
*.log
```

---

## 🔐 Security Checklist Before Pushing

- [ ] Removed or git-ignored all `.env` files
- [ ] Removed or git-ignored Firebase Admin SDK JSON file
- [ ] Checked that no API keys are hardcoded in source files
- [ ] Verified `.gitignore` files are in place
- [ ] Run `git status` to verify no sensitive files are staged

### Quick Security Check:
```bash
# From project root
git status

# If you see any .env or .json credential files, DO NOT COMMIT!
# Make sure .gitignore is working:
git check-ignore server/.env server/app/*.json
# Should return the filenames if properly ignored
```

---

## 🚨 If You Accidentally Committed Secrets

If you've already committed sensitive files:

1. **Remove from git history:**
```bash
git rm --cached server/.env
git rm --cached server/app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json
git commit -m "Remove sensitive files from tracking"
```

2. **Rotate all exposed credentials:**
   - Generate new Firebase Admin SDK key
   - Regenerate API keys (Cerebras, Cohere, Pinecone)
   - Update MongoDB password if exposed

3. **If pushed to remote:** Use `git filter-branch` or BFG Repo-Cleaner to remove from history

---

## 📚 Additional Documentation

- Backend API docs: http://localhost:8000/docs (when server is running)
- Frontend guide: `client/FRONTEND_GUIDE.md`
- Firebase setup: `server/FIREBASE_AUTH_SETUP.md`

---

## 🆘 Common Issues

**"No such file or directory: firebase credentials"**
- You need to download the Firebase Admin SDK JSON file (see step 2 above)

**"Module not found: email_validator"**
- Run: `pip install email-validator`

**Frontend can't connect to backend**
- Check backend is running on port 8000
- Verify `VITE_API_URL` in frontend (defaults to localhost:8000)

**MongoDB connection failed**
- Verify your MongoDB URI in `.env`
- Check MongoDB Atlas whitelist settings

---

Built with ❤️ using FastAPI, React, Firebase, and Pinecone
