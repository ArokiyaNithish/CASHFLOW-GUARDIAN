import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { CashRunwayChart } from '../components/charts/CashRunwayChart';
import { AskGuardian } from '../components/guardian/AskGuardian';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { Forecast } from '../types';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/format';

export default function ForecastPage() {
  const { companyId, latestForecast, setForecast } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    loadForecast();
  }, [companyId]);

  const loadForecast = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      try { const r = await api.getLatestForecast(companyId); setForecast(r.data); }
      catch { const r = await api.runForecast(companyId); setForecast(r.data); }
    } catch { toast.error('Failed to load forecast'); }
    finally { setLoading(false); }
  };

  const fc = latestForecast;
  const displayData = fc?.daily_projection?.filter((d) => d.day <= horizon) ?? [];

  const obligations = (fc as any)?.obligations || [];
  const invoices = (fc as any)?.invoices || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cash Flow Forecast</h1>
        <p className="page-subtitle">Monte Carlo simulation — P10/P50/P90 scenarios</p>
      </div>

      {/* Horizon toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[7, 30, 60].map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={horizon === h ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 16px', fontSize: 13 }}
          >
            {h} Days
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonCard lines={4} />
      ) : (
        <>
          {/* Main chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p className="section-label">{horizon}-Day Cash Projection</p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {fc?.deficit_day && fc.deficit_day <= horizon && (
                  <span className="badge badge-critical">⚠ Deficit Day {fc.deficit_day}</span>
                )}
                {fc?.risk_score !== undefined && (
                  <span className={`badge badge-${fc.risk_score >= 70 ? 'critical' : fc.risk_score >= 45 ? 'attention' : 'healthy'}`}>
                    Risk {Math.round(fc.risk_score)}/100
                  </span>
                )}
              </div>
            </div>
            <CashRunwayChart data={displayData} deficitDay={fc?.deficit_day} safetyReserve={fc?.safety_reserve || 0} height={300} />
          </div>

          {/* Deficit callout */}
          {fc?.deficit_day && fc.deficit_day <= horizon && (
            <div className="guardian-panel" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>
                  Deficit detected on Day {fc.deficit_day}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  Projected shortfall:{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-critical)' }}>
                    {formatINR(Math.abs(fc.deficit_amount ?? 0), true)}
                  </span>
                </p>
              </div>
              <button className="btn-primary" onClick={() => navigate('/guardian')}>
                Investigate Root Cause →
              </button>
            </div>
          )}

          {/* Obligations & Receivables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="card">
              <p className="section-label" style={{ marginBottom: 14 }}>Upcoming Obligations</p>
              {obligations.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>No obligations added yet.</p>
              ) : (
                obligations.map((ob: any) => (
                  <div key={ob.obligation_id || ob.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border-muted)' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{ob.label || 'Obligation'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>Day {ob.due_day_of_month || 1}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>{formatINR(ob.amount, true)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <p className="section-label" style={{ marginBottom: 14 }}>Receivables at Risk</p>
              {invoices.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>No open invoices added yet.</p>
              ) : (
                invoices.map((inv: any) => (
                  <div key={inv.invoice_id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{inv.customer_name}</p>
                      <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>{formatINR(inv.amount, true)}</p>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(inv.predicted_pay_prob || 0.8) * 100}%`,
                        background: (inv.predicted_pay_prob || 0.8) < 0.5 ? 'var(--color-critical)' : 'var(--color-healthy)',
                        borderRadius: 3,
                      }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <AskGuardian />
        </>
      )}
    </div>
  );
}
