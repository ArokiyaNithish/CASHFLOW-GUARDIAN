"""
RAG Retrieve — Loads FAISS index and retrieves relevant policy chunks.
Uses sentence-transformers directly for compatibility.
"""
import os
import pickle
import numpy as np
from pathlib import Path

INDEX_DIR = Path("d:/Hackathon/backend/app/rag/faiss_index/")

# Keyword-based fallback policies (always available, no dependencies)
DEFAULT_POLICIES = [
    "MSMED Act 2006 (Section 15-16): Buyers must settle MSME payments within 45 days of delivery/acceptance. Delayed payments attract penal interest at 3x the RBI bank rate, compounded monthly.",
    "TReDS Eligibility: MSME must have Udyam registration. Buyer must be onboarded on TReDS platform. Invoice must be less than 90 days old. Minimum invoice value: Rs.50,000. Financing up to 90% of invoice value.",
    "Early Payment Reminder Policy: When payment delays exceed 7 days past agreed terms, send a professional reminder citing invoice number, due date, and bank transfer details. Escalate to manager if unpaid after 15 days.",
    "Supplier Deferral Policy: Flexible suppliers can typically accept 15-30 day deferral. Medium negotiability: 10-15 days. Low negotiability: 0-5 days only. Always confirm deferral in writing. Penalty rate awareness is essential.",
    "Payroll Protection: Salary and payroll obligations are non-negotiable and cannot be deferred or reduced under any circumstances. Prioritize above all supplier payments.",
    "Safety Reserve Policy: Micro MSME (turnover < 5Cr): maintain 1 month obligations as reserve. Small MSME (5-75Cr): 6 weeks. Medium (75-250Cr): 2 months reserve. Never go below 50% of safety reserve.",
    "Invoice Financing Criteria: Invoice must be from verified buyer, at least 30 days outstanding, buyer credit rating B+ or better. Financing up to 90% of invoice value. Processing time 24-48 hours. Cost: 1.5-2.5% per month.",
    "L1 Actions (automatic): Analysis, forecasting, alerts, reports - no human approval needed. L2 Actions (approval required): payment reminders, supplier negotiations, financing applications - owner must approve. L3 Actions (blocked): money transfer, bank changes - never implemented.",
    "Working Capital Best Practice: Maintain current ratio > 1.5. Target 30-day receivables cycle. Negotiate 45-60 day payables terms with suppliers. Build relationships with at least 2 invoice financing providers.",
    "Crisis Prevention Playbook: Step 1 - Identify cash gap 20+ days ahead. Step 2 - Contact late-paying customers immediately. Step 3 - Negotiate supplier deferrals for flexible payables. Step 4 - Activate invoice financing if gap > Rs.2L. Step 5 - Alert board/CFO.",
    "Government Schemes for MSMEs: CGTMSE provides collateral-free credit up to Rs.2 Crore. Mudra Loans up to Rs.10 Lakh for micro enterprises. ECLGS emergency credit up to 20% of outstanding credit. Udyam registration mandatory for all schemes.",
    "Risk Mitigation: No single customer should exceed 25% of total receivables. Maintain relationships with 10+ customers. Trade credit insurance (ECGC) recommended for export receivables. Monitor buyer financial health quarterly.",
]

_model = None
_index = None
_chunks_data = None


def _load_resources():
    global _model, _index, _chunks_data
    if _index is not None:
        return True

    index_file = INDEX_DIR / "index.faiss"
    chunks_file = INDEX_DIR / "chunks.pkl"

    if not (index_file.exists() and chunks_file.exists()):
        return False

    try:
        import faiss
        from sentence_transformers import SentenceTransformer

        _index = faiss.read_index(str(index_file))
        with open(chunks_file, "rb") as f:
            _chunks_data = pickle.load(f)
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        return True
    except Exception as e:
        print(f"RAG load failed: {e}, using fallback")
        return False


def retrieve_policy(query: str, k: int = 3, top_k: int = None) -> list[str]:
    """
    Retrieve top-k relevant policy chunks for a query.
    Falls back to keyword matching if FAISS index unavailable.
    """
    if top_k is not None:
        k = top_k
    # Try FAISS vector search first
    if _load_resources() and _index is not None and _model is not None:
        try:
            query_vec = _model.encode([query], convert_to_numpy=True).astype("float32")
            distances, indices = _index.search(query_vec, k)
            texts = _chunks_data["texts"]
            results = []
            for idx in indices[0]:
                if 0 <= idx < len(texts):
                    results.append(texts[idx])
            if results:
                return results
        except Exception as e:
            print(f"FAISS search error: {e}")

    # Keyword-based fallback
    query_words = set(query.lower().split())
    scored = []
    for policy in DEFAULT_POLICIES:
        score = sum(1 for word in query_words if word in policy.lower())
        scored.append((score, policy))
    scored.sort(key=lambda x: -x[0])
    top = [p for _, p in scored[:k]]
    return top if top else DEFAULT_POLICIES[:k]
