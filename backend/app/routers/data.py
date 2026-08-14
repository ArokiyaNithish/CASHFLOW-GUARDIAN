import uuid
from datetime import date, datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.all_models import Company, Invoice, Payable, Transaction, Customer, Supplier, AuditLog

router = APIRouter()


def _parse_date(d_str: str) -> date:
    """Flexible date parser supporting YYYY-MM-DD, DD-MM-YYYY, YYYY/MM/DD, DD/MM/YYYY formats."""
    if not d_str:
        return date.today()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y", "%Y.%m.%d"):
        try:
            return datetime.strptime(d_str.strip(), fmt).date()
        except ValueError:
            pass
    return date.today()


async def _ensure_company(company_id: str, db: AsyncSession, user_name: str = "Owner"):
    co_res = await db.execute(select(Company).where(Company.company_id == company_id))
    company = co_res.scalar_one_or_none()
    if not company:
        company = Company(
            company_id=company_id,
            name=f"{user_name}'s Enterprise",
            safety_reserve=0.0,
        )
        db.add(company)
        await db.commit()


class AddInvoiceRequest(BaseModel):
    customer_name: str
    amount: float
    due_date: str  # YYYY-MM-DD or DD-MM-YYYY
    status: Optional[str] = "open"


class AddPayableRequest(BaseModel):
    supplier_name: str
    amount: float
    due_date: str  # YYYY-MM-DD or DD-MM-YYYY
    priority: Optional[str] = "normal"


class AddTransactionRequest(BaseModel):
    amount: float  # positive = inflow, negative = outflow
    category: str
    counterparty: Optional[str] = ""
    description: Optional[str] = ""


@router.post("/companies/{company_id}/data/invoice")
async def add_invoice(
    company_id: str,
    req: AddInvoiceRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await _ensure_company(company_id, db, current_user.get("name", "Owner"))
    due = _parse_date(req.due_date)

    inv = Invoice(
        invoice_id=str(uuid.uuid4()),
        company_id=company_id,
        customer_id=str(uuid.uuid4()),
        customer_name=req.customer_name,
        amount=float(req.amount),
        issue_date=date.today(),
        due_date=due,
        status=req.status or "open",
        predicted_pay_date=due,
        predicted_pay_prob=0.85,
        predicted_delay_days=0.0,
    )
    db.add(inv)
    db.add(AuditLog(
        company_id=company_id,
        actor=current_user.get("user_id", "owner"),
        action="add_invoice_manual",
        details={"customer_name": req.customer_name, "amount": req.amount}
    ))
    await db.commit()
    return {"status": "success", "invoice_id": inv.invoice_id, "message": "Invoice added successfully"}


@router.post("/companies/{company_id}/data/payable")
async def add_payable(
    company_id: str,
    req: AddPayableRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await _ensure_company(company_id, db, current_user.get("name", "Owner"))
    due = _parse_date(req.due_date)

    pay = Payable(
        payable_id=str(uuid.uuid4()),
        company_id=company_id,
        supplier_id=str(uuid.uuid4()),
        supplier_name=req.supplier_name,
        amount=float(req.amount),
        due_date=due,
        status="open",
        priority=req.priority or "normal",
    )
    db.add(pay)
    db.add(AuditLog(
        company_id=company_id,
        actor=current_user.get("user_id", "owner"),
        action="add_payable_manual",
        details={"supplier_name": req.supplier_name, "amount": req.amount}
    ))
    await db.commit()
    return {"status": "success", "payable_id": pay.payable_id, "message": "Payable added successfully"}


@router.post("/companies/{company_id}/data/transaction")
async def add_transaction(
    company_id: str,
    req: AddTransactionRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await _ensure_company(company_id, db, current_user.get("name", "Owner"))

    # Fetch last balance
    last_res = await db.execute(
        select(Transaction.balance_after).where(Transaction.company_id == company_id).order_by(Transaction.txn_date.desc())
    )
    last_val = last_res.scalar()
    last_bal = float(last_val) if last_val is not None else 0.0
    new_bal = max(0.0, last_bal + req.amount)

    txn = Transaction(
        txn_id=str(uuid.uuid4()),
        company_id=company_id,
        txn_date=date.today(),
        amount=float(req.amount),
        category=req.category,
        counterparty=req.counterparty or "Manual Entry",
        balance_after=new_bal,
        description=req.description or "User recorded cash adjustment",
    )
    db.add(txn)
    db.add(AuditLog(
        company_id=company_id,
        actor=current_user.get("user_id", "owner"),
        action="add_transaction_manual",
        details={"amount": req.amount, "category": req.category}
    ))
    await db.commit()
    return {"status": "success", "txn_id": txn.txn_id, "new_balance": new_bal, "message": "Cash recorded successfully"}