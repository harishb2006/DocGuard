# 🎯 Quick Start Guide - Firebase Auth & Admin Features

## Prerequisites Completed ✅
- Firebase Admin SDK configured
- MongoDB connection string added
- All code files created
- Dependencies listed in requirements.txt

## 🚀 Installation (3 Steps)

### Step 1: Install Dependencies
```bash
cd server
./install.sh
```

Or manually:
```bash
pip install -r requirements.txt
```

### Step 2: Configure MongoDB Password
Edit `.env` file and replace `<db_password>`:
```env
MONGODB_URI=mongodb+srv://Harishb2006:YOUR_REAL_PASSWORD@cluster0.ybfsvu0.mongodb.net/?appName=Cluster0
```

### Step 3: Start Server
```bash
uvicorn app.main:app --reload --port 8000
```

Visit: http://localhost:8000/docs

---

## 📋 Testing Checklist

### 1. Verify Server Health
```bash
curl http://localhost:8000/health
```

Should show:
```json
{
  "server": "running",
  "mongodb_uri": "set",
  "firebase": "initialized"
}
```

### 2. Test Root Endpoint
```bash
curl http://localhost:8000/
```

Should list all features including Firebase authentication.

### 3. Create First Admin
After a user signs in via Google in the frontend:
```bash
python create_first_admin.py
```

Enter their email to grant admin privileges.

---

## 🔑 API Endpoints Overview

### Authentication Routes (`/auth`)
- `POST /auth/verify` - Login/register with Firebase token
- `GET /auth/me` - Get current user info
- `POST /auth/set-admin` - Set admin (requires existing admin)
- `GET /auth/users` - List all users (admin only)

### Admin Routes (`/admin`)
- `POST /admin/upload` - Upload PDF document
- `GET /admin/documents` - List all documents
- `DELETE /admin/documents/{filename}` - Delete document
- `GET /admin/stats` - System statistics
- `GET /admin/analytics/queries` - Query analytics
- `GET /admin/analytics/word-cloud` - Word cloud data

### Employee Routes (`/employee`)
- `POST /employee/ask` - Ask question (authenticated)

---

## 💡 Frontend Integration

### 1. Sign in with Google
```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();
```

### 2. Verify with Backend
```javascript
const response = await fetch('http://localhost:8000/auth/verify', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${idToken}` }
});
const { user } = await response.json();
// user.is_admin tells if user has admin access
```

### 3. Make Authenticated Requests
```javascript
// All protected endpoints require Authorization header
const response = await fetch('http://localhost:8000/admin/stats', {
  headers: { 'Authorization': `Bearer ${idToken}` }
});
```

---

## 🎨 Admin Dashboard Features Ready

1. **Document Management**
   - Upload PDFs with tracking
   - View all documents
   - Delete documents

2. **User Management**
   - View all users
   - Grant admin privileges
   - Track logins

3. **Analytics Dashboard**
   - Common questions
   - Word cloud visualization
   - Query trends
   - User activity

4. **System Stats**
   - Document count
   - User count
   - Query count
   - Storage usage

---

## 🔧 Configuration Files

- `.env` - Environment variables (MongoDB, API keys)
- `config.py` - Application configuration
- `app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json` - Firebase credentials

---

## 📚 Documentation

- `FIREBASE_AUTH_SETUP.md` - Complete setup guide
- `IMPLEMENTATION_COMPLETE.md` - What was implemented
- http://localhost:8000/docs - Interactive API docs
- http://localhost:8000/redoc - Alternative API docs

---

## ⚠️ Important Notes

1. **MongoDB Password**: Must replace `<db_password>` in `.env`
2. **First Admin**: Use `create_first_admin.py` after first user signs in
3. **Token Expiry**: Firebase tokens expire after 1 hour (refresh in frontend)
4. **CORS**: Frontend must be on allowed origin (localhost:5173, localhost:3000)

---

## 🐛 Quick Troubleshooting

**Problem**: "Missing authorization header"
→ Include `Authorization: Bearer <token>` header

**Problem**: "Admin access required"
→ Run `create_first_admin.py` with user's email

**Problem**: "Firebase token has expired"
→ Refresh token in frontend: `user.getIdToken(true)`

**Problem**: "MongoDB connection failed"
→ Check password in `.env` file

---

## ✅ You're Ready!

All backend features for authentication and admin are complete.
Start the server and integrate with your frontend!

**Need help?** Check `FIREBASE_AUTH_SETUP.md` for detailed instructions.
