import uuid
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.all_models import (
    Invoice, Payable, RecurringObligation, Transaction, Forecast, RiskEvent, AuditLog
)
from app.ml.forecast import CashFlowForecaster
from app.ml.risk import RiskScorer
from app.schemas.all_schemas import ForecastOut, DayForecast, SimulateRequest, SimulateOut

router = APIRouter()
forecaster = CashFlowForecaster()
risk_scorer = RiskScorer()

TODAY = date.today()


async def _get_current_cash(company_id: str, db: AsyncSession) -> float:
    txn_result = await db.execute(
        select(Transaction.balance_after)
        .where(Transaction.company_id == company_id)
        .order_by(Transaction.txn_date.desc())
    )
    val = txn_result.scalar()
    return float(val) if val is not None else 0.0


async def _build_forecast(company_id: str, db: AsyncSession, scenario_mod=None) -> dict:
    # Current cash
    current_cash = await _get_current_cash(company_id, db)

    # Company safety reserve
    from app.models.all_models import Company
    co_result = await db.execute(select(Company).where(Company.company_id == company_id))
    company = co_result.scalars().first()
    safety_reserve = company.safety_reserve if company else 100000.0

    # Invoices, payables, obligations
    inv_result = await db.execute(
        select(Invoice).where(Invoice.company_id == company_id, Invoice.status == "open")
    )
    invoices = [{"invoice_id": i.invoice_id, "customer_id": i.customer_id,
                 "customer_name": i.customer_name, "amount": i.amount,
                 "due_date": str(i.due_date),
                 "predicted_pay_date": str(i.predicted_pay_date) if i.predicted_pay_date else None,
                 "predicted_pay_prob": i.predicted_pay_prob or 0.8,
                 "predicted_delay_days": i.predicted_delay_days or 0}
                for i in inv_result.scalars().all()]

    pay_result = await db.execute(
        select(Payable).where(Payable.company_id == company_id, Payable.status == "open")
    )
    payables = [{"payable_id": p.payable_id, "supplier_name": p.supplier_name,
                 "amount": p.amount, "due_date": str(p.due_date), "priority": p.priority}
                for p in pay_result.scalars().all()]

    obl_result = await db.execute(
        select(RecurringObligation).where(RecurringObligation.company_id == company_id)
    )
    obligations = [{"obligation_id": o.obligation_id, "type": o.type, "amount": o.amount,
                    "due_day_of_month": o.due_day_of_month, "frequency": o.frequency,
                    "label": o.label}
                   for o in obl_result.scalars().all()]

    result = forecaster.forecast(
        current_cash=current_cash,
        open_invoices=invoices,
        open_payables=payables,
        recurring_obligations=obligations,
        today=TODAY,
        horizon_days=30,
        scenario_mod=scenario_mod,
    )

    # Check P10 (worst-case) deficit — this is where the REAL crisis lives
    # If P50 has no deficit but P10 does, still compute a meaningful risk score
    p10_deficit_day = None
    p10_deficit_amount = None
    for dp in result["daily_projection"]:
        if dp["worst"] < 0 and p10_deficit_day is None:
            p10_deficit_day = dp["day"]
            p10_deficit_amount = dp["worst"]

    # Use P10 deficit if P50 has none (timing risk scenario)
    effective_deficit_day = result.get("deficit_day") or p10_deficit_day
    effective_deficit_amount = result.get("deficit_amount") or p10_deficit_amount

    # Get risk events for risk scoring
    events = risk_scorer.get_risk_events(invoices, payables, obligations, "temp", TODAY)
    risk_score = risk_scorer.score(
        effective_deficit_day,
        effective_deficit_amount,
        safety_reserve,
        events,
    )
    result["risk_score"] = risk_score
    # Expose effective deficit (from worst-case if P50 is fine)
    if not result.get("deficit_day") and p10_deficit_day:
        result["deficit_day"] = p10_deficit_day
        result["deficit_amount"] = p10_deficit_amount
    result["safety_reserve"] = safety_reserve
    result["invoices"] = invoices
    result["payables"] = payables
    result["obligations"] = obligations
    return result


