import React from 'react';
import { formatINR } from '../../utils/format';

interface KpiCardProps {
  label: string;
  amount: number;
  subLabel?: string;
  subAmount?: number;
  delta?: number;
  compact?: boolean;
  amountColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  amount,
  subLabel,
  subAmount,
  delta,
  compact = true,
  amountColor,
}) => (
  <div className="card" style={{ height: '100%' }}>
    <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
    <p
      className="financial-figure"
      style={{ fontSize: 28, margin: 0, color: amountColor || 'var(--color-text-primary)' }}
    >
      {formatINR(amount, compact)}
    </p>
    {delta !== undefined && (
      <p style={{
        fontSize: 12,
        margin: '5px 0 0',
        color: delta >= 0 ? 'var(--color-healthy)' : 'var(--color-critical)',
      }}>
        {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}% vs last month
      </p>
    )}
    {subLabel && subAmount !== undefined && (
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-critical)' }}>
          {formatINR(subAmount, true)}
        </span>{' '}
        {subLabel}
      </p>
    )}
  </div>
);
