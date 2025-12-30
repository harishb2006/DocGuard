from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from typing import Optional

# MongoDB connection string
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://Harishb2006:<db_password>@cluster0.ybfsvu0.mongodb.net/?appName=Cluster0"
)

# Database name
DB_NAME = "rulebook_ai"

# Async client for FastAPI
async_client: Optional[AsyncIOMotorClient] = None
async_db = None


def get_mongodb_client():
    """Get synchronous MongoDB client"""
    return MongoClient(MONGODB_URI)


async def get_database():
    """Get async MongoDB database instance"""
    global async_client, async_db
    
    if async_client is None:
        async_client = AsyncIOMotorClient(MONGODB_URI)
        async_db = async_client[DB_NAME]
    
    return async_db


async def close_mongodb_connection():
    """Close MongoDB connection"""
    global async_client
    if async_client:
        async_client.close()
        async_client = None


# Collections
async def get_users_collection():
    """Get users collection"""
    db = await get_database()
    return db["users"]


async def get_documents_collection():
    """Get documents collection"""
    db = await get_database()
    return db["documents"]


async def get_queries_collection():
    """Get queries collection (for analytics)"""
    db = await get_database()
    return db["queries"]


async def get_analytics_collection():
    """Get analytics collection"""
    db = await get_database()
    return db["analytics"]


async def get_organizations_collection():
    """Get organizations collection"""
    db = await get_database()
    return db["organizations"]
