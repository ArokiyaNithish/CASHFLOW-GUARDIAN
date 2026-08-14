import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, Integer, Date, DateTime, JSON, ForeignKey, Text, Boolean
from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Company(Base):
    __tablename__ = "companies"
    company_id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    industry = Column(String, default="Manufacturing")
    registration_no = Column(String)
    safety_reserve = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    user_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="owner")  # owner, finance_manager, viewer
    created_at = Column(DateTime, default=datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    name = Column(String, nullable=False)
    avg_delay_days = Column(Float, default=0.0)
    std_delay_days = Column(Float, default=1.0)
    reliability_score = Column(Float, default=100.0)
    profile = Column(String, default="reliable")  # reliable, moderate, chronic_late


class Supplier(Base):
    __tablename__ = "suppliers"
    supplier_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    name = Column(String, nullable=False)
    negotiability = Column(String, default="medium")  # high, medium, low
    penalty_rate = Column(Float, default=0.0)


class Invoice(Base):
    __tablename__ = "invoices"
    invoice_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    customer_name = Column(String)
    amount = Column(Float, nullable=False)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String, default="open")  # open, paid, overdue
    predicted_pay_date = Column(Date)
    predicted_pay_prob = Column(Float, default=0.8)
    predicted_delay_days = Column(Float, default=0.0)


class Payable(Base):
    __tablename__ = "payables"
    payable_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    supplier_id = Column(String, ForeignKey("suppliers.supplier_id"), nullable=True)
    supplier_name = Column(String)
    amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String, default="open")  # open, paid, delayed
    priority = Column(String, default="normal")  # critical, normal, flexible


class RecurringObligation(Base):
    __tablename__ = "recurring_obligations"
    obligation_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    type = Column(String)  # payroll, rent, emi, tax, utility
    amount = Column(Float, nullable=False)
    due_day_of_month = Column(Integer, default=1)
    frequency = Column(String, default="monthly")
    label = Column(String)


class Transaction(Base):
    __tablename__ = "transactions"
    txn_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    txn_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)  # negative = outflow
    category = Column(String)
    counterparty = Column(String)
    balance_after = Column(Float)
    description = Column(String)


class Forecast(Base):
    __tablename__ = "forecasts"
    forecast_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    generated_at = Column(DateTime, default=datetime.utcnow)
    horizon_days = Column(Integer, default=30)
    daily_projection = Column(JSON)  # [{day, expected, best, worst}]
    current_cash = Column(Float)
    deficit_day = Column(Integer)
    deficit_amount = Column(Float)
    risk_score = Column(Float, default=0.0)
    scenario_type = Column(String, default="baseline")


class RiskEvent(Base):
    __tablename__ = "risk_events"
    event_id = Column(String, primary_key=True, default=gen_uuid)
    forecast_id = Column(String, ForeignKey("forecasts.forecast_id"))
    cause_type = Column(String)  # customer_delay, supplier_obligation, payroll, emi, tax
    entity_name = Column(String)
    reference_id = Column(String)
    impact_amount = Column(Float)
    due_day = Column(Integer)
    expected_day = Column(Integer)
    severity = Column(String)  # high, medium, low
    confidence = Column(Float, default=0.8)


class AgentPlan(Base):
    __tablename__ = "agent_plans"
    plan_id = Column(String, primary_key=True, default=gen_uuid)
    forecast_id = Column(String, ForeignKey("forecasts.forecast_id"))
    company_id = Column(String, ForeignKey("companies.company_id"))
    reasoning_text = Column(Text)
    options = Column(JSON)
    recommended_option = Column(String, default="D")
    justification = Column(Text)
    status = Column(String, default="proposed")  # proposed, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentAction(Base):
    __tablename__ = "agent_actions"
    action_id = Column(String, primary_key=True, default=gen_uuid)
    plan_id = Column(String, ForeignKey("agent_plans.plan_id"))
    company_id = Column(String, ForeignKey("companies.company_id"))
    action_type = Column(String)  # payment_reminder, supplier_negotiation, financing_request
    target_entity_name = Column(String)
    target_ref_id = Column(String)
    permission_level = Column(String, default="L2_approval")  # L1_auto, L2_approval, L3_strict
    status = Column(String, default="pending_approval")  # pending_approval, approved, executed, rejected
    payload = Column(JSON)
    executed_at = Column(DateTime)
    approved_by = Column(String)
    expected_impact = Column(Float, default=0.0)


class AuditLog(Base):
    __tablename__ = "audit_log"
    log_id = Column(String, primary_key=True, default=gen_uuid)
    company_id = Column(String, ForeignKey("companies.company_id"))
    actor = Column(String)
    action = Column(String)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
