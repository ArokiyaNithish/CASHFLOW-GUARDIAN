# CashFlow Guardian ✦

> **Autonomous Financial Early-Warning & Rescue Agent for MSMEs**
> *"Predict the cash crisis. Understand why. Plan the rescue. Act before it happens."*

---

## 🌟 Overview

MSMEs don't fail because they are unprofitable — they fail because they **run out of usable cash at the wrong time**. CashFlow Guardian is a FinTech Agentic AI system that predicts liquidity timing gaps 30 days in advance, identifies root causes, formulates multi-option rescue plans grounded in RAG policy knowledge, and executes human-approved financial interventions.

---

## 🏗️ Architecture & Features

- **Predictive ML Engine**: 30-day Monte Carlo simulation (P10/P50/P90 cash trajectory), XGBoost payment delay predictor, transaction anomaly detector, and deterministic risk scorer.
- **RAG Knowledge Base**: FAISS vector store with 15 MSME payment policies, TReDS eligibility criteria, and government financing norms (`sentence-transformers/all-MiniLM-L6-v2`).
- **LangGraph Agent Orchestrator**: 4-stage pipeline (**REASON → PLAN → DRAFT → VERIFY**).
- **Human-in-the-Loop & Code-Gated Security**: Strict 3-level permission model (`L1_auto`, `L2_approval`, `L3_strict`) with hard code-level execution gates.
- **Interactive Web App**: React + TypeScript + Vite UI with executive health score ring, interactive runway charts, scenario simulator, action center, and audit log.

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python seed_runner.py  # Seed crisis scenario data
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev -- --port 5173
```

---

## 🧪 Testing Integration & Demo Flow

Run the full 10-step E2E integration test suite:
```bash
cd backend
python test_api.py
```

### Demo Login Credentials
- **URL**: `http://localhost:5173/login`
- **Email**: `arun@abcprecision.com`
- **Password**: `demo1234`
