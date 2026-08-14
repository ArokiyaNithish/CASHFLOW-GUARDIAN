import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { formatINR } from '../../utils/format';

interface GuardianAlertBannerProps {
  deficitAmount: number;
  daysToDeficit: number;
  confidence?: number;
  onInvestigate?: () => void;
}

export const GuardianAlertBanner: React.FC<GuardianAlertBannerProps> = ({
  deficitAmount,
  daysToDeficit,
  confidence = 0.82,
  onInvestigate,
}) => {
  const navigate = useNavigate();
  const handle = onInvestigate ?? (() => navigate('/guardian'));

  return (
    <div className="guardian-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ color: 'var(--color-guardian)', fontWeight: 800, fontSize: 13, letterSpacing: '0.06em' }}>✦ GUARDIAN ALERT</span>
          <span className="badge badge-attention">CASH PRESSURE DETECTED</span>
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Projected cash deficit in{' '}
          <strong style={{ color: 'var(--color-guardian)' }}>{daysToDeficit} days</strong>
        </p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Estimated shortfall:{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-critical)', fontWeight: 700 }}>
            {formatINR(Math.abs(deficitAmount), true)}
          </span>
          {' '}· Confidence: {Math.round(confidence * 100)}%
        </p>
      </div>
      <button className="btn-primary" onClick={handle}>
        <AlertTriangle size={14} />
        Understand the risk →
      </button>
    </div>
  );
};
