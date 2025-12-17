from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class GoalBase(BaseModel):
    goalType: str

class GoalCreate(GoalBase):
    pass

class GoalUpdate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: str = Field(..., alias="_id")
    userId: str = Field(..., alias="user_id")
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")

    class Config:
        populate_by_name = True