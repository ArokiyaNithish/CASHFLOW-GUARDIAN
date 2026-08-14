import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { formatINR } from '../utils/format';
import { SkeletonCard } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

import { AddDataModal } from '../components/financial/AddDataModal';
import { PlusCircle } from 'lucide-react';

export default function Payables() {
  const { companyId } = useAppStore();
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadPayables = () => {
    if (!companyId) return;
    setLoading(true);
    api.getSnapshot(companyId)
      .then((r) => {
        setPayables(r.data?.payables || []);
      })
      .catch(() => {
        setPayables([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayables();
  }, [companyId]);

  const totalPayables = payables.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Payables</h1>
          <p className="page-subtitle">Upcoming obligations and supplier payments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={16} />
          + Add Payable / Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Total Outstanding', amount: totalPayables, color: 'var(--color-text-primary)' },
          { label: 'Critical / High Priority', amount: payables.filter(p => p.priority === 'critical' || p.priority === 'high').reduce((s, p) => s + p.amount, 0), color: 'var(--color-critical)' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="section-label" style={{ marginBottom: 8 }}>{s.label}</p>
            <p className="financial-figure" style={{ fontSize: 26, color: s.color }}>{formatINR(s.amount, true)}</p>
          </div>
        ))}
      </div>

      {loading ? <SkeletonCard lines={5} /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Supplier', 'Amount', 'Due Date', 'Days Until Due', 'Priority', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payables.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-muted)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 13 }}>{p.supplier_name}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>{formatINR(p.amount, true)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.due_date}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13 }}>
                    <span style={{ color: p.days_until_due <= 7 ? 'var(--color-critical)' : 'inherit', fontWeight: p.days_until_due <= 7 ? 700 : 400 }}>
                      {p.days_until_due} days
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge badge-${p.priority === 'critical' ? 'critical' : p.priority === 'high' ? 'attention' : 'healthy'}`}>
                      {p.priority.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ textTransform: 'capitalize', fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddDataModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadPayables}
      />
    </div>
  );
}
