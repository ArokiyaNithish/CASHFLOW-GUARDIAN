import React, { useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { CashRunwayChart } from '../components/charts/CashRunwayChart';
import type { Forecast } from '../types';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/format';

type ScenarioType = 'customer_delay' | 'expense' | 'revenue_drop';

const INVOICES = [
  { id: 'inv-crisis-001', label: 'ABC Retail Pvt Ltd — ₹3,00,000' },
  { id: 'inv-crisis-002', label: 'TechMart Solutions — ₹1,80,000' },
  { id: 'inv-crisis-003', label: 'Sunrise Distributors — ₹2,40,000' },
];

export default function WhatIf() {
  const { companyId, latestForecast } = useAppStore();
  const [scenarioType, setScenarioType] = useState<ScenarioType>('customer_delay');
  const [invoiceId, setInvoiceId] = useState(INVOICES[0].id);
  const [extraDays, setExtraDays] = useState(10);
  const [expense, setExpense] = useState(200000);
  const [revenueDrop, setRevenueDrop] = useState(15);
  const [simResult, setSimResult] = useState<{ before: Forecast; after: Forecast; change_amount: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      let payload: any = {};
      if (scenarioType === 'customer_delay') {
        payload = { scenario_type: 'customer_delay', invoice_id: invoiceId, extra_delay_days: extraDays };
      } else if (scenarioType === 'expense') {
        payload = { scenario_type: 'expense', expense_amount: expense };
      } else if (scenarioType === 'revenue_drop') {
        payload = { scenario_type: 'revenue_drop', drop_percentage: revenueDrop };
      }
      const res = await api.simulate(companyId, payload);
      setSimResult(res.data);
    } catch {
      toast.error('Simulation failed. Please generate a baseline forecast first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Scenario Lab</h1>
        <p className="page-subtitle">Simulate "what-if" changes to your cash position</p>
      </div>

      {/* Scenario builder */}
      <div className="card" style={{ marginBottom: 28 }}>
        <p className="section-label" style={{ marginBottom: 16 }}>Build a Scenario</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { value: 'customer_delay', label: '📄 Customer Payment Delay' },
            { value: 'expense', label: '💸 Unexpected Expense' },
            { value: 'revenue_drop', label: '📉 Revenue Drop' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setScenarioType(s.value as ScenarioType)}
              className={scenarioType === s.value ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: 13 }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {scenarioType === 'customer_delay' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Invoice</label>
              <select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                {INVOICES.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
                Additional Delay: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-critical)' }}>+{extraDays} days</span>
              </label>
              <input type="range" min={5} max={30} value={extraDays} onChange={(e) => setExtraDays(Number(e.target.value))} style={{ padding: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                <span>+5 days</span><span>+30 days</span>
              </div>
            </div>
          </div>
        ) : scenarioType === 'expense' ? (
          <div style={{ maxWidth: 280 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Expense Amount</label>
            <input
              type="number" value={expense}
              onChange={(e) => setExpense(Number(e.target.value))}
              placeholder="200000"
            />
          </div>
        ) : (
          <div style={{ maxWidth: 280 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Drop Percentage (%)</label>
            <input
              type="number" value={revenueDrop}
              onChange={(e) => setRevenueDrop(Number(e.target.value))}
              placeholder="15"
            />
          </div>
        )}

        <button className="btn-primary" onClick={handleSimulate} disabled={loading} style={{ marginTop: 20 }}>
          {loading ? 'Simulating…' : 'Run Simulation →'}
        </button>
      </div>

      {/* Results */}
      {simResult && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Before */}
            <div className="card">
              <p className="section-label" style={{ marginBottom: 12, color: 'var(--color-text-secondary)' }}>● CURRENT (BASELINE)</p>
              <CashRunwayChart data={simResult.before.daily_projection} deficitDay={simResult.before.deficit_day} height={200} />
              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                <div>
                  <p className="section-label" style={{ margin: 0 }}>Deficit</p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', color: 'var(--color-critical)', fontWeight: 700 }}>
                    {simResult.before.deficit_day ? `Day ${simResult.before.deficit_day}` : 'None'}
                  </p>
                </div>
                <div>
                  <p className="section-label" style={{ margin: 0 }}>Risk Score</p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {Math.round(simResult.before.risk_score)}/100
                  </p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="card" style={{ border: '1px solid var(--color-critical)' }}>
              <p className="section-label" style={{ marginBottom: 12, color: 'var(--color-critical)' }}>
                ● IF THIS HAPPENS ({scenarioType === 'customer_delay' ? `+${extraDays} days delay` : scenarioType === 'expense' ? formatINR(expense, true) : `${revenueDrop}% revenue drop`})
              </p>
              <CashRunwayChart data={simResult.after.daily_projection} deficitDay={simResult.after.deficit_day} height={200} />
              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                <div>
                  <p className="section-label" style={{ margin: 0 }}>Deficit</p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', color: 'var(--color-critical)', fontWeight: 700 }}>
                    {simResult.after.deficit_day ? `Day ${simResult.after.deficit_day}` : 'None'}
                  </p>
                </div>
                <div>
                  <p className="section-label" style={{ margin: 0 }}>Risk Score</p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-critical)' }}>
                    {Math.round(simResult.after.risk_score)}/100
                  </p>
                </div>
                <div>
                  <p className="section-label" style={{ margin: 0 }}>Cash Impact</p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-critical)' }}>
                    {formatINR(simResult.change_amount, true)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="guardian-panel" style={{ marginTop: 24 }}>
            <p className="section-label" style={{ color: 'var(--color-guardian)' }}>✦ Guardian Recommendation</p>
            <p style={{ marginTop: 8, fontSize: '0.95rem', lineHeight: 1.5 }}>
              This scenario increases your overall cash risk score significantly. If this materializes, you will face a cash deficit on Day {simResult.after.deficit_day || 'N/A'}. 
              Consider drawing from your credit line or prioritizing collections immediately to bridge the gap.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
