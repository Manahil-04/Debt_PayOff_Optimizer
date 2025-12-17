from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        """Create database connection."""
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        # Verify connection (optional but good for health checks later)
        # await self.client.admin.command('ping') 
        print("Connected to MongoDB.")

    def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            print("Closed MongoDB connection.")

db = Database()

async def get_database():
    """Dependency to get the database instance."""
    return db.client