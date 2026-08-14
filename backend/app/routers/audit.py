from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.all_models import AuditLog
from app.schemas.all_schemas import AuditEntryOut
from typing import List

router = APIRouter()

@router.get("/companies/{company_id}/audit-log", response_model=List[AuditEntryOut])
async def get_audit_log(
    company_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.company_id == company_id)
        .order_by(AuditLog.created_at.desc())
        .limit(50)
    )
    logs = result.scalars().all()
    return [
        AuditEntryOut(
            log_id=log.log_id,
            actor=log.actor or "system",
            action=log.action,
            details=log.details,
            created_at=str(log.created_at),
        )
        for log in logs
    ]
