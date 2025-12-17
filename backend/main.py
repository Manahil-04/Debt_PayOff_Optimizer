from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.db.mongodb import db
from app.api.v1.endpoints import auth, debts, goals

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db.connect()
    yield
    # Shutdown
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", # Frontend URL
        "http://localhost:3000",
        "https://debt-payoff-optimizer.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(debts.router, prefix=f"{settings.API_V1_STR}/debts", tags=["debts"])
app.include_router(goals.router, prefix=f"{settings.API_V1_STR}/goals", tags=["goals"])

@app.get(f"{settings.API_V1_STR}/healthz")
async def health_check():
    """
    Health check endpoint to verify backend status and DB connection.
    """
    try:
        # Simple ping command to check DB connectivity
        if db.client:
            await db.client.admin.command('ping')
            db_status = "connected"
        else:
            db_status = "disconnected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "db": db_status
    }

@app.get("/")
async def root():
    return {"message": "Welcome to PathLight Backend"}
# Trigger reload for env vars
# Trigger reload for pip install