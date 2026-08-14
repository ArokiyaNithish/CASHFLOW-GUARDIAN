from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.all_models import Company, Transaction, Invoice, Payable, RecurringObligation, Forecast
from app.ml.risk import RiskScorer
from app.schemas.all_schemas import SnapshotOut

router = APIRouter()
risk_scorer = RiskScorer()

TODAY = date.today()


@router.get("/{company_id}/snapshot", response_model=SnapshotOut)
async def get_snapshot(
    company_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Current cash from latest transaction (0.0 if clean user)
    txn_result = await db.execute(
        select(Transaction.balance_after)
        .where(Transaction.company_id == company_id)
        .order_by(Transaction.txn_date.desc())
    )
    latest_cash = txn_result.scalar()
    current_cash = float(latest_cash) if latest_cash is not None else 0.0

    # Open invoices
    inv_result = await db.execute(
        select(Invoice).where(Invoice.company_id == company_id, Invoice.status == "open")
    )
    invoices = inv_result.scalars().all()
    total_receivables = float(sum(i.amount for i in invoices))
    receivables_at_risk = float(sum(i.amount for i in invoices if (i.predicted_pay_prob or 0.9) < 0.6))

    # Open payables
    pay_result = await db.execute(
        select(Payable).where(Payable.company_id == company_id, Payable.status == "open")
    )
    payables = pay_result.scalars().all()
    total_payables = float(sum(p.amount for p in payables))

    # Recurring obligations in next 30 days
    obl_result = await db.execute(
        select(RecurringObligation).where(RecurringObligation.company_id == company_id)
    )
    obligations = obl_result.scalars().all()
    upcoming_30d = float(sum(o.amount for o in obligations if o.frequency == "monthly"))

    # Latest forecast
    fc_result = await db.execute(
        select(Forecast.forecast_id, Forecast.risk_score)
        .where(Forecast.company_id == company_id)
        .order_by(Forecast.generated_at.desc())
    )
    latest_fc = fc_result.first()
    risk_score = float(latest_fc[1]) if latest_fc else 0.0
    latest_forecast_id = latest_fc[0] if latest_fc else None

    # Compute health metrics (if score is 0.0, health is 100 STABLE)
    if not invoices and not payables and current_cash == 0.0:
        health = 100
        label = "STABLE"
        weather = "STABLE"
    else:
        health = risk_scorer.health_score(risk_score)
        label = risk_scorer.health_label(risk_score)
        weather = risk_scorer.weather(risk_score)

    return SnapshotOut(
        current_cash=current_cash,
        total_receivables=total_receivables,
        total_payables=total_payables,
        receivables_at_risk=receivables_at_risk,
        upcoming_obligations_30d=upcoming_30d,
        risk_score=risk_score,
        health_score=health,
        health_label=label,
        weather=weather,
        latest_forecast_id=latest_forecast_id,
    )


@router.get("/{company_id}/invoices")
async def get_invoices(company_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Invoice).where(Invoice.company_id == company_id, Invoice.status == "open")
        .order_by(Invoice.due_date)
    )
    invoices = result.scalars().all()
    return [
        {
            "invoice_id": i.invoice_id,
            "customer_name": i.customer_name,
            "amount": i.amount,
            "due_date": str(i.due_date),
            "predicted_pay_date": str(i.predicted_pay_date) if i.predicted_pay_date else None,
            "predicted_pay_prob": i.predicted_pay_prob or 0.8,
            "status": i.status,
        }
        for i in invoices
    ]
