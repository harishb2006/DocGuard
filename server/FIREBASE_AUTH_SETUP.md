# Firebase Authentication & Admin Setup Guide

## 🔥 Firebase Authentication Implementation

This guide will help you set up and test the complete Firebase Google Authentication system for RuleBook AI.

---

## ✅ What's Been Implemented

### 1. **Firebase Admin SDK Setup**
- ✓ Firebase credentials file integrated: `app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json`
- ✓ Firebase Admin SDK initialized in `app/auth/firebase_auth.py`
- ✓ Token verification middleware for protected routes

### 2. **MongoDB Integration**
- ✓ MongoDB connection setup with Motor (async driver)
- ✓ User model with admin privileges tracking
- ✓ Collections: users, documents, queries, analytics
- ✓ Connection string configured in `config.py`

### 3. **Authentication Routes** (`/auth/*`)
- ✓ `POST /auth/verify` - Verify Firebase token and register/login user
- ✓ `GET /auth/me` - Get current authenticated user info
- ✓ `POST /auth/set-admin` - Set a user as admin
- ✓ `GET /auth/users` - List all users (admin only)

### 4. **Protected Admin Routes** (`/admin/*`)
- ✓ `POST /admin/upload` - Upload PDF (admin only)
- ✓ `GET /admin/documents` - List documents (admin only)
- ✓ `DELETE /admin/documents/{filename}` - Delete document (admin only)
- ✓ `GET /admin/stats` - Get system statistics (admin only)
- ✓ `GET /admin/analytics/queries` - Get query analytics (admin only)
- ✓ `GET /admin/analytics/word-cloud` - Get word cloud data (admin only)

### 5. **Protected Employee Routes** (`/employee/*`)
- ✓ `POST /employee/ask` - Ask questions (authenticated users only)
- ✓ Query logging for analytics dashboard

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
# Replace YOUR_PASSWORD_HERE with your actual MongoDB password
MONGODB_URI=mongodb+srv://Harishb2006:YOUR_PASSWORD_HERE@cluster0.ybfsvu0.mongodb.net/?appName=Cluster0

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENV=your_pinecone_environment

COHERE_API_KEY=your_cohere_api_key
CEREBRAS_API_KEY=your_cerebras_api_key
```

### Step 3: Verify Firebase Configuration

Ensure the Firebase Admin SDK file exists:
```bash
ls app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json
```

### Step 4: Start the Server

```bash
uvicorn app.main:app --reload --port 8000
```

You should see:
```
🚀 Starting RuleBook AI Server...
✓ Firebase Admin SDK initialized
✓ MongoDB connection ready
✓ Pinecone vector store ready
```

---

## 🧪 Testing the Authentication Flow

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "server": "running",
  "google_api_key": "set",
  "pinecone_api_key": "set",
  "pinecone_env": "set",
  "mongodb_uri": "set",
  "firebase": "initialized"
}
```

### Test 2: Create First Admin (One-Time Setup)

**Important:** For the first admin, you need to temporarily remove authentication from the set-admin endpoint or use this manual method:

#### Method 1: Using Python Script

Create a file `create_first_admin.py`:

```python
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth

load_dotenv()

# Initialize Firebase
cred = credentials.Certificate("app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json")
firebase_admin.initialize_app(cred)

# Replace with your email
ADMIN_EMAIL = "your.email@gmail.com"

try:
    # Get user by email
    user = auth.get_user_by_email(ADMIN_EMAIL)
    
    # Set admin claim
    auth.set_custom_user_claims(user.uid, {"admin": True})
    
    print(f"✓ Admin claim set for {ADMIN_EMAIL} (UID: {user.uid})")
    print("The user can now access admin endpoints!")
    
except Exception as e:
    print(f"Error: {e}")
    print(f"Make sure {ADMIN_EMAIL} has signed in via Google first!")
```

Run it:
```bash
python create_first_admin.py
```

#### Method 2: Via API (After first sign-in)

1. Sign in with Google in the frontend
2. Get the user's UID from MongoDB or Firebase Console
3. Temporarily comment out the admin check in `app/routes/auth.py` line 106-110
4. Call the endpoint:

```bash
curl -X POST http://localhost:8000/auth/set-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "your.email@gmail.com"}'
```

5. Re-enable the admin check

### Test 3: Verify Authentication

After signing in via the frontend, test the token:

