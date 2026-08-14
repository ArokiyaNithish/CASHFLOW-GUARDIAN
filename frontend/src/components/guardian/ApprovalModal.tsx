import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { AgentAction } from '../../types';
import { formatINR } from '../../utils/format';
import { AlertTriangle } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: AgentAction | null;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen, onClose, action, onApprove, onReject, loading,
}) => {
  const typeLabel: Record<string, string> = {
    payment_reminder: 'Payment Reminder',
    supplier_negotiation: 'Supplier Negotiation',
    financing_request: 'Invoice Financing Request',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Action — Human Approval Required" maxWidth="540px">
      {action && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span className="badge badge-guardian">
              {action.permission_level}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              — Requires manual approval
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p className="section-label" style={{ marginBottom: 4 }}>Action Type</p>
            <p style={{ fontSize: 14, fontWeight: 600 }}>
              {typeLabel[action.action_type] ?? action.action_type}
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p className="section-label" style={{ marginBottom: 4 }}>Target</p>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{action.target_entity_name}</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p className="section-label" style={{ marginBottom: 4 }}>Expected Cash Impact</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--color-healthy)' }}>
              +{formatINR(action.expected_impact, true)}
            </p>
          </div>

          {action.payload?.body && (
            <div style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 8, padding: '14px',
              marginBottom: 16, maxHeight: 160, overflowY: 'auto',
            }}>
              <p className="section-label" style={{ marginBottom: 6 }}>Draft Preview</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
                {action.payload.body}
              </p>
            </div>
          )}

          {/* Safety disclaimer */}
          <div style={{
            background: 'var(--color-attention-bg)',
            border: '1px solid var(--color-attention)',
            borderRadius: 8, padding: '12px 14px',
            marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <AlertTriangle size={16} color="var(--color-attention)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              You are authorizing Guardian to send this communication on behalf of your company.
              Payroll and EMI obligations are protected and cannot be modified. All actions are logged.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-danger" onClick={onReject} disabled={loading}>Reject</button>
            <button className="btn-secondary" onClick={onClose} disabled={loading}>Review Later</button>
            <Button onClick={onApprove} loading={loading}>Approve & Send ✓</Button>
          </div>
        </>
      )}
    </Modal>
  );
};
