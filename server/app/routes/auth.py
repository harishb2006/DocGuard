from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

from ..auth.firebase_auth import verify_firebase_token, get_user_by_email
from ..db.mongodb import get_users_collection, get_database
from ..models.user import UserResponse

router = APIRouter()


class AuthResponse(BaseModel):
    """Response after successful authentication"""
    message: str
    user: dict


@router.post("/auth/verify", response_model=AuthResponse)
async def verify_user(token_data: dict = Depends(verify_firebase_token)):
    """
    Verify Firebase token and register/update user in MongoDB
    This endpoint is called by frontend after Google Sign-In
    """
    try:
        users_collection = await get_users_collection()
        
        # Check if user exists in MongoDB
        existing_user = await users_collection.find_one({"uid": token_data["uid"]})
        
        if existing_user:
            # Update last login
            await users_collection.update_one(
                {"uid": token_data["uid"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            return AuthResponse(
                message="Login successful",
                user={
                    "uid": existing_user["uid"],
                    "email": existing_user["email"],
                    "display_name": existing_user.get("display_name"),
                    "photo_url": existing_user.get("photo_url"),
                    "org_roles": existing_user.get("org_roles", []),
                    "created_at": existing_user["created_at"]
                }
            )
        else:
            # Create new user
            new_user = {
                "uid": token_data["uid"],
                "email": token_data.get("email"),
                "display_name": token_data.get("name"),
                "photo_url": token_data.get("picture"),
                "org_roles": [],
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "is_active": True
            }
            
            await users_collection.insert_one(new_user)
            
            return AuthResponse(
                message="User registered successfully",
                user={
                    "uid": new_user["uid"],
                    "email": new_user["email"],
                    "display_name": new_user.get("display_name"),
                    "photo_url": new_user.get("photo_url"),
                    "org_roles": [],
                    "created_at": new_user["created_at"]
                }
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during authentication: {str(e)}"
        )


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user(token_data: dict = Depends(verify_firebase_token)):
    """
    Get current authenticated user's information
    """
    try:
        users_collection = await get_users_collection()
        user = await users_collection.find_one({"uid": token_data["uid"]})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            uid=user["uid"],
            email=user["email"],
            display_name=user.get("display_name"),
            photo_url=user.get("photo_url"),
            org_roles=user.get("org_roles", []),
            created_at=user["created_at"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching user: {str(e)}"
        )

