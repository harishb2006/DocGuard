import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
from typing import Optional

# Initialize Firebase Admin SDK
cred_path = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json"
)

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)


async def verify_firebase_token(authorization: str = Header(None)) -> dict:
    """
    Verify Firebase ID token from Authorization header
    Returns decoded token with user info
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )
    
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format. Expected 'Bearer <token>'"
            )
        
        token = authorization.split("Bearer ")[1]
        
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Firebase token"
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Firebase token has expired"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token verification failed: {str(e)}"
        )


async def verify_admin(authorization: str = Header(None)) -> dict:
    """
    Verify user is an admin by checking custom claims
    """
    decoded_token = await verify_firebase_token(authorization)
    
    # Check if user has admin claim
    if not decoded_token.get("admin", False):
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin privileges required."
        )
    
    return decoded_token


def set_admin_claim(uid: str):
    """
    Set admin custom claim for a user (call this manually for first admin)
    """
    try:
        auth.set_custom_user_claims(uid, {"admin": True})
        return {"success": True, "message": f"Admin claim set for user {uid}"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to set admin claim: {str(e)}"
        )


def remove_admin_claim(uid: str):
    """
    Remove admin custom claim from a user
    """
    try:
        auth.set_custom_user_claims(uid, {"admin": False})
        return {"success": True, "message": f"Admin claim removed for user {uid}"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove admin claim: {str(e)}"
        )


def get_user_by_email(email: str):
    """
    Get Firebase user by email
    """
    try:
        user = auth.get_user_by_email(email)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "email_verified": user.email_verified,
            "disabled": user.disabled,
            "custom_claims": user.custom_claims
        }
    except auth.UserNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user: {str(e)}"
        )
