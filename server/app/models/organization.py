from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"

class OrgRole(BaseModel):
    """Link between a user and an organization with a specific role"""
    org_id: str
    org_name: str
    role: RoleEnum

class Organization(BaseModel):
    """Organization model"""
    # MongoDB ID will be used as the primary identifier (mapped to _id usually, but handled by the db layer)
    name: str
    code: str  # Unique join code
    created_by: str  # UID of the creator
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
class OrganizationCreate(BaseModel):
    name: str

class JoinOrganizationRequest(BaseModel):
    code: str

class OrganizationResponse(BaseModel):
    id: str  # String representation of ObjectId
    name: str
    role: RoleEnum  # The role the current user has in this org
    code: Optional[str] = None # Only show code to admins maybe? Or everyone? Spec says user enters code to join.
