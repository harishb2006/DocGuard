from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"

class UserOrgRole(BaseModel):
    org_id: str
    role: RoleEnum

class User(BaseModel):
    """User model for MongoDB"""
    uid: str  # Firebase UID
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    # is_admin: bool = False  <-- Removed global admin
    org_roles: List[UserOrgRole] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True


class UserCreate(BaseModel):
    """User creation request"""
    email: EmailStr
    display_name: Optional[str] = None


class UserResponse(BaseModel):
    """User response model"""
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    org_roles: List[UserOrgRole] = []
    created_at: datetime

