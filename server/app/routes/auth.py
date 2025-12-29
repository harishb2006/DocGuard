from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

from ..auth.firebase_auth import verify_firebase_token, get_user_by_email, set_admin_claim
from ..db.mongodb import get_users_collection, get_database
from ..models.user import UserResponse, AdminSetRequest

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
                    "is_admin": existing_user.get("is_admin", False)
                }
            )
        else:
            # Create new user
            new_user = {
                "uid": token_data["uid"],
                "email": token_data.get("email"),
                "display_name": token_data.get("name"),
                "photo_url": token_data.get("picture"),
                "is_admin": False,
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
                    "is_admin": False
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
            is_admin=user.get("is_admin", False),
            created_at=user["created_at"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching user: {str(e)}"
        )


class SetAdminRequest(BaseModel):
    email: EmailStr


@router.post("/auth/set-admin")
async def set_user_as_admin(
    request: SetAdminRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    """
    Set a user as admin (protected endpoint - requires existing admin or first-time setup)
    For first admin, you can call this without auth by temporarily removing the dependency
    """
    try:
        users_collection = await get_users_collection()
        
        # Check if any admin exists
        admin_count = await users_collection.count_documents({"is_admin": True})
        
        # If no admin exists, allow first admin creation
        # Otherwise, check if requester is admin
        if admin_count > 0:
            current_user = await users_collection.find_one({"uid": token_data["uid"]})
            if not current_user or not current_user.get("is_admin", False):
                raise HTTPException(
                    status_code=403,
                    detail="Only admins can create new admins"
                )
        
        # Get user by email
        firebase_user = get_user_by_email(request.email)
        
        # Set admin claim in Firebase
        set_admin_claim(firebase_user["uid"])
        
        # Update MongoDB
        result = await users_collection.update_one(
            {"uid": firebase_user["uid"]},
            {"$set": {"is_admin": True}},
            upsert=True
        )
        
        return {
            "success": True,
            "message": f"Admin privileges granted to {request.email}",
            "uid": firebase_user["uid"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error setting admin: {str(e)}"
        )


@router.get("/auth/users", response_model=List[UserResponse])
async def list_users(token_data: dict = Depends(verify_firebase_token)):
    """
    List all users (admin only)
    """
    try:
        users_collection = await get_users_collection()
        
        # Check if requester is admin
        current_user = await users_collection.find_one({"uid": token_data["uid"]})
        if not current_user or not current_user.get("is_admin", False):
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )
        
        # Get all users
        users = await users_collection.find().to_list(length=100)
        
        return [
            UserResponse(
                uid=user["uid"],
                email=user["email"],
                display_name=user.get("display_name"),
                photo_url=user.get("photo_url"),
                is_admin=user.get("is_admin", False),
                created_at=user["created_at"]
            )
            for user in users
        ]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing users: {str(e)}"
        )
