"""
Safety Rules Engine — Deterministic enforcement.
The LLM does NOT control which actions execute. This engine does.
"""
from typing import Tuple

# ── Permission Level Assignment ────────────────────────────────────────
L1_AUTO = [
    "analyze", "forecast", "alert", "report", "calculate",
]
L2_APPROVAL = [
    "payment_reminder", "supplier_negotiation", "financing_request",
    "customer_followup", "payment_plan",
]
L3_STRICT = [
    "money_transfer", "bank_change", "loan", "borrowing",
    "payroll_delay", "delay_payroll",
]

PROTECTED_OBLIGATIONS = ["payroll", "salary"]


def assign_permission_level(action_type: str) -> str:
    action_lower = action_type.lower()
    for l3 in L3_STRICT:
        if l3 in action_lower:
            return "L3_strict"
    for l1 in L1_AUTO:
        if l1 in action_lower:
            return "L1_auto"
    return "L2_approval"


def validate_action_safety(action_type: str, target_data: dict) -> Tuple[bool, str]:
    """
    Returns (is_safe, rejection_reason).
    Rejected actions are blocked before the LLM draft is created.
    """
    action_lower = action_type.lower()

    # ❌ Payroll can NEVER be delayed
    for protected in PROTECTED_OBLIGATIONS:
        target_name = str(target_data.get("entity_name", "")).lower()
        if protected in action_lower or (protected in target_name and "delay" in action_lower):
            return False, f"Safety Rule: {protected.title()} obligations cannot be delayed or renegotiated. This is a legal and ethical requirement."

    # ❌ L3 actions are blocked in prototype
    if assign_permission_level(action_type) == "L3_strict":
        return False, f"Action type '{action_type}' requires L3 (strict) authorization. Not available in this prototype — contact your bank directly."

    # ❌ Cannot renegotiate fixed/critical priority payables
    if "renegotiate" in action_lower or "delay" in action_lower:
        priority = target_data.get("priority", "normal")
        if priority == "critical":
            return False, f"Cannot renegotiate '{target_data.get('entity_name', 'this obligation')}' — marked as CRITICAL priority."

    return True, ""


def get_action_description(action_type: str) -> str:
    descriptions = {
        "payment_reminder": "Send a professional payment follow-up to the customer",
        "supplier_negotiation": "Request deferred payment terms from supplier",
        "financing_request": "Initiate invoice financing enquiry",
        "customer_followup": "Schedule a call with the customer",
    }
    return descriptions.get(action_type, action_type.replace("_", " ").title())
