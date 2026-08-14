"""
Simulator Router — What-If Scenario Analysis
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.all_models import Company, Invoice, Payable, RecurringObligation, Forecast
from app.ml.forecast import CashFlowForecaster
from app.ml.risk import RiskScorer
from app.rag.retrieve import retrieve_policy
from datetime import date

router = APIRouter()


class SimulateRequest(BaseModel):
    scenario_type: str  # 'customer_delay', 'extra_expense', 'revenue_drop', 'supplier_early'
    invoice_id: Optional[str] = None
    extra_delay_days: Optional[int] = 0
    extra_expense: Optional[float] = 0.0
    revenue_drop_pct: Optional[float] = 0.0


@router.post("/companies/{company_id}/simulate")
async def simulate_scenario(
    company_id: str,
    req: SimulateRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch company
    co_res = await db.execute(select(Company).where(Company.company_id == company_id))
    company = co_res.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    safety_reserve = company.safety_reserve
    today = date.today()

    # Fetch open invoices
    inv_res = await db.execute(
        select(Invoice).where(Invoice.company_id == company_id, Invoice.status == "open")
    )
    invoices = inv_res.scalars().all()
    invoice_list = [
        {
            "invoice_id": inv.invoice_id,
            "amount": inv.amount,
            "due_date": inv.due_date.isoformat() if inv.due_date else today.isoformat(),
            "predicted_pay_date": inv.predicted_pay_date.isoformat() if inv.predicted_pay_date else today.isoformat(),
            "predicted_pay_prob": inv.predicted_pay_prob or 0.8,
            "predicted_delay_days": inv.predicted_delay_days or 0,
        }
        for inv in invoices
    ]

    # Fetch payables
    pay_res = await db.execute(
        select(Payable).where(Payable.company_id == company_id, Payable.status == "open")
    )
    payables = pay_res.scalars().all()
    payable_list = [
        {"amount": p.amount, "due_date": p.due_date.isoformat() if p.due_date else today.isoformat()}
        for p in payables
    ]

    # Fetch obligations
    obl_res = await db.execute(
        select(RecurringObligation).where(RecurringObligation.company_id == company_id)
    )
    obligations = obl_res.scalars().all()
    obligation_list = [
        {"amount": o.amount, "due_day_of_month": o.due_day_of_month}
        for o in obligations
    ]

    # Get current cash from latest transaction
    from app.routers.forecast import _get_current_cash
    current_cash = await _get_current_cash(company_id, db)

    # BASELINE forecast (no scenario)
    forecaster = CashFlowForecaster()
    baseline = forecaster.forecast(
        current_cash=current_cash,
        open_invoices=invoice_list,
        open_payables=payable_list,
        recurring_obligations=obligation_list,
        today=today,
        horizon_days=30,
        n_simulations=200,
    )

    # Build scenario_mod
    scenario_mod = {}
    if req.scenario_type == "customer_delay" and req.invoice_id:
        scenario_mod["invoice_id"] = req.invoice_id
        scenario_mod["extra_delay_days"] = req.extra_delay_days or 0
    elif req.scenario_type == "extra_expense":
        scenario_mod["extra_expense"] = req.extra_expense or 0

    # SIMULATED forecast
    simulated = forecaster.forecast(
        current_cash=current_cash,
        open_invoices=invoice_list,
        open_payables=payable_list,
        recurring_obligations=obligation_list,
        today=today,
        horizon_days=30,
        n_simulations=200,
        scenario_mod=scenario_mod if scenario_mod else None,
    )

    # Risk scores for both
    _scorer = RiskScorer()
    baseline_risk_score = _scorer.score(
        deficit_day=baseline.get("deficit_day"),
        deficit_amount=baseline.get("deficit_amount"),
        safety_reserve=safety_reserve,
        risk_events=[],
    )
    simulated_risk_score = _scorer.score(
        deficit_day=simulated.get("deficit_day"),
        deficit_amount=simulated.get("deficit_amount"),
        safety_reserve=safety_reserve,
        risk_events=[],
    )

    # Guardian recommendation via RAG
    if simulated.get("deficit_amount") and simulated["deficit_amount"] < 0:
        policy = retrieve_policy("How to manage cash crisis scenario deficit MSME", k=2)
        guardian_note = (
            f"In this scenario, the deficit worsens to ₹{abs(simulated['deficit_amount']):,.0f} "
            f"on Day {simulated.get('deficit_day', 'N/A')}. "
            f"Activate supplier negotiation before Day {max(1, (simulated.get('deficit_day') or 14) - 6)} "
            f"to avoid the crisis. Consider accelerating receivables or pre-approving the rescue plan."
        )
    else:
        guardian_note = "This scenario does not create an additional cash deficit. Your current rescue plan remains adequate."

    return {
        "baseline": {
            "daily_projection": baseline["daily_projection"],
            "deficit_day": baseline.get("deficit_day"),
            "deficit_amount": baseline.get("deficit_amount"),
            "risk_score": baseline_risk_score,
        },
        "simulated": {
            "daily_projection": simulated["daily_projection"],
            "deficit_day": simulated.get("deficit_day"),
            "deficit_amount": simulated.get("deficit_amount"),
            "risk_score": simulated_risk_score,
        },
        "guardian_recommendation": guardian_note,
        "scenario_applied": req.model_dump(),
    }
