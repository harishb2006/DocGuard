from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional

# Import the securely loaded URI and DB name from config
from config import MONGODB_URI, MONGODB_DB_NAME

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
        async_db = async_client[MONGODB_DB_NAME]
    
    return async_db

async def close_mongodb_connection():
    """Close MongoDB connection"""
    global async_client
    if async_client:
        async_client.close()
        async_client = None

# Collections
async def get_users_collection(): return (await get_database())["users"]
async def get_documents_collection(): return (await get_database())["documents"]
async def get_queries_collection(): return (await get_database())["queries"]
async def get_analytics_collection(): return (await get_database())["analytics"]
async def get_organizations_collection(): return (await get_database())["organizations"]