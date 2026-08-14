import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.all_models import (
    Forecast, RiskEvent, AgentPlan, AgentAction, Company, AuditLog, Invoice, Payable
)
from app.agent.orchestrator import run_reason, run_plan, run_draft_action
from app.agent.rules_engine import assign_permission_level, validate_action_safety
from app.rag.retrieve import retrieve_policy
from app.schemas.all_schemas import AgentPlanOut, PlanOption, ModifyPlanRequest

router = APIRouter()

@router.post("/forecasts/{forecast_id}/plan", response_model=AgentPlanOut)
async def generate_plan(
    forecast_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch forecast
    fc_result = await db.execute(select(Forecast).where(Forecast.forecast_id == forecast_id))
    forecast = fc_result.scalars().first()
    if not forecast:
        # Fallback to latest forecast for company
        fc_result = await db.execute(
            select(Forecast)
            .where(Forecast.company_id == current_user["company_id"])
            .order_by(Forecast.generated_at.desc())
        )
        forecast = fc_result.scalars().first()
        if not forecast:
            raise HTTPException(status_code=404, detail="No forecast found. Please generate a forecast first.")
        forecast_id = forecast.forecast_id

    # Check if plan already exists for this forecast
    existing_plan_res = await db.execute(
        select(AgentPlan).where(AgentPlan.forecast_id == forecast_id).order_by(AgentPlan.created_at.desc())
    )
    existing_plan = existing_plan_res.scalars().first()
    if existing_plan:
        return AgentPlanOut(
            plan_id=existing_plan.plan_id,
            forecast_id=existing_plan.forecast_id,
            reasoning_text=existing_plan.reasoning_text,
            options=[PlanOption(**opt) for opt in existing_plan.options],
            recommended_option=existing_plan.recommended_option,
            justification=existing_plan.justification,
            status=existing_plan.status,
        )

    # 2. Fetch company and safety reserve
    co_result = await db.execute(select(Company).where(Company.company_id == forecast.company_id))
    company = co_result.scalars().first()
    safety_reserve = company.safety_reserve if company else 100000.0
    company_name = company.name if company else "ABC Precision Components"

    # 3. Fetch risk events
    re_result = await db.execute(
        select(RiskEvent).where(RiskEvent.forecast_id == forecast_id).order_by(RiskEvent.impact_amount.desc())
    )
    risk_events_objs = re_result.scalars().all()
    risk_events = [
        {
            "event_id": re.event_id,
            "cause_type": re.cause_type,
            "entity_name": re.entity_name,
            "reference_id": re.reference_id,
            "impact_amount": re.impact_amount,
            "due_day": re.due_day,
            "expected_day": re.expected_day,
            "severity": re.severity,
            "confidence": re.confidence,
        }
        for re in risk_events_objs
    ]

    snapshot_data = {
        "current_cash": forecast.current_cash,
        "deficit_day": forecast.deficit_day,
        "deficit_amount": forecast.deficit_amount,
        "risk_score": forecast.risk_score,
    }

    # 4. REASON Stage
    reasoning_text = run_reason(
        snapshot=snapshot_data,
        forecast={
            "current_cash": forecast.current_cash,
            "deficit_day": forecast.deficit_day,
            "deficit_amount": forecast.deficit_amount,
            "risk_score": forecast.risk_score,
        },
        risk_events=risk_events,
    )

    # 5. Build Levers from real database entities (Invoices / Payables)
    levers = []
    # Find high impact invoices
    for re in risk_events:
        if re["cause_type"] == "customer_delay":
            levers.append({
                "type": "payment_reminder",
                "entity_name": re["entity_name"],
                "amount": re["impact_amount"],
                "confidence": 0.87,
                "reference_id": re["reference_id"],
            })
        elif re["cause_type"] == "supplier_obligation":
            levers.append({
                "type": "supplier_negotiation",
                "entity_name": re["entity_name"],
                "amount": re["impact_amount"],
                "confidence": 0.79,
                "negotiability": "high",
                "reference_id": re["reference_id"],
            })

    if not levers:
        levers = [
            {"type": "payment_reminder", "entity_name": "ABC Retail Pvt Ltd", "amount": 300000.0, "confidence": 0.87},
            {"type": "supplier_negotiation", "entity_name": "RawMetal Supplies Co", "amount": 250000.0, "confidence": 0.79},
            {"type": "financing_request", "entity_name": "TReDS Platform", "amount": 270000.0, "confidence": 0.71},
        ]

    # RAG retrieve policy
    policy_chunks = retrieve_policy("MSME payment delay early collection and supplier negotiation policy")
    policy_context = "\n---\n".join(policy_chunks) if policy_chunks else "Standard MSME 45-day settlement norms."

    # 6. PLAN Stage
    plan_data = run_plan(
        reasoning_text=reasoning_text,
        forecast={
            "deficit_amount": forecast.deficit_amount,
            "deficit_day": forecast.deficit_day,
        },
        levers=levers,
        policy_context=policy_context,
        safety_reserve=safety_reserve,
    )

    plan_id = str(uuid.uuid4())
    new_plan = AgentPlan(
        plan_id=plan_id,
        forecast_id=forecast_id,
        company_id=forecast.company_id,
        reasoning_text=reasoning_text,
        options=plan_data.get("options", []),
        recommended_option=plan_data.get("recommended_option", "D"),
        justification=plan_data.get("justification", ""),
        status="proposed",
    )
    db.add(new_plan)

    db.add(AuditLog(
        company_id=forecast.company_id,
        actor="agent",
        action="rescue_plan_generated",
        details={"plan_id": plan_id, "recommended": new_plan.recommended_option}
    ))
    await db.commit()

    return AgentPlanOut(
        plan_id=plan_id,
        forecast_id=forecast_id,
        reasoning_text=reasoning_text,
        options=[PlanOption(**opt) for opt in new_plan.options],
        recommended_option=new_plan.recommended_option,
        justification=new_plan.justification,
        status="proposed",
    )


@router.post("/plans/{plan_id}/approve")
async def approve_plan(
    plan_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan_res = await db.execute(select(AgentPlan).where(AgentPlan.plan_id == plan_id))
    plan = plan_res.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.status = "approved"

    co_result = await db.execute(select(Company).where(Company.company_id == plan.company_id))
    company = co_result.scalars().first()
    company_name = company.name if company else "ABC Precision Components"

    # Create Agent Actions based on recommended option (e.g. Option D: Customer A + Supplier B)
    # Action 1: Payment Reminder for Customer A
    draft_cust = run_draft_action(
        action_type="payment_reminder",
        company_name=company_name,
        target_name="ABC Retail Pvt Ltd",
        amount=300000.0,
        context="Overdue timing gap - early payment acceleration request",
    )
    action1 = AgentAction(
        action_id=str(uuid.uuid4()),
        plan_id=plan.plan_id,
        company_id=plan.company_id,
        action_type="payment_reminder",
        target_entity_name="ABC Retail Pvt Ltd",
        target_ref_id="inv-crisis-001",
        permission_level=assign_permission_level("payment_reminder"),
        status="pending_approval",
        payload=draft_cust,
        expected_impact=300000.0,
    )

    # Action 2: Supplier Negotiation for Supplier B
    draft_sup = run_draft_action(
        action_type="supplier_negotiation",
        company_name=company_name,
        target_name="RawMetal Supplies Co",
        amount=250000.0,
        context="Requesting 12-day deferral to align with receivable inflow",
    )
    action2 = AgentAction(
        action_id=str(uuid.uuid4()),
        plan_id=plan.plan_id,
        company_id=plan.company_id,
        action_type="supplier_negotiation",
        target_entity_name="RawMetal Supplies Co",
        target_ref_id="pay-crisis-001",
        permission_level=assign_permission_level("supplier_negotiation"),
        status="pending_approval",
        payload=draft_sup,
        expected_impact=250000.0,
    )

    db.add_all([action1, action2])

    db.add(AuditLog(
        company_id=plan.company_id,
        actor=current_user.get("user_id", "owner"),
        action="plan_approved",
        details={"plan_id": plan_id, "actions_created": [action1.action_id, action2.action_id]}
    ))

    await db.commit()
    return {"status": "success", "message": "Plan approved. Actions generated and awaiting final L2 human review."}


@router.post("/plans/{plan_id}/reject")
async def reject_plan(
    plan_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan_res = await db.execute(select(AgentPlan).where(AgentPlan.plan_id == plan_id))
    plan = plan_res.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.status = "rejected"
    db.add(AuditLog(
        company_id=plan.company_id,
        actor=current_user.get("user_id", "owner"),
        action="plan_rejected",
        details={"plan_id": plan_id}
    ))
    await db.commit()
    return {"status": "rejected", "message": "Plan has been rejected."}


@router.post("/plans/{plan_id}/modify")
async def modify_plan(
    plan_id: str,
    req: ModifyPlanRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan_res = await db.execute(select(AgentPlan).where(AgentPlan.plan_id == plan_id))
    plan = plan_res.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.status = "modified"
    plan.justification += f" (User note: {req.modification_note})"
    await db.commit()
    return {"status": "modified", "plan": plan_id}
