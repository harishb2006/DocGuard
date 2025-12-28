#!/bin/bash

# RuleBook AI - Quick Start Script
# Phase 1 - Complete Setup

echo "🚀 RuleBook AI - Phase 1 Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ Error: Run this script from the DocGuard root directory"
    exit 1
fi

echo "📦 Step 1: Backend Setup"
echo "------------------------"
cd server

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "🔑 IMPORTANT: Edit server/.env and add your API keys:"
    echo "   - GOOGLE_API_KEY from https://aistudio.google.com/app/apikey"
    echo "   - PINECONE_API_KEY from https://www.pinecone.io/"
    echo ""
    read -p "Press Enter after you've added your API keys..."
fi

cd ..

echo ""
echo "📦 Step 2: Frontend Setup"
echo "-------------------------"
cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🎯 To Start the Application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd server"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "📚 Read PHASE1_COMPLETE.md for full documentation"
