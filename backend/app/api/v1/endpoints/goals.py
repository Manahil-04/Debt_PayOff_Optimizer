from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.api import deps
from app.db.mongodb import get_database
from app.models.user import UserResponse
from app.models.goal import GoalResponse, GoalUpdate

router = APIRouter()

def get_db_instance(db_client):
    try:
        return db_client.get_default_database()
    except Exception:
        return db_client["pathlight"]

@router.get("/", response_model=Optional[GoalResponse])
async def read_goal(
    current_user: UserResponse = Depends(deps.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    database = get_db_instance(db)
    goal = await database["goals"].find_one({"user_id": ObjectId(current_user.id)})
    
    if goal:
        goal["_id"] = str(goal["_id"])
        goal["user_id"] = str(goal["user_id"])
        return goal
    
    return None

@router.put("/", response_model=GoalResponse)
async def upsert_goal(
    goal_in: GoalUpdate,
    current_user: UserResponse = Depends(deps.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    database = get_db_instance(db)
    
    existing_goal = await database["goals"].find_one({"user_id": ObjectId(current_user.id)})
    
    now = datetime.utcnow()
    
    if existing_goal:
        # Update
        update_data = goal_in.model_dump(exclude_unset=True)
        update_data["updated_at"] = now
        
        await database["goals"].update_one(
            {"_id": existing_goal["_id"]},
            {"$set": update_data}
        )
        goal_id = existing_goal["_id"]
    else:
        # Create
        goal_data = goal_in.model_dump()
        goal_data["user_id"] = ObjectId(current_user.id)
        goal_data["created_at"] = now
        goal_data["updated_at"] = now
        
        result = await database["goals"].insert_one(goal_data)
        goal_id = result.inserted_id
        
    updated_goal = await database["goals"].find_one({"_id": goal_id})
    updated_goal["_id"] = str(updated_goal["_id"])
    updated_goal["user_id"] = str(updated_goal["user_id"])
    
    return updated_goal