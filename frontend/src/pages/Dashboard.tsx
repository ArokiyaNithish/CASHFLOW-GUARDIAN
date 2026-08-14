import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { HealthRing } from '../components/financial/HealthRing';
import { KpiCard } from '../components/financial/KpiCard';
import { FinancialWeather } from '../components/financial/FinancialWeather';
import { CashRunwayChart } from '../components/charts/CashRunwayChart';
import { GuardianAlertBanner } from '../components/guardian/GuardianAlertBanner';
import { AddDataModal } from '../components/financial/AddDataModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PlusCircle } from 'lucide-react';
import type { Snapshot, Forecast } from '../types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { companyId, snapshot, setSnapshot, latestForecast, setForecast } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!companyId) return;
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const targetCompany = companyId || 'abc-precision-001';
    try {
      // Load snapshot
      const snapRes = await api.getSnapshot(targetCompany);
      setSnapshot(snapRes.data);

      // Load or generate forecast
      try {
        const fcRes = await api.getLatestForecast(targetCompany);
        setForecast(fcRes.data);
      } catch {
        const fcRes = await api.runForecast(targetCompany);
        setForecast(fcRes.data);
      }
    } catch (err) {
      // Clean zero state fallback
      setSnapshot({
        current_cash: 0,
        total_receivables: 0,
        total_payables: 0,
        receivables_at_risk: 0,
        upcoming_obligations_30d: 0,
        risk_score: 0,
        health_score: 100,
        health_label: 'STABLE',
        weather: 'STABLE',
        latest_forecast_id: null,
      });
      setForecast({
        forecast_id: 'fc-zero-001',
        company_id: targetCompany,
        generated_at: new Date().toISOString(),
        daily_projection: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1, expected: 0, best: 0, worst: 0
        })),
        current_cash: 0,
        deficit_day: null,
        deficit_amount: 0,
        risk_score: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const snap = snapshot || {
    current_cash: 0,
    total_receivables: 0,
    total_payables: 0,
    receivables_at_risk: 0,
    upcoming_obligations_30d: 0,
    risk_score: 0,
    health_score: 100,
    health_label: 'STABLE',
    weather: 'STABLE',
    latest_forecast_id: null,
  };
  const fc = latestForecast || {
    forecast_id: 'fc-zero-001',
    company_id: companyId || 'new-company',
    generated_at: new Date().toISOString(),
    daily_projection: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1, expected: 0, best: 0, worst: 0
    })),
    current_cash: 0,
    deficit_day: null,
    deficit_amount: 0,
    risk_score: 0,
  };

  const subScores = [
    { label: 'Liquidity', value: Math.max(0, Math.min(100, (snap.current_cash / 800000) * 100)) },
    { label: 'Receivables', value: Math.max(0, Math.min(100, 100 - (snap.receivables_at_risk / Math.max(1, snap.total_receivables)) * 100)) },
    { label: 'Obligations', value: Math.max(0, Math.min(100, 100 - (snap.upcoming_obligations_30d / Math.max(1, snap.current_cash)) * 70)) },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Financial Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={16} />
            + Add Money / Financial Data
          </button>
          {snap && <FinancialWeather riskScore={snap.risk_score} />}
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
          {/* Row 1: HealthRing + Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 24 }}>
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
                safetyReserve={0}
                height={240}
              />
            </div>
          </div>

          {/* Row 2: KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
            <KpiCard
              label="Cash Available"
              amount={snap?.current_cash ?? 0}
              subLabel="safety reserve"
              subAmount={0}
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

          {/* Row 3: Guardian Alert Banner */}
          {fc?.deficit_day && fc?.deficit_amount && (
            <GuardianAlertBanner
              deficitAmount={fc.deficit_amount}
              daysToDeficit={fc.deficit_day}
              confidence={0.82}
              onInvestigate={() => navigate('/guardian')}
            />
          )}
        </>
      )}

      <AddDataModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
