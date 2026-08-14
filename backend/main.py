"""
CashFlow Guardian — FastAPI Application Entry Point
Autonomous Financial Early-Warning & Rescue Agent for MSMEs
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.routers import (
    auth,
    companies,
    data,
    forecast,
    risk,
    agent,
    actions,
    ask,
    audit,
    simulator,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    print("Database initialized OK")
    yield
    # Shutdown (if needed)
    pass


app = FastAPI(
    title="CashFlow Guardian",
    description="Autonomous Financial Early-Warning & Rescue Agent for MSMEs",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(data.router, prefix="", tags=["data"])
app.include_router(forecast.router, prefix="/companies", tags=["forecast"])
app.include_router(risk.router, prefix="/forecasts", tags=["risk"])
app.include_router(agent.router, prefix="", tags=["agent"])
app.include_router(actions.router, prefix="", tags=["actions"])
app.include_router(ask.router, prefix="", tags=["ask"])
app.include_router(audit.router, prefix="", tags=["audit"])
app.include_router(simulator.router, prefix="", tags=["simulator"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CashFlow Guardian API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)