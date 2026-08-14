import sys
sys.path.insert(0, '.')
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.all_models import Company, User, Invoice, Payable, RecurringObligation

async def check():
    async with AsyncSessionLocal() as db:
        c = await db.execute(select(Company))
        u = await db.execute(select(User))
        i = await db.execute(select(Invoice))
        p = await db.execute(select(Payable))
        o = await db.execute(select(RecurringObligation))
        companies = c.scalars().all()
        users = u.scalars().all()
        invoices = i.scalars().all()
        payables = p.scalars().all()
        obligations = o.scalars().all()
        print(f"Companies: {len(companies)}")
        print(f"Users: {len(users)}")
        print(f"Invoices: {len(invoices)}")
        print(f"Payables: {len(payables)}")
        print(f"Obligations: {len(obligations)}")
        if companies:
            print(f"Company: {companies[0].name}")
        if invoices:
            print(f"First invoice: {invoices[0].customer_name} - {invoices[0].amount}")

asyncio.run(check())
