#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""
import sys
import os

print("Testing imports...")

try:
    from fastapi import FastAPI
    print("✓ FastAPI imported successfully")
except Exception as e:
    print(f"✗ FastAPI import failed: {e}")

try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    print("✓ GoogleGenerativeAIEmbeddings imported successfully")
except Exception as e:
    print(f"✗ GoogleGenerativeAIEmbeddings import failed: {e}")

try:
    import pinecone
    print("✓ Pinecone imported successfully")
except Exception as e:
    print(f"✗ Pinecone import failed: {e}")

try:
    from langchain_community.vectorstores import Pinecone as LangchainPinecone
    print("✓ LangchainPinecone imported successfully")
except Exception as e:
    print(f"✗ LangchainPinecone import failed: {e}")

try:
    from langchain_community.document_loaders import PyPDFLoader
    print("✓ PyPDFLoader imported successfully")
except Exception as e:
    print(f"✗ PyPDFLoader import failed: {e}")

try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    print("✓ RecursiveCharacterTextSplitter imported successfully")
except Exception as e:
    print(f"✗ RecursiveCharacterTextSplitter import failed: {e}")

try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✓ dotenv loaded successfully")
except Exception as e:
    print(f"✗ dotenv failed: {e}")

try:
    from config import GOOGLE_API_KEY, PINECONE_API_KEY
    if GOOGLE_API_KEY:
        print(f"✓ GOOGLE_API_KEY found: {GOOGLE_API_KEY[:20]}...")
    else:
        print("✗ GOOGLE_API_KEY not set")
    
    if PINECONE_API_KEY:
        print(f"✓ PINECONE_API_KEY found: {PINECONE_API_KEY[:20]}...")
    else:
        print("✗ PINECONE_API_KEY not set")
except Exception as e:
    print(f"✗ Config import failed: {e}")

print("\n--- All imports tested ---")
