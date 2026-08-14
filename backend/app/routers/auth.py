import uuid
import base64
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.models.all_models import User, Company

router = APIRouter()


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    company_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class GoogleLoginRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    google_id: Optional[str] = None
    picture: Optional[str] = None
    credential: Optional[str] = None  # Google GSI JWT token string


def _decode_google_jwt(credential: str) -> dict:
    try:
        parts = credential.split(".")
        if len(parts) >= 2:
            padded = parts[1] + "=" * (-len(parts[1]) % 4)
            decoded = base64.urlsafe_b64decode(padded).decode("utf-8")
            return json.loads(decoded)
    except Exception:
        pass
    return {}


@router.post("/register", response_model=dict)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new clean company for user (starts at 0)
    company = Company(
        company_id=str(uuid.uuid4()),
        name=data.company_name,
        safety_reserve=0.0,
    )
    db.add(company)

    user = User(
        user_id=str(uuid.uuid4()),
        company_id=company.company_id,
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role="owner",
    )
    db.add(user)
    await db.commit()

    token = create_access_token({
        "sub": user.user_id,
        "company_id": company.company_id,
        "role": user.role,
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"user_id": user.user_id, "name": user.name, "email": user.email,
                 "role": user.role, "company_id": company.company_id},
    }


@router.post("/login", response_model=dict)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": user.user_id,
        "company_id": user.company_id,
        "role": user.role,
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"user_id": user.user_id, "name": user.name, "email": user.email,
                 "role": user.role, "company_id": user.company_id},
    }


@router.post("/google", response_model=dict)
async def google_login(data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Google OAuth login & auto-signup endpoint. Creates a fresh zero-state company for new Google users."""
    email = data.email
    name = data.name

    if data.credential:
        payload = _decode_google_jwt(data.credential)
        if payload.get("email"):
            email = payload.get("email")
            name = payload.get("name", email.split("@")[0].title())

    if not email:
        raise HTTPException(status_code=400, detail="Google authentication failed — missing email")

    if not name:
        name = email.split("@")[0].title()

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Create fresh clean company for new Google user (0 initial data)
        co_id = f"company-{str(uuid.uuid4())[:8]}"
        co_name = f"{name}'s Business"
        company = Company(company_id=co_id, name=co_name, safety_reserve=0.0)
        db.add(company)

        user = User(
            user_id=str(uuid.uuid4()),
            company_id=co_id,
            name=name,
            email=email,
            password_hash=get_password_hash("google-oauth-user"),
            role="owner",
        )
        db.add(user)
        await db.commit()
    elif user.company_id == "abc-precision-001":
        # Re-link existing user away from demo company to their dedicated clean company
        co_id = f"company-{user.user_id[:8]}"
        co_res = await db.execute(select(Company).where(Company.company_id == co_id))
        company = co_res.scalar_one_or_none()
        if not company:
            company = Company(company_id=co_id, name=f"{name}'s Business", safety_reserve=0.0)
            db.add(company)
        user.company_id = co_id
        await db.commit()

    token = create_access_token({
        "sub": user.user_id,
        "company_id": user.company_id,
        "role": user.role,
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "company_id": user.company_id,
        },
    }


@router.get("/me")
async def me(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.user_id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.user_id, "name": user.name, "email": user.email,
            "role": user.role, "company_id": user.company_id}