```bash
# Replace YOUR_FIREBASE_ID_TOKEN with actual token from frontend
curl -X POST http://localhost:8000/auth/verify \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

Expected response:
```json
{
  "message": "Login successful",
  "user": {
    "uid": "...",
    "email": "your.email@gmail.com",
    "display_name": "Your Name",
    "photo_url": "...",
    "is_admin": true
  }
}
```

### Test 4: Test Admin Endpoint

```bash
curl -X GET http://localhost:8000/admin/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

Expected response:
```json
{
  "total_documents": 0,
  "total_size_mb": 0,
  "total_users": 1,
  "total_queries": 0,
  "mongodb_documents": 0,
  "vector_store": "Pinecone (connected)"
}
```

---

## 📊 Admin Dashboard Features

### 1. **Document Management**
- Upload PDFs with authentication
- View all uploaded documents
- Delete documents (removes from disk and updates MongoDB)

### 2. **User Management**
- View all registered users
- Grant/revoke admin privileges
- Track user activity

### 3. **Query Analytics**
- See most common employee questions
- Identify confusing policies
- Track query frequency
- Generate word cloud from queries

### 4. **Statistics Dashboard**
- Total documents uploaded
- Total users registered
- Total queries processed
- Storage usage

---

## 🔐 Security Features

1. **Token Verification**: Every protected route verifies Firebase ID tokens
2. **Role-Based Access**: Admin endpoints check for admin claims
3. **MongoDB User Tracking**: All users are stored with authentication status
4. **Query Logging**: All employee questions are logged for analytics (with user attribution)
5. **CORS Protection**: Configured for specific frontend origins only

---

## 🎯 Frontend Integration Points

### For Login Flow:

1. **Google Sign-In** (Frontend)
   - Use Firebase JS SDK for Google authentication
   - Get ID token from Firebase

2. **Verify with Backend** (Frontend → Backend)
   ```javascript
   const idToken = await firebase.auth().currentUser.getIdToken();
   
   const response = await fetch('http://localhost:8000/auth/verify', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${idToken}`
     }
   });
   
   const userData = await response.json();
   // userData.user.is_admin tells if user is admin
   ```

3. **Store Token** (Frontend)
   - Store token in localStorage/context
   - Include in all subsequent API calls

### For Protected Requests:

```javascript
const response = await fetch('http://localhost:8000/admin/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`
  },
  body: formData
});
```

---

## 📝 MongoDB Collections Structure

### `users` Collection:
```json
{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "display_name": "User Name",
  "photo_url": "https://...",
  "is_admin": false,
  "created_at": "2025-12-29T...",
  "last_login": "2025-12-29T...",
  "is_active": true
}
```

### `documents` Collection:
```json
{
  "filename": "Employee_Handbook_2025.pdf",
  "file_path": "uploads/...",
  "pages": 100,
  "chunks_created": 250,
  "uploaded_by": "firebase_uid",
  "uploaded_by_email": "admin@example.com",
  "uploaded_at": "2025-12-29T...",
  "status": "active"
}
```

### `queries` Collection:
```json
{
  "question": "Can I claim internet bill?",
  "answer": "Based on page 14...",
  "user_uid": "firebase_uid",
  "user_email": "employee@example.com",
  "has_answer": true,
  "sources_count": 3,
  "timestamp": "2025-12-29T..."
}
```

---

## 🐛 Troubleshooting

### Error: "Missing authorization header"
- Make sure to include `Authorization: Bearer <token>` header
- Token must be valid Firebase ID token

### Error: "Access denied. Admin privileges required"
- User doesn't have admin claim set
- Run the create_first_admin.py script

### Error: "Firebase token has expired"
- ID tokens expire after 1 hour
- Refresh the token in frontend using Firebase SDK

### Error: "MongoDB connection failed"
- Check your MongoDB connection string
- Ensure password is correctly set in .env file
- Check network connectivity to MongoDB Atlas

---

## 🎉 Next Steps

1. **Frontend Integration**: 
   - Add Firebase JS SDK to React app
   - Implement Google Sign-In button
   - Create protected routes based on `is_admin` flag

2. **Admin Dashboard**:
   - Build React components for analytics
   - Implement word cloud visualization
   - Create document management UI

3. **Testing**:
   - Test with multiple users
   - Test admin vs employee access
   - Test query analytics with real questions

---

## 📚 API Documentation

Full API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔗 Useful Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [FastAPI Authentication](https://fastapi.tiangolo.com/tutorial/security/)
- [MongoDB Motor Documentation](https://motor.readthedocs.io/)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/admin/verify-id-tokens)

---

**Status**: ✅ Complete and Ready for Testing!
