"""
Agent Tools — Operational tools used by the LangGraph orchestrator.
Wraps internal ML, DB, and RAG calls as callable agent functions.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.rag.retrieve import retrieve_policy
from app.ml.forecast import CashFlowForecaster
from app.ml.risk import RiskScorer
from app.agent.rules_engine import assign_permission_level, validate_action_safety


async def tool_get_company_snapshot(company_id: str, db: AsyncSession) -> Dict[str, Any]:
    """Retrieve financial snapshot for company."""
    from app.routers.companies import get_snapshot
    return await get_snapshot(company_id, db)


async def tool_run_cashflow_forecast(company_id: str, db: AsyncSession) -> Dict[str, Any]:
    """Run 30-day Monte Carlo cash flow forecast."""
    from app.routers.forecast import _build_forecast
    return await _build_forecast(company_id, db)


def tool_retrieve_policy_context(query: str, k: int = 3) -> List[str]:
    """Retrieve RAG policy context from FAISS vector store."""
    return retrieve_policy(query, k=k)


def tool_compute_risk_score(deficit_day: int, deficit_amount: float, safety_reserve: float, events: List[Dict]) -> float:
    """Compute 0-100 risk score using deterministic rules engine."""
    scorer = RiskScorer()
    return scorer.score(deficit_day, deficit_amount, safety_reserve, events)


def tool_assign_permission(action_type: str) -> str:
    """Assign permission level (L1_auto, L2_approval, L3_strict) for an action."""
    return assign_permission_level(action_type)


def tool_validate_safety(action_type: str, amount: float, permission_level: str) -> bool:
    """Validate safety rules for proposed financial action."""
    return validate_action_safety(action_type, amount, permission_level)
