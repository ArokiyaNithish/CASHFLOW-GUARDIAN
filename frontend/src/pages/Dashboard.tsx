import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { HealthRing } from '../components/financial/HealthRing';
import { KpiCard } from '../components/financial/KpiCard';
import { CashRunwayChart } from '../components/charts/CashRunwayChart';
import { FinancialWeather } from '../components/financial/FinancialWeather';
import { GuardianAlertBanner } from '../components/guardian/GuardianAlertBanner';
import { AddDataModal } from '../components/financial/AddDataModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PlusCircle, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { companyId, snapshot, setSnapshot, latestForecast, setForecast } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFlowchartModal, setShowFlowchartModal] = useState(false);

  const targetCompany = companyId || 'abc-precision-001';

  useEffect(() => {
    loadData();
  }, [targetCompany]);

  const loadData = async () => {
    setLoading(true);
    try {
      const snapRes = await api.getSnapshot(targetCompany);
      setSnapshot(snapRes.data);
    } catch {
      // Fallback for demo company
      if (targetCompany === 'abc-precision-001') {
        setSnapshot({
          company_id: 'abc-precision-001',
          current_cash: 620000,
          total_receivables: 720000,
          receivables_at_risk: 300000,
          total_payables: 370000,
          upcoming_obligations_30d: 445000,
          health_score: 28,
          as_of_date: new Date().toISOString(),
        } as any);
      }
    }

    try {
      const fcRes = await api.getLatestForecast(targetCompany);
      setForecast(fcRes.data);
    } catch {
      if (targetCompany === 'abc-precision-001') {
        setForecast({
          forecast_id: 'fc-demo-001',
          current_cash: 620000,
          deficit_day: 17,
          deficit_amount: -140000,
          risk_score: 72,
          daily_projection: Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            let val = 620000;
            if (day >= 8) val = 370000;
            if (day >= 10) val = 190000;
            if (day >= 15) val = 70000;
            if (day >= 17) val = -140000;
            if (day >= 25) val = 80000;
            return { day, expected: val, worst: val - 50000, best: val + 60000 };
          }),
        } as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const snap = snapshot || (targetCompany === 'abc-precision-001' ? {
    current_cash: 620000,
    total_receivables: 720000,
    receivables_at_risk: 300000,
    upcoming_obligations_30d: 445000,
    health_score: 28,
  } : null);

  const fc = latestForecast || (targetCompany === 'abc-precision-001' ? {
    deficit_day: 17,
    deficit_amount: -140000,
    daily_projection: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      let val = 620000;
      if (day >= 8) val = 370000;
      if (day >= 10) val = 190000;
      if (day >= 15) val = 70000;
      if (day >= 17) val = -140000;
      if (day >= 25) val = 80000;
      return { day, expected: val, worst: val - 50000, best: val + 60000 };
    }),
  } : null);

  const subScores = snap ? [
    { label: 'Liquidity', value: Math.max(0, Math.min(100, (snap.current_cash / 800000) * 100)) },
    { label: 'Receivables', value: Math.max(0, Math.min(100, 100 - (snap.receivables_at_risk / Math.max(1, snap.total_receivables)) * 100)) },
    { label: 'Obligations', value: Math.max(0, Math.min(100, 100 - (snap.upcoming_obligations_30d / Math.max(1, snap.current_cash)) * 70)) },
  ] : [];

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Financial Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => setShowFlowchartModal(true)}>
            <Cpu size={16} color="var(--color-guardian)" />
            🤖 How AI/ML &amp; LLM Predicts Crisis
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={16} />
            + Add Money / Financial Data
          </button>
          {snap && <FinancialWeather riskScore={100 - (snap.health_score || 100)} />}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={2} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </div>
      ) : (
        <>
          {/* Guardian Crisis Alert Banner (if deficit exists) */}
          {fc?.deficit_day && (
            <div style={{ marginBottom: 24 }}>
              <GuardianAlertBanner
                deficitDay={fc.deficit_day}
                deficitAmount={Math.abs(fc.deficit_amount ?? 0)}
              />
            </div>
          )}

          {/* Row 1: HealthRing + Chart */}
          <div className="responsive-grid-dashboard" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 24 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 28 }}>
              <p className="section-label" style={{ marginBottom: 20 }}>Health Score</p>
              <HealthRing score={snap?.health_score ?? 100} subScores={subScores} size={160} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p className="section-label">30-Day Cash Runway</p>
                {fc?.deficit_day && (
                  <span className="badge badge-critical">Deficit on Day {fc.deficit_day}</span>
                )}
              </div>
              <CashRunwayChart
                data={fc?.daily_projection ?? []}
                deficitDay={fc?.deficit_day}
                safetyReserve={100000}
                height={240}
              />
            </div>
          </div>

          {/* Row 2: KPI Cards */}
          <div className="responsive-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
            <KpiCard
              label="Cash Available"
              amount={snap?.current_cash ?? 0}
              subLabel="safety reserve"
              subAmount={100000}
            />
            <KpiCard
              label="Total Receivables"
              amount={snap?.total_receivables ?? 0}
              subLabel="at risk"
              subAmount={snap?.receivables_at_risk ?? 0}
              amountColor="var(--color-healthy)"
            />
            <KpiCard
              label="Upcoming Obligations"
              amount={snap?.upcoming_obligations_30d ?? 0}
              subLabel="next 30 days"
              amountColor="var(--color-attention)"
            />
          </div>
        </>
      )}

      {/* Add Data Modal */}
      <AddDataModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
      />

      {/* AI & ML System Architecture Flowchart Modal */}
      {showFlowchartModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 720, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🤖</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>System Architecture: AI, ML &amp; LLM Flowchart</h3>
              </div>
              <button onClick={() => setShowFlowchartModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ background: 'var(--color-bg)', padding: 14, borderRadius: 10, borderLeft: '4px solid #4285F4' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#4285F4' }}>1. Financial Digital Twin (Data Layer)</p>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>
                  Ingests live available cash, open customer receivables, supplier payables, and recurring payroll/tax obligations to maintain a digital twin of company liquidity.
                </p>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: 14, borderRadius: 10, borderLeft: '4px solid #34A853' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#34A853' }}>2. XGBoost Payment Delay Model (Machine Learning)</p>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>
                  Replaces static due dates with ML payment delay predictions trained on historical buyer behavior to calculate real expected cash arrival dates and payment probabilities (P(pay)).
                </p>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: 14, borderRadius: 10, borderLeft: '4px solid #FBBC05' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#D39A3D' }}>3. Monte Carlo 30-Day Cash Runway Simulator (Risk Engine)</p>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>
                  Executes 200+ stochastic daily simulations generating P10 (worst-case), P50 (expected), and P90 (best-case) cash runway curves to pinpoint exact cash deficit days 20+ days ahead.
                </p>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: 14, borderRadius: 10, borderLeft: '4px solid #AA00FF' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#AA00FF' }}>4. FAISS Vector RAG Policy Search (Knowledge Retrieval)</p>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>
                  Searches 15 dense vector policy guides (MSMED Act 45-day rule, TReDS eligibility, invoice discounting limits) to ground AI recommendations in statutory rules.
                </p>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: 14, borderRadius: 10, borderLeft: '4px solid var(--color-guardian)' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--color-guardian)' }}>5. Google Gemini 1.5 Flash LLM (Agent Reasoning)</p>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>
                  Synthesizes ML predictions + RAG policies to formulate 4 structured rescue plan options (A, B, C, D) with pre-drafted communications.
                </p>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: 14, borderRadius: 10, borderLeft: '4px solid #EA4335' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#EA4335' }}>6. Code-Gated Human Approval Gate (Safety Check)</p>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>
                  Enforces strict execution permissions (L1/L2/L3). Action status MUST be approved by the human owner before any code logic or API dispatch runs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
