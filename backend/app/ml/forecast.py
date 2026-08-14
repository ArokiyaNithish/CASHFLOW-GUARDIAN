"""
ML Model: Cash Flow Forecaster (Monte Carlo Simulation)
Deterministic math — LLM never touches financial calculations.
"""
import numpy as np
from datetime import date, timedelta
from typing import Optional, List, Dict, Any


class CashFlowForecaster:

    def forecast(
        self,
        current_cash: float,
        open_invoices: List[Dict],
        open_payables: List[Dict],
        recurring_obligations: List[Dict],
        today: date,
        horizon_days: int = 30,
        n_simulations: int = 200,
        scenario_mod: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Monte Carlo cash flow forecast.
        Returns P10/P50/P90 daily projections + deficit detection.
        """
        # Apply scenario modification if given
        invoices = [dict(inv) for inv in open_invoices]
        if scenario_mod:
            for inv in invoices:
                if scenario_mod.get("invoice_id") and inv.get("invoice_id") == scenario_mod["invoice_id"]:
                    extra = scenario_mod.get("extra_delay_days", 0)
                    orig = inv.get("predicted_delay_days", 0)
                    inv["predicted_delay_days"] = orig + extra
                    # Recalculate predicted_pay_date
                    due = inv.get("due_date")
                    if isinstance(due, str):
                        from datetime import datetime
                        due = datetime.strptime(due, "%Y-%m-%d").date()
                    inv["predicted_pay_date"] = (due + timedelta(days=int(orig + extra))).isoformat()
                    inv["predicted_pay_prob"] = max(0.05, inv.get("predicted_pay_prob", 0.5) - 0.15)
            if scenario_mod.get("extra_expense"):
                # Add a one-time expense on day 5
                pass

        # Build deterministic obligation schedule per day
        obligation_by_day: Dict[int, float] = {}
        for pay in open_payables:
            due = pay.get("due_date")
            if isinstance(due, str):
                from datetime import datetime as dt
                due = dt.strptime(due, "%Y-%m-%d").date()
            day_num = (due - today).days
            if 0 < day_num <= horizon_days:
                obligation_by_day[day_num] = obligation_by_day.get(day_num, 0) + pay["amount"]

        for obl in recurring_obligations:
            due_dom = obl.get("due_day_of_month", 1)
            # Find next occurrence within horizon
            for offset in range(1, horizon_days + 1):
                d = today + timedelta(days=offset)
                if d.day == due_dom:
                    obligation_by_day[offset] = obligation_by_day.get(offset, 0) + obl["amount"]
                    break

        # Monte Carlo simulation
        all_paths = np.zeros((n_simulations, horizon_days + 1))
        all_paths[:, 0] = current_cash

        for inv in invoices:
            prob = float(inv.get("predicted_pay_prob", 0.8))
            pay_date = inv.get("predicted_pay_date")
            if isinstance(pay_date, str):
                from datetime import datetime as dt
                pay_date = dt.strptime(pay_date, "%Y-%m-%d").date()
            pay_day = (pay_date - today).days if pay_date else 999

            if 0 < pay_day <= horizon_days:
                amount = float(inv["amount"])
                # Each simulation: does this customer pay?
                payments = np.random.binomial(1, prob, n_simulations) * amount
                all_paths[:, pay_day] += payments

        # Subtract obligations (deterministic)
        for day_num, amount in obligation_by_day.items():
            if day_num <= horizon_days:
                all_paths[:, day_num] -= amount

        # Cumulative sum (cash position per day)
        cumulative = np.cumsum(all_paths, axis=1)

        # Percentiles
        p10 = np.percentile(cumulative, 10, axis=0)
        p50 = np.percentile(cumulative, 50, axis=0)
        p90 = np.percentile(cumulative, 90, axis=0)

        # Build daily projection
        daily_projection = []
        for day in range(horizon_days + 1):
            daily_projection.append({
                "day": day,
                "expected": round(float(p50[day]), 2),
                "worst": round(float(p10[day]), 2),
                "best": round(float(p90[day]), 2),
            })

        # Deficit detection (expected scenario)
        deficit_day = None
        deficit_amount = None
        for dp in daily_projection[1:]:
            if dp["expected"] < 0:
                deficit_day = dp["day"]
                deficit_amount = round(dp["expected"], 2)
                break

        return {
            "daily_projection": daily_projection,
            "current_cash": current_cash,
            "deficit_day": deficit_day,
            "deficit_amount": deficit_amount,
        }
