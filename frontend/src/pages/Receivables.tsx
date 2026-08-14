import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import type { Invoice } from '../types';
import { formatINR } from '../utils/format';
import { SkeletonCard } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

import { AddDataModal } from '../components/financial/AddDataModal';
import { PlusCircle } from 'lucide-react';

export default function Receivables() {
  const { companyId } = useAppStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadInvoices = () => {
    if (!companyId) return;
    setLoading(true);
    api.getInvoices(companyId)
      .then((r) => setInvoices(r.data || []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, [companyId]);

  const totalReceivables = invoices.reduce((s, i) => s + i.amount, 0);
  const atRisk = invoices.filter((i) => i.predicted_pay_prob < 0.6).reduce((s, i) => s + i.amount, 0);
  const highRisk = [...invoices].sort((a, b) => a.predicted_pay_prob - b.predicted_pay_prob)[0];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Receivables</h1>
          <p className="page-subtitle">Customer invoice payment predictions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={16} />
          + Add Invoice / Data
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Total Outstanding', amount: totalReceivables, color: 'var(--color-text-primary)' },
          { label: 'At Risk (< 60% prob)', amount: atRisk, color: 'var(--color-critical)' },
          { label: 'Likely to Collect', amount: totalReceivables - atRisk, color: 'var(--color-healthy)' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="section-label" style={{ marginBottom: 8 }}>{s.label}</p>
            <p className="financial-figure" style={{ fontSize: 26, color: s.color }}>{formatINR(s.amount, true)}</p>
          </div>
        ))}
      </div>

      {/* Guardian callout for highest risk */}
      {highRisk && highRisk.predicted_pay_prob < 0.5 && (
        <div className="guardian-panel" style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            ✦ Guardian Alert:{' '}
            <span style={{ fontWeight: 800 }}>{highRisk.customer_name}</span>{' '}
            has only <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-critical)', fontWeight: 800 }}>
              {Math.round(highRisk.predicted_pay_prob * 100)}%
            </span>{' '}
            payment probability on {formatINR(highRisk.amount, true)}.
            A payment reminder is recommended immediately.
          </p>
        </div>
      )}

      {loading ? <SkeletonCard lines={5} /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Customer', 'Amount', 'Due Date', 'Expected Date', 'Payment Prob', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const prob = inv.predicted_pay_prob;
                const probColor = prob < 0.5 ? 'var(--color-critical)' : prob < 0.8 ? 'var(--color-attention)' : 'var(--color-healthy)';
                return (
                  <tr key={inv.invoice_id} style={{ borderBottom: '1px solid var(--color-border-muted)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 13 }}>{inv.customer_name}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>{formatINR(inv.amount, true)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{inv.due_date}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: prob < 0.6 ? 'var(--color-critical)' : 'var(--color-text-primary)' }}>
                      {inv.predicted_pay_date ?? '—'}
                    </td>
                    <td style={{ padding: '14px 16px', minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${prob * 100}%`, background: probColor, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: probColor, minWidth: 32 }}>
                          {Math.round(prob * 100)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${prob < 0.5 ? 'critical' : prob < 0.8 ? 'attention' : 'healthy'}`}>
                        {prob < 0.5 ? 'HIGH RISK' : prob < 0.8 ? 'WATCH' : 'LIKELY'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddDataModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadInvoices}
      />
    </div>
  );
}
