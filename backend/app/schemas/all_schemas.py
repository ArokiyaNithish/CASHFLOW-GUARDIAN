from datetime import date
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr


# ── Auth ─────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    company_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    company_id: str

# ── Company ───────────────────────────────────────────────────────────
class CompanyOut(BaseModel):
    company_id: str
    name: str
    industry: str
    safety_reserve: float

class SnapshotOut(BaseModel):
    current_cash: float
    total_receivables: float
    total_payables: float
    receivables_at_risk: float
    upcoming_obligations_30d: float
    risk_score: float
    health_score: float
    health_label: str
    weather: str
    latest_forecast_id: Optional[str] = None

# ── Invoices / Payables ───────────────────────────────────────────────
class InvoiceOut(BaseModel):
    invoice_id: str
    customer_name: str
    amount: float
    due_date: str
    predicted_pay_date: Optional[str]
    predicted_pay_prob: float
    status: str

class PayableOut(BaseModel):
    payable_id: str
    supplier_name: str
    amount: float
    due_date: str
    priority: str
    status: str

# ── Forecast ──────────────────────────────────────────────────────────
class DayForecast(BaseModel):
    day: int
    expected: float
    best: float
    worst: float

class ForecastOut(BaseModel):
    forecast_id: str
    company_id: str
    generated_at: str
    daily_projection: List[DayForecast]
    current_cash: float
    deficit_day: Optional[int]
    deficit_amount: Optional[float]
    risk_score: float

# ── Risk ──────────────────────────────────────────────────────────────
class RiskEventOut(BaseModel):
    event_id: str
    cause_type: str
    entity_name: str
    impact_amount: float
    due_day: int
    expected_day: int
    severity: str
    confidence: float

# ── Plan ──────────────────────────────────────────────────────────────
class PlanOption(BaseModel):
    label: str
    title: str
    description: str
    impact: float
    cost_level: str
    risk_level: str
    confidence: float

class AgentPlanOut(BaseModel):
    plan_id: str
    forecast_id: str
    reasoning_text: str
    options: List[PlanOption]
    recommended_option: str
    justification: str
    status: str

# ── Actions ───────────────────────────────────────────────────────────
class AgentActionOut(BaseModel):
    action_id: str
    action_type: str
    target_entity_name: str
    permission_level: str
    status: str
    payload: Optional[Any]
    expected_impact: float
    executed_at: Optional[str]

# ── Simulate ──────────────────────────────────────────────────────────
class SimulateRequest(BaseModel):
    scenario_type: str = "customer_delay"  # customer_delay, expense
    invoice_id: Optional[str] = None
    extra_delay_days: Optional[int] = 10
    expense_amount: Optional[float] = None

class SimulateOut(BaseModel):
    before: ForecastOut
    after: ForecastOut
    change_amount: float

# ── Ask ───────────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str

# ── Audit ─────────────────────────────────────────────────────────────
class AuditEntryOut(BaseModel):
    log_id: str
    actor: str
    action: str
    details: Optional[Any]
    created_at: str

class ModifyPlanRequest(BaseModel):
    modification_note: str
