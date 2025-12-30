from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from datetime import datetime
import uuid
from bson.objectid import ObjectId

from ..auth.firebase_auth import verify_firebase_token
from ..db.mongodb import get_users_collection, get_organizations_collection
from ..models.organization import (
    Organization, OrganizationCreate, JoinOrganizationRequest, OrganizationResponse, RoleEnum
)
from ..models.user import UserOrgRole

router = APIRouter()

@router.post("/", response_model=OrganizationResponse)
async def create_organization(
    org_data: OrganizationCreate,
    token_data: dict = Depends(verify_firebase_token)
):
    """
    Create a new organization.
    The creator automatically becomes an ADMIN.
    """
    try:
        users_collection = await get_users_collection()
        orgs_collection = await get_organizations_collection()
        
        user_uid = token_data["uid"]
        
        # Generate a unique 6-character code
        org_code = str(uuid.uuid4())[:6].upper()
        
        # Create Org Document
        new_org = {
            "name": org_data.name,
            "code": org_code,
            "created_by": user_uid,
            "created_at": datetime.utcnow(),
            "members": [user_uid] # List of member UIDs
        }
        
        result = await orgs_collection.insert_one(new_org)
        org_id = str(result.inserted_id)
        
        # Update User's Org Roles
        new_role = UserOrgRole(
            org_id=org_id,
            role=RoleEnum.ADMIN
        )
        
        await users_collection.update_one(
            {"uid": user_uid},
            {"$push": {"org_roles": new_role.dict()}}
        )
        
        return OrganizationResponse(
            id=org_id,
            name=org_data.name,
            role=RoleEnum.ADMIN,
            code=org_code
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/join", response_model=OrganizationResponse)
async def join_organization(
    join_data: JoinOrganizationRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    """
    Join an organization using a code.
    The user is assigned the EMPLOYEE role.
    """
    try:
        users_collection = await get_users_collection()
        orgs_collection = await get_organizations_collection()
        
        user_uid = token_data["uid"]
        
        # Find Org by Code
        org = await orgs_collection.find_one({"code": join_data.code.upper()})
        
        if not org:
            raise HTTPException(status_code=404, detail="Invalid organization code")
        
        org_id = str(org["_id"])
        
        # Check if already a member
        user = await users_collection.find_one({"uid": user_uid})
        for role in user.get("org_roles", []):
            if role["org_id"] == org_id:
                raise HTTPException(status_code=400, detail="You are already a member of this organization")
        
        # Add to Org Members
        await orgs_collection.update_one(
            {"_id": org["_id"]},
            {"$push": {"members": user_uid}}
        )
        
        # Add Role to User
        new_role = UserOrgRole(
            org_id=org_id,
            role=RoleEnum.EMPLOYEE
        )
        
        await users_collection.update_one(
            {"uid": user_uid},
            {"$push": {"org_roles": new_role.dict()}}
        )
        
        return OrganizationResponse(
            id=org_id,
            name=org["name"],
            role=RoleEnum.EMPLOYEE,
            code=None # Hide code for employees? Or maybe show it. adhering to spec: "User enters an organization code".
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[OrganizationResponse])
async def list_user_organizations(
    token_data: dict = Depends(verify_firebase_token)
):
    """
    List all organizations the user belongs to.
    """
    try:
        users_collection = await get_users_collection()
        orgs_collection = await get_organizations_collection()
        
        user = await users_collection.find_one({"uid": token_data["uid"]})
        
        if not user or "org_roles" not in user:
            return []
            
        org_responses = []
        for user_role in user["org_roles"]:
            org = await orgs_collection.find_one({"_id": ObjectId(user_role["org_id"])})
            if org:
                # include code only if admin? spec doesn't strictly say, but usually admins handle invites/codes.
                # Use simplified logic: return code if user is ADMIN.
                code = org["code"] if user_role["role"] == RoleEnum.ADMIN else None
                
                org_responses.append(OrganizationResponse(
                    id=str(org["_id"]),
                    name=org["name"],
                    role=user_role["role"],
                    code=code
                ))
                
        return org_responses

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{org_id}/dashboard")
async def get_org_dashboard(
    org_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    """
    Get dashboard info and verify access/role.
    """
    try:
        users_collection = await get_users_collection()
        
        user = await users_collection.find_one({"uid": token_data["uid"]})
        
        # Check membership and get role
        role = None
        for r in user.get("org_roles", []):
            if r["org_id"] == org_id:
                role = r["role"]
                break
        
        if not role:
            raise HTTPException(status_code=403, detail="Not a member of this organization")
            
        return {
            "org_id": org_id,
            "role": role,
            "permissions": {
                "can_upload": role == RoleEnum.ADMIN,
                "can_ask": True # Both can ask
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
