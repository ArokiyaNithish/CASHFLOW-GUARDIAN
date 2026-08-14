import React from 'react';
import { formatINR, getCostRiskColor } from '../../utils/format';
import type { PlanOption } from '../../types';

interface PlanOptionCardProps {
  option: PlanOption;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

export const PlanOptionCard: React.FC<PlanOptionCardProps> = ({
  option,
  isSelected,
  isRecommended,
  onSelect,
}) => (
  <div
    className="card"
    onClick={onSelect}
    style={{
      cursor: 'pointer',
      border: isSelected
        ? '2px solid var(--color-guardian)'
        : isRecommended
        ? '1px solid var(--color-guardian)'
        : '1px solid var(--color-border)',
      transition: 'all 0.15s ease',
      transform: isSelected ? 'translateY(-2px)' : 'none',
      boxShadow: isSelected ? '0 8px 24px rgba(184,102,63,0.12)' : undefined,
      position: 'relative',
      overflow: 'hidden',
      padding: isRecommended ? '0' : '24px',
    }}
  >
    {isRecommended && (
      <div style={{
        background: 'var(--color-guardian)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.08em',
        padding: '6px 16px',
        textAlign: 'center',
      }}>
        ✦ GUARDIAN RECOMMENDS
      </div>
    )}
    <div style={{ padding: isRecommended ? '20px 24px 24px' : '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: isRecommended ? 'var(--color-guardian-bg)' : 'var(--color-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14,
          color: isRecommended ? 'var(--color-guardian)' : 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
        }}>
          {option.label}
        </div>
        {isSelected && (
          <span className="badge badge-guardian">SELECTED ✓</span>
        )}
      </div>

      <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>{option.title}</h3>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
        {option.description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <p className="section-label" style={{ margin: 0 }}>Impact</p>
          <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-healthy)', fontSize: 16 }}>
            +{formatINR(option.impact, true)}
          </p>
        </div>
        <div>
          <p className="section-label" style={{ margin: 0 }}>Cost</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700, color: getCostRiskColor(option.cost_level) }}>
            {option.cost_level.toUpperCase()}
          </p>
        </div>
        <div>
          <p className="section-label" style={{ margin: 0 }}>Risk</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700, color: getCostRiskColor(option.risk_level) }}>
            {option.risk_level.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <p className="section-label" style={{ margin: 0 }}>Confidence</p>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            {Math.round(option.confidence * 100)}%
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border)' }}>
          <div style={{
            height: '100%',
            width: `${option.confidence * 100}%`,
            background: isRecommended ? 'var(--color-guardian)' : 'var(--color-healthy)',
            borderRadius: 2,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>
    </div>
  </div>
);
