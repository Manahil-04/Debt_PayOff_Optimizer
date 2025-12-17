from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.api import deps
from app.core import security
from app.core.config import settings
from app.db.mongodb import get_database
from app.models.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def create_user(
    user_in: UserCreate,
    db: Annotated[AsyncIOMotorClient, Depends(get_database)]
) -> Any:
    """
    Create new user.
    """
    try:
        database = db.get_default_database()
    except Exception:
         database = db["pathlight"]
         
    user = await database["users"].find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user_dict = user_in.model_dump()
    hashed_password = security.get_password_hash(user_dict["password"])
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    result = await database["users"].insert_one(user_dict)
    
    created_user = await database["users"].find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    
    return UserResponse(**created_user)

@router.post("/login")
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncIOMotorClient, Depends(get_database)]
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    try:
        database = db.get_default_database()
    except Exception:
         database = db["pathlight"]
         
    user = await database["users"].find_one({"email": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user["_id"], expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: Annotated[UserResponse, Depends(deps.get_current_user)]
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.delete("/me", response_model=dict)
async def delete_user_me(
    current_user: Annotated[UserResponse, Depends(deps.get_current_user)],
    db: Annotated[AsyncIOMotorClient, Depends(get_database)]
) -> Any:
    """
    Delete current user and all associated data.
    """
    try:
        database = db.get_default_database()
    except Exception:
         database = db["pathlight"]
         
    user_id = ObjectId(current_user.id)
    
    # Delete debts
    await database["debts"].delete_many({"user_id": user_id})
    
    # Delete goal
    await database["goals"].delete_one({"user_id": user_id})
    
    # Delete user
    result = await database["users"].delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": "User account and all data deleted"}