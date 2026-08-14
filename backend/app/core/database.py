from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False},
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    from app.models.all_models import (  # noqa: F401
        Company, User, Customer, Supplier, Invoice, Payable,
        RecurringObligation, Transaction, Forecast, RiskEvent,
        AgentPlan, AgentAction, AuditLog
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
