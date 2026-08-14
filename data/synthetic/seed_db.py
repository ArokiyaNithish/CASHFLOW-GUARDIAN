import asyncio
from app.core.database import engine, Base, AsyncSessionLocal
from data.synthetic.seed_crisis import seed_crisis_scenario

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_crisis_scenario(session)

if __name__ == "__main__":
    asyncio.run(seed())
