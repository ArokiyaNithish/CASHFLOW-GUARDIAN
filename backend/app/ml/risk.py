"""
Risk Scorer — Deterministic rules engine.
Produces 0-100 risk score + ranked list of root cause events.
LLM never calculates these scores.
"""
from typing import List, Dict, Any, Optional
from datetime import date, datetime


class RiskScorer:

    def score(
        self,
        deficit_day: Optional[int],
        deficit_amount: Optional[float],
        safety_reserve: float,
        risk_events: List[Dict],
    ) -> float:
        """
        Risk score formula:
          deficit_severity = |deficit_amount| / safety_reserve  (capped at 1)
          time_pressure    = 1 - deficit_day/30  (higher if sooner)
          cause_confidence = avg confidence of top-3 events
        Final = 100 * (0.40*deficit_severity + 0.35*time_pressure + 0.25*cause_confidence)
        """
        if not deficit_day or not deficit_amount:
            return max(0.0, 15.0 + len([e for e in risk_events if e.get("severity") == "high"]) * 5)

        deficit_severity = min(1.0, abs(deficit_amount) / max(safety_reserve, 1))
        time_pressure = max(0.0, 1.0 - (deficit_day / 30))
        top3 = sorted(risk_events, key=lambda e: e.get("impact_amount", 0), reverse=True)[:3]
        cause_confidence = sum(e.get("confidence", 0.7) for e in top3) / max(len(top3), 1)

        raw = 100 * (0.40 * deficit_severity + 0.35 * time_pressure + 0.25 * cause_confidence)
        return round(min(100.0, max(0.0, raw)), 1)

    def health_score(self, risk_score: float) -> int:
        return max(0, min(100, int(100 - risk_score)))

    def health_label(self, risk_score: float) -> str:
        if risk_score >= 80: return "CRITICAL"
        if risk_score >= 60: return "ATTENTION"
        if risk_score >= 40: return "WATCH"
        return "HEALTHY"

    def weather(self, risk_score: float) -> str:
        if risk_score >= 80: return "STORM APPROACHING"
        if risk_score >= 60: return "CAUTION"
        if risk_score >= 40: return "WATCH"
        return "STABLE"

    def get_risk_events(
        self,
        open_invoices: List[Dict],
        open_payables: List[Dict],
        recurring_obligations: List[Dict],
        forecast_id: str,
        today: date,
        horizon_days: int = 30,
    ) -> List[Dict]:
        """
        Build ranked list of risk-contributing events.
        """
        events = []

        # Customer payment delays
        for inv in open_invoices:
            delay = float(inv.get("predicted_delay_days", 0))
            prob = float(inv.get("predicted_pay_prob", 0.9))
            amount = float(inv.get("amount", 0))

            if delay > 3 or prob < 0.7:
                due = inv.get("due_date")
                if isinstance(due, str):
                    due = datetime.strptime(due, "%Y-%m-%d").date()
                pred = inv.get("predicted_pay_date")
                if isinstance(pred, str):
                    pred = datetime.strptime(pred, "%Y-%m-%d").date()

                due_day = (due - today).days if due else 99
                exp_day = (pred - today).days if pred else due_day + int(delay)

                if 0 < exp_day <= horizon_days:
                    severity = "high" if (prob < 0.4 or delay > 8) else ("medium" if prob < 0.7 else "low")
                    confidence = max(0.5, 1 - prob + 0.3)
                    events.append({
                        "event_id": f"ev-{inv.get('invoice_id', 'x')}",
                        "forecast_id": forecast_id,
                        "cause_type": "customer_delay",
                        "entity_name": inv.get("customer_name", "Unknown Customer"),
                        "reference_id": inv.get("invoice_id"),
                        "impact_amount": amount,
                        "due_day": max(0, due_day),
                        "expected_day": max(0, exp_day),
                        "severity": severity,
                        "confidence": round(min(0.99, confidence), 2),
                    })

        # Supplier payables
        for pay in open_payables:
            due = pay.get("due_date")
            if isinstance(due, str):
                due = datetime.strptime(due, "%Y-%m-%d").date()
            due_day = (due - today).days if due else 99

            if 0 < due_day <= horizon_days:
                amount = float(pay.get("amount", 0))
                priority = pay.get("priority", "normal")
                severity = "high" if priority == "critical" else ("medium" if priority == "normal" else "low")
                events.append({
                    "event_id": f"ev-{pay.get('payable_id', 'x')}",
                    "forecast_id": forecast_id,
                    "cause_type": "supplier_obligation",
                    "entity_name": pay.get("supplier_name", "Supplier"),
                    "reference_id": pay.get("payable_id"),
                    "impact_amount": amount,
                    "due_day": due_day,
                    "expected_day": due_day,
                    "severity": severity,
                    "confidence": 0.95,
                })

        # Recurring obligations
        for obl in recurring_obligations:
            due_dom = obl.get("due_day_of_month", 1)
            for offset in range(1, horizon_days + 1):
                d = today + __import__("datetime").timedelta(days=offset)
                if d.day == due_dom:
                    obl_type = obl.get("type", "other")
                    severity = "high" if obl_type == "payroll" else "medium"
                    events.append({
                        "event_id": f"ev-obl-{obl.get('obligation_id', 'x')}",
                        "forecast_id": forecast_id,
                        "cause_type": obl_type,
                        "entity_name": obl.get("label", obl_type.title()),
                        "reference_id": obl.get("obligation_id"),
                        "impact_amount": float(obl.get("amount", 0)),
                        "due_day": offset,
                        "expected_day": offset,
                        "severity": severity,
                        "confidence": 1.0,
                    })
                    break

        # Sort by impact descending
        events.sort(key=lambda e: e["impact_amount"], reverse=True)
        return events
