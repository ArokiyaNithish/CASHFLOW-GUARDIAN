import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { ApprovalModal } from '../components/guardian/ApprovalModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { AgentAction } from '../types';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/format';
import { CheckCircle, Clock, XCircle, Zap } from 'lucide-react';

export default function ActionCenter() {
  const { companyId } = useAppStore();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  useEffect(() => {
    loadActions();
  }, [companyId]);

  const loadActions = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.getActions(companyId);
      setActions(res.data);
      const auditRes = await api.getAuditLog(companyId);
      setAuditLog(auditRes.data);
    } catch {
      toast.error('Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async () => {
    if (!selectedAction) return;
    setExecuting(selectedAction.action_id);
    try {
      await api.approveAction(selectedAction.action_id);
      toast.success('Action approved!');
      await api.executeAction(selectedAction.action_id);
      toast.success('✦ Action executed! Forecast is being recalculated.');
      setModalOpen(false);
      loadActions();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Execution failed');
    } finally {
      setExecuting(null);
    }
  };

  const handleRejectAction = async () => {
    if (!selectedAction) return;
    try {
      toast('Action rejected and will not be executed.');
      setModalOpen(false);
    } catch { /* */ }
  };

  const pending = actions.filter((a) => a.status === 'pending_approval');
  const executed = actions.filter((a) => a.status === 'executed');

  const typeLabel: Record<string, string> = {
    payment_reminder: '📄 Payment Reminder',
    supplier_negotiation: '🏭 Supplier Negotiation',
    financing_request: '💰 Invoice Financing',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Action Center</h1>
        <p className="page-subtitle">Review and authorize Guardian-proposed actions</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SkeletonCard lines={4} /><SkeletonCard lines={4} />
        </div>
      ) : (
        <>
          {/* Pending Approval */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Clock size={16} color="var(--color-attention)" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Pending Your Approval</h2>
              {pending.length > 0 && <span className="badge badge-attention">{pending.length} actions</span>}
            </div>

            {pending.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                <p>No actions pending. Approve a rescue plan first.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pending.map((action) => (
                  <div key={action.action_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{typeLabel[action.action_type] ?? action.action_type}</span>
                        <span className="badge badge-attention">{action.permission_level}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        Target: <strong>{action.target_entity_name}</strong>
                        {' · '}Expected impact:{' '}
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-healthy)' }}>
                          +{formatINR(action.expected_impact, true)}
                        </span>
                      </p>
                      {action.payload?.subject && (
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          "{action.payload.subject}"
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-secondary" style={{ fontSize: 12 }}
                        onClick={() => { setSelectedAction(action); setModalOpen(true); }}>
                        <Zap size={12} />
                        Review &amp; Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Executed */}
          {executed.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <CheckCircle size={16} color="var(--color-healthy)" />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Executed Actions</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {executed.map((action) => (
                  <div key={action.action_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.85 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{typeLabel[action.action_type] ?? action.action_type}</span>
                      <span style={{ margin: '0 8px', color: 'var(--color-text-muted)' }}>·</span>
                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{action.target_entity_name}</span>
                    </div>
                    <span className="badge badge-healthy">✓ EXECUTED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {auditLog.length > 0 && (
            <div>
              <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Audit Trail</h2>
              <div className="card" style={{ maxHeight: 280, overflowY: 'auto' }}>
                {auditLog.map((log) => (
                  <div key={log.log_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border-muted)' }}>
                    <div>
                      <span className="section-label">{log.actor}</span>
                      <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>·</span>
                      <span style={{ fontSize: 13 }}>{log.action.replace(/_/g, ' ')}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.created_at).toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ApprovalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action={selectedAction}
        onApprove={handleApproveAction}
        onReject={handleRejectAction}
        loading={executing === selectedAction?.action_id}
      />
    </div>
  );
}
