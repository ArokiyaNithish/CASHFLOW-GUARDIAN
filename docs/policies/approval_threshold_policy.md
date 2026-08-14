# Approval Threshold Policy

To maintain control over cash flow interventions and automated actions, CashFlow Guardian uses a tiered approval system based on the severity of the action.

Approval Levels (L1, L2, L3):

**L1: Auto (No Approval Required)**
- **Scope:** Analytical and informational tasks.
- **Actions:** Running daily cash flow forecasts, analyzing customer payment patterns, calculating risk scores, generating dashboard alerts, and drafting internal reports.
- **Rationale:** These actions do not alter the company's financial position or engage external parties.

**L2: Approval Needed**
- **Scope:** External communications and non-binding financial applications.
- **Actions:** Sending payment reminders to customers, initiating early payment requests, sending deferral requests to suppliers, and submitting applications for invoice financing.
- **Rationale:** These actions affect external relationships or initiate financial processes, requiring review by an authorized user (owner or finance manager) before execution.

**L3: Blocked (Manual Action Required Outside System)**
- **Scope:** Direct financial transfers and core banking changes.
- **Actions:** Executing money transfers, altering bank account details, or automatically accepting loan terms.
- **Rationale:** High-risk actions that require strict dual-control and must be performed directly through secure banking portals, not automatically by the agent.
