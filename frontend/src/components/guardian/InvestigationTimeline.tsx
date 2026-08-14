import React from 'react';
import { formatINR } from '../../utils/format';
import type { RiskEvent } from '../../types';

const causeIcon: Record<string, string> = {
  customer_delay: '📄',
  supplier_obligation: '🏭',
  payroll: '👥',
  emi: '🏦',
  tax: '🏛',
  utility: '⚡',
};
const causeLabel: Record<string, string> = {
  customer_delay: 'Customer Payment Delay',
  supplier_obligation: 'Supplier Obligation',
  payroll: 'Staff Payroll',
  emi: 'EMI Payment',
  tax: 'Tax / GST Filing',
  utility: 'Utility Bill',
};

interface InvestigationTimelineProps {
  events: RiskEvent[];
  deficitAmount?: number;
}

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({
  events,
  deficitAmount,
}) => (
  <div className="timeline-container">
    {events.map((ev, i) => (
      <div
        key={ev.event_id}
        className="timeline-item animate-fade-in-up"
        style={{ animationDelay: `${i * 120}ms` }}
      >
        <div className={`timeline-dot ${ev.severity}`} />
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{causeIcon[ev.cause_type] ?? '📋'}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{ev.entity_name}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {causeLabel[ev.cause_type] ?? ev.cause_type}
                </p>
              </div>
            </div>
            <span className={`badge badge-${ev.severity === 'high' ? 'critical' : ev.severity === 'medium' ? 'attention' : 'healthy'}`}>
              {ev.severity.toUpperCase()} RISK
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p className="section-label" style={{ margin: 0 }}>Impact</p>
              <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-critical)', fontSize: 15 }}>
                {formatINR(ev.impact_amount, true)}
              </p>
            </div>
            <div>
              <p className="section-label" style={{ margin: 0 }}>Due</p>
              <p style={{ margin: '2px 0 0', fontSize: 13 }}>Day {ev.due_day}</p>
            </div>
            {ev.expected_day !== ev.due_day && (
              <div>
                <p className="section-label" style={{ margin: 0 }}>Expected</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-attention)' }}>
                  Day {ev.expected_day}{' '}
                  <span style={{ fontSize: 11 }}>(+{ev.expected_day - ev.due_day}d delay)</span>
                </p>
              </div>
            )}
            <div>
              <p className="section-label" style={{ margin: 0 }}>Confidence</p>
              <p style={{ margin: '2px 0 0', fontSize: 13 }}>{Math.round(ev.confidence * 100)}%</p>
            </div>
          </div>
        </div>
      </div>
    ))}

    {/* Terminal deficit node */}
    {deficitAmount !== undefined && (
      <div style={{ position: 'relative', paddingLeft: 0 }}>
        <div style={{
          position: 'absolute', left: -36, top: 10, width: 22, height: 22, borderRadius: 4,
          background: 'var(--color-critical)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, fontWeight: 700, zIndex: 1,
        }}>▼</div>
        <div style={{
          background: 'var(--color-critical-bg)',
          border: '1px solid var(--color-critical)',
          borderRadius: 8,
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--color-critical)', letterSpacing: '0.06em' }}>
            PROJECTED CASH DEFICIT
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color: 'var(--color-critical)' }}>
            {formatINR(Math.abs(deficitAmount), true)}
          </p>
        </div>
      </div>
    )}
  </div>
);
