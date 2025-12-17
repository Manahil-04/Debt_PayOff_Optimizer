from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.api import deps
from app.db.mongodb import get_database
from app.models.user import UserResponse
from app.models.debt import DebtCreate, DebtResponse, DebtUpdate

router = APIRouter()

def get_db_instance(db_client):
    try:
        return db_client.get_default_database()
    except Exception:
        return db_client["pathlight"]

@router.get("/", response_model=List[DebtResponse])
async def read_debts(
    current_user: UserResponse = Depends(deps.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    database = get_db_instance(db)
    debts_cursor = database["debts"].find({"user_id": ObjectId(current_user.id)})
    debts = await debts_cursor.to_list(length=100)
    
    results = []
    for debt in debts:
        debt["_id"] = str(debt["_id"])
        debt["user_id"] = str(debt["user_id"])
        results.append(debt)
    
    return results

@router.post("/", response_model=DebtResponse)
async def create_debt(
    debt_in: DebtCreate,
    current_user: UserResponse = Depends(deps.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    database = get_db_instance(db)
    debt_data = debt_in.model_dump()
    debt_data["user_id"] = ObjectId(current_user.id)
    debt_data["created_at"] = datetime.utcnow()
    debt_data["updated_at"] = datetime.utcnow()
    
    result = await database["debts"].insert_one(debt_data)
    
    created_debt = await database["debts"].find_one({"_id": result.inserted_id})
    created_debt["_id"] = str(created_debt["_id"])
    created_debt["user_id"] = str(created_debt["user_id"])
    
    return created_debt

@router.put("/{debt_id}", response_model=DebtResponse)
async def update_debt(
    debt_id: str,
    debt_in: DebtUpdate,
    current_user: UserResponse = Depends(deps.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not ObjectId.is_valid(debt_id):
        raise HTTPException(status_code=400, detail="Invalid debt ID format")
        
    database = get_db_instance(db)
    
    # Check if debt exists and belongs to user
    existing_debt = await database["debts"].find_one({
        "_id": ObjectId(debt_id),
        "user_id": ObjectId(current_user.id)
    })
    
    if not existing_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
        
    update_data = debt_in.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await database["debts"].update_one(
            {"_id": ObjectId(debt_id)},
            {"$set": update_data}
        )
        
    updated_debt = await database["debts"].find_one({"_id": ObjectId(debt_id)})
    updated_debt["_id"] = str(updated_debt["_id"])
    updated_debt["user_id"] = str(updated_debt["user_id"])
    
    return updated_debt

@router.delete("/{debt_id}", response_model=dict)
async def delete_debt(
    debt_id: str,
    current_user: UserResponse = Depends(deps.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not ObjectId.is_valid(debt_id):
        raise HTTPException(status_code=400, detail="Invalid debt ID format")
        
    database = get_db_instance(db)
    
    result = await database["debts"].delete_one({
        "_id": ObjectId(debt_id),
        "user_id": ObjectId(current_user.id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Debt not found")
        
    return {"status": "success", "message": "Debt deleted"}