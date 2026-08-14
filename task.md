# CashFlow Guardian — Build Task Tracker

## Phase 0: Project Scaffolding
- [x] Workspace exists at d:\Hackathon
- [x] Create full folder structure
- [x] Create backend requirements.txt
- [x] Create frontend Vite+React+TS project
- [x] Create .env template
- [x] Create root README.md

## Phase 1: Synthetic Data + Database
- [x] generate_dataset.py — full synthetic MSME dataset
- [x] seed_crisis.py — deterministic ABC Precision crisis scenario
- [x] Generate all 6 CSVs (customers, suppliers, transactions, invoices, payables, loans, expenses)
- [x] backend/app/core/database.py — SQLAlchemy async engine
- [x] backend/app/models/ — all 11 ORM models
- [x] SQLite init script & DB auto-seeding

## Phase 2: Backend Core
- [x] backend/main.py — FastAPI app entry
- [x] backend/app/core/config.py
- [x] backend/app/core/auth.py — JWT helpers
- [x] backend/app/core/permissions.py — RBAC
- [x] backend/app/schemas/ — Pydantic schemas
- [x] backend/app/routers/auth.py
- [x] backend/app/routers/companies.py
- [x] backend/app/routers/data.py — CSV ingestion
- [x] backend/app/routers/forecast.py
- [x] backend/app/routers/risk.py
- [x] backend/app/routers/agent.py
- [x] backend/app/routers/actions.py
- [x] backend/app/routers/simulator.py
- [x] backend/app/routers/ask.py
- [x] backend/app/routers/audit.py

## Phase 3: ML Models
- [x] backend/app/ml/payment_delay.py — XGBoost regression
- [x] backend/app/ml/forecast.py — Monte Carlo simulation
- [x] backend/app/ml/risk.py — Rules engine risk scorer
- [x] backend/app/ml/anomaly.py — Transaction anomaly detection
- [x] Train ML models on synthetic data

## Phase 4: RAG Pipeline
- [x] docs/policies/ — 15 policy markdown documents
- [x] backend/app/rag/ingest.py — FAISS index builder
- [x] backend/app/rag/retrieve.py — retrieve_policy() tool

## Phase 5: Agent Orchestrator
- [x] backend/app/agent/prompts.py — all 4 LLM prompts
- [x] backend/app/agent/tools.py — 8 agent tools
- [x] backend/app/agent/rules_engine.py — L1/L2/L3 enforcement
- [x] backend/app/agent/orchestrator.py — LangGraph state machine

## Phase 6: Frontend Design System
- [x] frontend/src/index.css — full design system (CSS vars)
- [x] frontend/src/types/index.ts
- [x] frontend/src/api/client.ts
- [x] frontend/src/store/useAppStore.ts
- [x] frontend/src/utils/ (formatCurrency, formatRisk, financialWeather)

## Phase 7: Frontend Components
- [x] layout/Sidebar.tsx + AppShell.tsx
- [x] charts/CashRunwayChart.tsx
- [x] charts/BeforeAfterPanel.tsx
- [x] guardian/GuardianAlertBanner.tsx
- [x] guardian/InvestigationTimeline.tsx
- [x] guardian/PlanOptionCard.tsx
- [x] guardian/ApprovalModal.tsx
- [x] guardian/AskGuardian.tsx
- [x] financial/HealthRing.tsx
- [x] financial/KpiCard.tsx
- [x] financial/FinancialWeather.tsx
- [x] ui/Badge.tsx + Button.tsx + Card.tsx + Modal.tsx + Toast.tsx

## Phase 8: Frontend Pages
- [x] pages/Login.tsx
- [x] pages/Dashboard.tsx ← DEMO CRITICAL
- [x] pages/Forecast.tsx ← DEMO CRITICAL
- [x] pages/Investigation.tsx ← DEMO CRITICAL
- [x] pages/AgentPlan.tsx ← DEMO CRITICAL
- [x] pages/ActionCenter.tsx ← DEMO CRITICAL
- [x] pages/WhatIf.tsx
- [x] pages/Receivables.tsx
- [x] pages/Payables.tsx
- [x] pages/Onboarding.tsx
- [x] App.tsx router + auth guard

## Phase 9: Integration & Testing
- [x] End-to-end demo path works on seeded crisis data
- [x] Before/After forecast recalculation verified
- [x] All approval gates tested
- [x] Audit log populated
