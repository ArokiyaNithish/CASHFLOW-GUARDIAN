"""
Run this from d:\Hackathon\backend directory:
  python seed_runner.py
"""
import sys
import os
import asyncio

# Ensure the backend directory is in path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from datetime import date, timedelta, datetime
from app.core.database import AsyncSessionLocal, init_db
from app.core.auth import get_password_hash
from app.models.all_models import (
    Company, User, Customer, Supplier, Invoice, Payable,
    RecurringObligation, Transaction, AuditLog
)

TODAY = date.today()
COMPANY_ID = "abc-precision-001"
USER_ID = "arun-demo-001"


async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select
        existing = await db.execute(select(Company).where(Company.company_id == COMPANY_ID))
        if existing.scalar_one_or_none():
            print("[OK] Demo data already seeded. Skipping.")
            return

        company = Company(
            company_id=COMPANY_ID, name="ABC Precision Components",
            industry="Manufacturing", safety_reserve=100000.0,
        )
        db.add(company)

        user = User(
            user_id=USER_ID, company_id=COMPANY_ID, name="Arun Kumar",
            email="arun@abcprecision.com",
            password_hash=get_password_hash("demo1234"), role="owner",
        )
        db.add(user)

        cust_a = Customer(customer_id="cust-a-001", company_id=COMPANY_ID, name="ABC Retail Pvt Ltd",
            avg_delay_days=11.0, std_delay_days=3.0, reliability_score=42.0, profile="chronic_late")
        cust_b = Customer(customer_id="cust-b-001", company_id=COMPANY_ID, name="TechMart Solutions",
            avg_delay_days=2.0, std_delay_days=1.0, reliability_score=90.0, profile="reliable")
        cust_c = Customer(customer_id="cust-c-001", company_id=COMPANY_ID, name="Sunrise Distributors",
            avg_delay_days=5.0, std_delay_days=2.0, reliability_score=71.0, profile="moderate")
        db.add_all([cust_a, cust_b, cust_c])

        sup_b = Supplier(supplier_id="sup-b-001", company_id=COMPANY_ID, name="RawMetal Supplies Co",
            negotiability="high", penalty_rate=0.01)
        sup_c = Supplier(supplier_id="sup-c-001", company_id=COMPANY_ID, name="Industrial Tools Ltd",
            negotiability="low", penalty_rate=0.03)
        db.add_all([sup_b, sup_c])

        db.add_all([
            Invoice(invoice_id="inv-crisis-001", company_id=COMPANY_ID, customer_id="cust-a-001",
                customer_name="ABC Retail Pvt Ltd", amount=300000.0,
                issue_date=TODAY - timedelta(days=25), due_date=TODAY + timedelta(days=5),
                status="open", predicted_pay_date=TODAY + timedelta(days=16),
                predicted_pay_prob=0.18, predicted_delay_days=11.0),
            Invoice(invoice_id="inv-crisis-002", company_id=COMPANY_ID, customer_id="cust-b-001",
                customer_name="TechMart Solutions", amount=180000.0,
                issue_date=TODAY - timedelta(days=10), due_date=TODAY + timedelta(days=12),
                status="open", predicted_pay_date=TODAY + timedelta(days=14),
                predicted_pay_prob=0.91, predicted_delay_days=2.0),
            Invoice(invoice_id="inv-crisis-003", company_id=COMPANY_ID, customer_id="cust-c-001",
                customer_name="Sunrise Distributors", amount=240000.0,
                issue_date=TODAY - timedelta(days=5), due_date=TODAY + timedelta(days=20),
                status="open", predicted_pay_date=TODAY + timedelta(days=23),
                predicted_pay_prob=0.74, predicted_delay_days=3.0),
        ])

        db.add_all([
            Payable(payable_id="pay-crisis-001", company_id=COMPANY_ID, supplier_id="sup-b-001",
                supplier_name="RawMetal Supplies Co", amount=250000.0,
                due_date=TODAY + timedelta(days=8), status="open", priority="flexible"),
            Payable(payable_id="pay-crisis-002", company_id=COMPANY_ID, supplier_id="sup-c-001",
                supplier_name="Industrial Tools Ltd", amount=120000.0,
                due_date=TODAY + timedelta(days=20), status="open", priority="normal"),
        ])

        db.add_all([
            RecurringObligation(obligation_id="obl-001", company_id=COMPANY_ID,
                type="payroll", amount=180000.0,
                due_day_of_month=(TODAY + timedelta(days=10)).day,
                frequency="monthly", label="Staff Payroll"),
            RecurringObligation(obligation_id="obl-002", company_id=COMPANY_ID,
                type="emi", amount=80000.0,
                due_day_of_month=(TODAY + timedelta(days=12)).day,
                frequency="monthly", label="Equipment EMI"),
            RecurringObligation(obligation_id="obl-003", company_id=COMPANY_ID,
                type="tax", amount=120000.0,
                due_day_of_month=(TODAY + timedelta(days=15)).day,
                frequency="quarterly", label="GST Filing"),
            RecurringObligation(obligation_id="obl-004", company_id=COMPANY_ID,
                type="rent", amount=50000.0, due_day_of_month=1,
                frequency="monthly", label="Factory Rent"),
            RecurringObligation(obligation_id="obl-005", company_id=COMPANY_ID,
                type="utility", amount=15000.0, due_day_of_month=5,
                frequency="monthly", label="Power & Water"),
        ])

        db.add(Transaction(
            txn_id="txn-seed-001", company_id=COMPANY_ID, txn_date=TODAY,
            amount=0.0, category="opening_balance", counterparty="System",
            balance_after=620000.0, description="Opening balance seed",
        ))
        db.add(AuditLog(company_id=COMPANY_ID, actor="system",
            action="demo_data_seeded",
            details={"message": "Crisis scenario seeded for demo"},
        ))

        await db.commit()
        print("[OK] Crisis scenario seeded successfully!")
        print("  Login: arun@abcprecision.com / demo1234")
        print("  Cash: Rs.6,20,000  |  Crisis deficit: Rs.1,40,000 on Day 17")


if __name__ == "__main__":
    asyncio.run(seed())
