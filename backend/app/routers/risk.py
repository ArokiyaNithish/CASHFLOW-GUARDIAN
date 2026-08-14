"""
Risk Breakdown Endpoint
Returns ranked risk events for a forecast
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.all_models import Forecast, RiskEvent
from app.schemas.all_schemas import RiskEventOut

router = APIRouter()


@router.get("/{forecast_id}/risk")
async def get_risk_breakdown(
    forecast_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed risk events for a specific forecast."""
    # Verify forecast exists
    result = await db.execute(select(Forecast).where(Forecast.forecast_id == forecast_id))
    forecast = result.scalar_one_or_none()
    if not forecast:
        raise HTTPException(status_code=404, detail="Forecast not found")

    # Get risk events
    result = await db.execute(
        select(RiskEvent)
        .where(RiskEvent.forecast_id == forecast_id)
        .order_by(RiskEvent.impact_amount.desc())
    )
    events = result.scalars().all()

    return [
        RiskEventOut(
            event_id=e.event_id,
            cause_type=e.cause_type,
            entity_name=e.entity_name,
            impact_amount=e.impact_amount,
            due_day=e.due_day,
            expected_day=e.expected_day,
            severity=e.severity,
            confidence=e.confidence,
        )
        for e in events
    ]