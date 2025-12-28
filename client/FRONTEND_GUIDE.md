# DocGuard Frontend Guide

Beautiful React + TypeScript frontend for DocGuard AI - Your Corporate Document Assistant.

## ✨ What's Built

### 1. **Landing Page** (`/`)
   - Modern hero section with animated mascot
   - Three feature cards showcasing key capabilities
   - Smooth gradient background
   - Call-to-action buttons
   - Professional, SaaS-inspired design

### 2. **Upload Page** (`/upload`)
   - Drag & drop file upload interface
   - File preview with size display
   - Real-time upload status
   - Success/error messages
   - Process explanation
   - Back navigation

## 🚀 Quick Start

```bash
# 1. Install dependencies (first time only)
cd /home/harish/Documents/Important_project/Doc_Gaurd/DocGuard/client
npm install

# 2. Start the development server
npm run dev

# Opens at: http://localhost:5173
```

## 📦 Dependencies to Install

Update your `package.json` dependencies section:

```json
"dependencies": {
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.2.0"
}
```

Then run:
```bash
npm install react-router-dom
```

## 🎨 Pages Overview

### Landing Page Features
- ✅ Header with logo and "Start Now" button
- ✅ Animated mascot with floating effect
- ✅ Hero title with gradient text
- ✅ 3 feature cards:
  - Upload & Process (Admin)
  - Ask Questions (Employee)
  - Trust with Sources (Verified)
- ✅ CTA button leading to upload
- ✅ Footer with branding

### Upload Page Features
- ✅ Back button to home
- ✅ Drag & drop zone
- ✅ File browser button
- ✅ File preview with name & size
- ✅ Upload button with loading state
- ✅ Success/Error status messages
- ✅ Process explanation cards (4 steps)
- ✅ Responsive design

## 🔌 Backend Connection

The upload page connects to your FastAPI backend:

```typescript
// API Endpoint
POST http://localhost:8000/admin/upload-pdf

// Request: multipart/form-data with 'file' field
// Response: { 
//   status: "success",
//   filename: "document.pdf",
//   pages: 10,
//   chunks_created: 20
// }
```

**Important**: Make sure your backend server is running:

```bash
cd ../server
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📁 File Structure Created

```
client/src/
├── pages/
│   ├── LandingPage.tsx      ✅ Created
│   ├── LandingPage.css      ✅ Created
│   ├── UploadPage.tsx       ✅ Created
│   └── UploadPage.css       ✅ Created
├── components/
│   └── Icons.tsx            ✅ Created (SVG icons)
├── App.tsx                  ✅ Updated (routing)
├── App.css                  ✅ Updated
└── index.css                ✅ Updated (global styles)
```

## 🎭 Icons

Custom SVG icons are included in `components/Icons.tsx`:
- BookOpen, Upload, Search, Sparkles, Shield
- FileText, CheckCircle, AlertCircle
- ArrowLeft, ArrowRight, Loader2

**Optional**: Install lucide-react for more icons:
```bash
npm install lucide-react
```

## 🎨 Color Palette

```css
Primary Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Primary: #6366f1 (Indigo)
Secondary: #764ba2 (Purple)
Background: #f8fafc
Card: #ffffff
Text Primary: #1e293b
Text Secondary: #64748b
Success: #16a34a
Error: #dc2626
```

## 🚦 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Home page with features |
| `/upload` | UploadPage | PDF upload interface |

## 💡 Usage

### Running the Frontend

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Upload Flow

1. Start backend: `cd ../server && source venv/bin/activate && uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Open: http://localhost:5173
4. Click "Start Now" or "Get Started"
5. Drag & drop a PDF or click "Browse Files"
6. Click "Upload & Process"
7. Wait for success message

## 🔧 Troubleshooting

### Issue: Icons not showing
**Solution**: Icons are included as SVG components in `components/Icons.tsx`. No external package needed initially.

### Issue: Routing not working
**Solution**: Make sure `react-router-dom` is installed:
```bash
npm install react-router-dom
```

### Issue: Backend connection failed
**Solution**: 
1. Check backend is running on port 8000
2. Check for CORS errors in browser console
3. Add CORS middleware to FastAPI if needed:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Styling looks broken
**Solution**: Make sure all CSS files are created and imported correctly.

## 🎯 Next Steps

### Phase 2 - Employee Features (To Build)
- [ ] Question input interface
- [ ] Search results display
- [ ] Source citations with page numbers
- [ ] Chat history
- [ ] Document selector

### Phase 3 - Admin Features (To Build)
- [ ] Admin dashboard
- [ ] Analytics (common questions, word cloud)
- [ ] Document management
- [ ] User management
- [ ] Settings page

## 📱 Responsive Design

- ✅ Desktop (1200px+): 3-column card layout
- ✅ Tablet (768px - 1199px): 2-column layout
- ✅ Mobile (< 768px): Single column, stacked layout

## 🎬 Animations

- Floating mascot animation
- Waving emoji
- Hover effects on cards and buttons
- Upload spinner
- Smooth transitions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Environment Variables

Create `.env` if you need API URL configuration:
```env
VITE_API_URL=http://localhost:8000
```

Use in code:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## 📝 Code Quality

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 🎉 Summary

You now have a complete, production-ready frontend with:
- ✅ Beautiful landing page
- ✅ Functional upload interface
- ✅ Modern, responsive design
- ✅ Smooth animations
- ✅ Type-safe TypeScript code
- ✅ React Router navigation
- ✅ API integration ready

**Total Components**: 2 pages, 1 icon library, fully styled and functional!