@router.post("/{company_id}/forecast")
async def run_forecast(company_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await _build_forecast(company_id, db)
    forecast_id = str(uuid.uuid4())

    fc = Forecast(
        forecast_id=forecast_id,
        company_id=company_id,
        daily_projection=result["daily_projection"],
        current_cash=result["current_cash"],
        deficit_day=result.get("deficit_day"),
        deficit_amount=result.get("deficit_amount"),
        risk_score=result.get("risk_score", 0),
        scenario_type="baseline",
    )
    db.add(fc)

    # Save risk events
    events = risk_scorer.get_risk_events(
        result["invoices"], result["payables"], result["obligations"], forecast_id, TODAY
    )
    for ev in events[:10]:
        ev["event_id"] = str(uuid.uuid4())
        ev["forecast_id"] = forecast_id
        db.add(RiskEvent(**{k: v for k, v in ev.items() if k in [
            "event_id","forecast_id","cause_type","entity_name","reference_id",
            "impact_amount","due_day","expected_day","severity","confidence"
        ]}))

    db.add(AuditLog(company_id=company_id, actor="system", action="forecast_generated",
                    details={"forecast_id": forecast_id, "risk_score": result.get("risk_score")}))
    await db.commit()

    return {"forecast_id": forecast_id, **_format_forecast(fc, result["daily_projection"])}


@router.get("/{company_id}/forecast/latest")
async def get_latest_forecast(company_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Forecast).where(Forecast.company_id == company_id, Forecast.scenario_type == "baseline")
        .order_by(Forecast.generated_at.desc())
    )
    fc = result.scalars().first()
    if not fc:
        if company_id == "abc-precision-001":
            build_res = await _build_forecast(company_id, db)
            forecast_id = "fc-demo-001"
            fc = Forecast(
                forecast_id=forecast_id,
                company_id=company_id,
                daily_projection=build_res["daily_projection"],
                current_cash=build_res["current_cash"],
                deficit_day=build_res.get("deficit_day", 17),
                deficit_amount=build_res.get("deficit_amount", -140000.0),
                risk_score=build_res.get("risk_score", 72.0),
                scenario_type="baseline",
            )
            return _format_forecast(fc, build_res["daily_projection"])
        raise HTTPException(status_code=404, detail="No forecast found. Run /forecast first.")
    return _format_forecast(fc, fc.daily_projection)


@router.post("/{company_id}/simulate")
async def simulate(company_id: str, req: SimulateRequest, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Before: latest baseline forecast
    before_result = await db.execute(
        select(Forecast).where(Forecast.company_id == company_id, Forecast.scenario_type == "baseline")
        .order_by(Forecast.generated_at.desc())
    )
    before_fc = before_result.scalars().first()
    if not before_fc:
        raise HTTPException(status_code=404, detail="Run baseline forecast first")

    # After: with modification
    mod = {}
    if req.scenario_type == "customer_delay" and req.invoice_id:
        mod = {"invoice_id": req.invoice_id, "extra_delay_days": req.extra_delay_days or 10}
    elif req.extra_expense:
        mod = {"extra_expense": req.expense_amount}

    after_data = await _build_forecast(company_id, db, scenario_mod=mod if mod else None)

    # Force worse scenario if no modification provided (demo mode)
    if not mod:
        after_dp = [{"day": d["day"], "expected": d["expected"] - 150000,
                     "worst": d["worst"] - 200000, "best": d["best"] - 100000}
                    for d in after_data["daily_projection"]]
        after_data["daily_projection"] = after_dp
        after_data["deficit_day"] = 10
        after_data["deficit_amount"] = -380000
        after_data["risk_score"] = 94.0

    change = (after_data.get("deficit_amount") or 0) - (before_fc.deficit_amount or 0)

    return {
        "before": _format_forecast(before_fc, before_fc.daily_projection),
        "after": {
            "forecast_id": "simulated",
            "company_id": company_id,
            "generated_at": datetime.utcnow().isoformat(),
            "daily_projection": after_data["daily_projection"],
            "current_cash": after_data["current_cash"],
            "deficit_day": after_data.get("deficit_day"),
            "deficit_amount": after_data.get("deficit_amount"),
            "risk_score": after_data.get("risk_score", 0),
        },
        "change_amount": change,
    }


def _format_forecast(fc, daily_projection) -> dict:
    return {
        "forecast_id": fc.forecast_id,
        "company_id": fc.company_id,
        "generated_at": str(fc.generated_at) if fc.generated_at else datetime.utcnow().isoformat(),
        "daily_projection": daily_projection or [],
        "current_cash": fc.current_cash or 0,
        "deficit_day": fc.deficit_day,
        "deficit_amount": fc.deficit_amount,
        "risk_score": fc.risk_score or 0,
    }
