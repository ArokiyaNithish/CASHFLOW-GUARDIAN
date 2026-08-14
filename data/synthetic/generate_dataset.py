"""
Synthetic Dataset Generator for CashFlow Guardian
Generates realistic MSME financial data for ABC Precision Components
"""
import uuid
import random
import csv
import os
from datetime import date, timedelta
from faker import Faker

fake = Faker("en_IN")
random.seed(42)

TODAY = date.today()
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
COMPANY_ID = "abc-precision-001"

# ── Customer profiles ─────────────────────────────────────────────────
PROFILES = {
    "reliable":     {"avg_delay": 1,  "std_delay": 1,  "reliability": 92},
    "moderate":     {"avg_delay": 5,  "std_delay": 2,  "reliability": 74},
    "chronic_late": {"avg_delay": 12, "std_delay": 4,  "reliability": 45},
}

def gen_uuid():
    return str(uuid.uuid4())


def generate_customers(n=50):
    customers = []
    choices = (
        ["reliable"] * 25 +
        ["moderate"] * 18 +
        ["chronic_late"] * 7
    )
    for i, profile in enumerate(choices):
        p = PROFILES[profile]
        customers.append({
            "customer_id": gen_uuid(),
            "company_id": COMPANY_ID,
            "name": fake.company()[:40],
            "avg_delay_days": p["avg_delay"] + random.uniform(-0.5, 0.5),
            "std_delay_days": p["std_delay"],
            "reliability_score": p["reliability"] + random.randint(-5, 5),
            "profile": profile,
        })
    return customers


def generate_suppliers(n=25):
    suppliers = []
    neg_choices = ["high"] * 8 + ["medium"] * 12 + ["low"] * 5
    for neg in neg_choices:
        suppliers.append({
            "supplier_id": gen_uuid(),
            "company_id": COMPANY_ID,
            "name": fake.company()[:40],
            "negotiability": neg,
            "penalty_rate": round(random.uniform(0, 0.03), 3),
        })
    return suppliers


def generate_invoices(customers):
    invoices = []
    for _ in range(100):
        cust = random.choice(customers)
        issue = TODAY - timedelta(days=random.randint(5, 120))
        due = issue + timedelta(days=random.randint(30, 60))
        delay = max(0, round(random.gauss(cust["avg_delay_days"], cust["std_delay_days"])))
        pred_pay = due + timedelta(days=delay)
        prob = max(0.1, min(0.99, cust["reliability_score"] / 100 - random.uniform(-0.1, 0.1)))
        status = "paid" if pred_pay < TODAY else "open"
        invoices.append({
            "invoice_id": gen_uuid(),
            "company_id": COMPANY_ID,
            "customer_id": cust["customer_id"],
            "customer_name": cust["name"],
            "amount": round(random.uniform(50000, 500000), -3),
            "issue_date": issue.isoformat(),
            "due_date": due.isoformat(),
            "status": status,
            "predicted_pay_date": pred_pay.isoformat(),
            "predicted_pay_prob": round(prob, 2),
            "predicted_delay_days": delay,
        })
    return invoices


def generate_payables(suppliers):
    payables = []
    for _ in range(30):
        sup = random.choice(suppliers)
        due = TODAY + timedelta(days=random.randint(1, 45))
        priority = "flexible" if sup["negotiability"] == "high" else ("normal" if sup["negotiability"] == "medium" else "critical")
        payables.append({
            "payable_id": gen_uuid(),
            "company_id": COMPANY_ID,
            "supplier_id": sup["supplier_id"],
            "supplier_name": sup["name"],
            "amount": round(random.uniform(30000, 300000), -3),
            "due_date": due.isoformat(),
            "status": "open",
            "priority": priority,
        })
    return payables


def generate_transactions(current_cash=620000):
    txns = []
    balance = current_cash
    for day_back in range(180, 0, -1):
        d = TODAY - timedelta(days=day_back)
        # Monthly inflows
        if d.day in [1, 15]:
            inflow = round(random.uniform(200000, 400000), -3)
            balance += inflow
            txns.append({"txn_id": gen_uuid(), "company_id": COMPANY_ID, "txn_date": d.isoformat(),
                         "amount": inflow, "category": "receivable", "counterparty": fake.company()[:30],
                         "balance_after": round(balance, 2), "description": "Payment received"})
        # Monthly outflows
        if d.day in [5, 10, 20, 25]:
            outflow = round(random.uniform(80000, 250000), -3)
            balance -= outflow
            txns.append({"txn_id": gen_uuid(), "company_id": COMPANY_ID, "txn_date": d.isoformat(),
                         "amount": -outflow, "category": "payable", "counterparty": fake.company()[:30],
                         "balance_after": round(balance, 2), "description": "Supplier payment"})
    # Ensure last balance = 620000
    if txns:
        txns[-1]["balance_after"] = 620000
    return txns


def generate_recurring():
    return [
        {"obligation_id": gen_uuid(), "company_id": COMPANY_ID, "type": "payroll", "amount": 180000,
         "due_day_of_month": 10, "frequency": "monthly", "label": "Staff Payroll"},
        {"obligation_id": gen_uuid(), "company_id": COMPANY_ID, "type": "rent", "amount": 50000,
         "due_day_of_month": 1, "frequency": "monthly", "label": "Factory Rent"},
        {"obligation_id": gen_uuid(), "company_id": COMPANY_ID, "type": "emi", "amount": 80000,
         "due_day_of_month": 15, "frequency": "monthly", "label": "Equipment EMI"},
        {"obligation_id": gen_uuid(), "company_id": COMPANY_ID, "type": "tax", "amount": 120000,
         "due_day_of_month": 15, "frequency": "quarterly", "label": "GST Filing"},
        {"obligation_id": gen_uuid(), "company_id": COMPANY_ID, "type": "utility", "amount": 15000,
         "due_day_of_month": 5, "frequency": "monthly", "label": "Power & Water"},
    ]


def write_csv(data, filename):
    if not data:
        return
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"  [OK] {filename} ({len(data)} rows)")


if __name__ == "__main__":
    print("Generating CashFlow Guardian synthetic dataset...")
    customers = generate_customers()
    suppliers = generate_suppliers()
    invoices = generate_invoices(customers)
    payables = generate_payables(suppliers)
    transactions = generate_transactions()
    recurring = generate_recurring()

    write_csv(customers, "customers.csv")
    write_csv(suppliers, "suppliers.csv")
    write_csv(invoices, "invoices.csv")
    write_csv(payables, "payables.csv")
    write_csv(transactions, "transactions.csv")
    write_csv(recurring, "recurring_obligations.csv")
    print("Dataset generation complete!")
