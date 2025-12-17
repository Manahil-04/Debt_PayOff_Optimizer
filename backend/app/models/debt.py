from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class DebtBase(BaseModel):
    debtType: str
    name: Optional[str] = None
    currentBalance: float
    annualPercentageRate: float
    minimumPayment: float

class DebtCreate(DebtBase):
    pass

class DebtUpdate(BaseModel):
    debtType: Optional[str] = None
    name: Optional[str] = None
    currentBalance: Optional[float] = None
    annualPercentageRate: Optional[float] = None
    minimumPayment: Optional[float] = None

class DebtResponse(DebtBase):
    id: str = Field(..., alias="_id")
    userId: str = Field(..., alias="user_id")
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")

    class Config:
        populate_by_name = True