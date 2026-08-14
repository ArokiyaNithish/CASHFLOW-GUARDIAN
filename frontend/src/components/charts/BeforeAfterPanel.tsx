import React from 'react';
import { CashRunwayChart } from './CashRunwayChart';
import { formatINR } from '../../utils/format';
import type { Forecast } from '../../types';

interface BeforeAfterPanelProps {
  before: Forecast;
  after: Forecast;
}

export const BeforeAfterPanel: React.FC<BeforeAfterPanelProps> = ({ before, after }) => {
  const beforeDeficit = before.deficit_amount ?? 0;
  const afterDeficit = after.deficit_amount ?? 0;
  const improvement = Math.abs(beforeDeficit) - Math.abs(Math.min(0, afterDeficit));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
      {/* BEFORE */}
      <div>
        <p className="section-label" style={{ color: 'var(--color-critical)', marginBottom: 8 }}>● BEFORE</p>
        <CashRunwayChart data={before.daily_projection} deficitDay={before.deficit_day} height={160} />
        <p style={{
          textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 18,
          color: 'var(--color-critical)', fontWeight: 700, marginTop: 8,
        }}>
          {before.deficit_day ? `Deficit: ${formatINR(beforeDeficit, true)}` : 'No deficit'}
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
          Risk Score: {Math.round(before.risk_score)}/100
        </p>
      </div>

      {/* ARROW + DELTA */}
      <div style={{ textAlign: 'center', padding: '0 8px' }}>
        <div style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>→</div>
        {improvement > 0 && (
          <>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-healthy)', fontWeight: 700, margin: '6px 0 2px' }}>
              +{formatINR(improvement, true)}
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>better</p>
          </>
        )}
      </div>

      {/* AFTER */}
      <div>
        <p className="section-label" style={{ color: 'var(--color-healthy)', marginBottom: 8 }}>● AFTER</p>
        <CashRunwayChart data={after.daily_projection} deficitDay={after.deficit_day} height={160} />
        <p style={{
          textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 18,
          color: after.deficit_day ? 'var(--color-attention)' : 'var(--color-healthy)',
          fontWeight: 700, marginTop: 8,
        }}>
          {after.deficit_day
            ? `Deficit: ${formatINR(afterDeficit, true)}`
            : `Surplus: +${formatINR(Math.abs(afterDeficit || 310000), true)}`}
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
          Risk Score: {Math.round(after.risk_score)}/100
        </p>
      </div>
    </div>
  );
};
