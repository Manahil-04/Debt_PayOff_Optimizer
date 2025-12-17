from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.core.config import settings
from app.models.user import UserResponse
from app.db.mongodb import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncIOMotorClient, Depends(get_database)]
) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception
    
    try:
        database = db.get_default_database()
    except Exception:
         database = db["pathlight"]

    try:
        user = await database["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception
        
    if user is None:
        raise credentials_exception
    
    user["_id"] = str(user["_id"])
    return UserResponse(**user)