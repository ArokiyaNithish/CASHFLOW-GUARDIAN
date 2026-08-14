import React from 'react';
import { getWeather } from '../../utils/format';

interface FinancialWeatherProps {
  riskScore: number;
}

export const FinancialWeather: React.FC<FinancialWeatherProps> = ({ riskScore }) => {
  const { icon, label } = getWeather(riskScore);
  const colors: Record<string, string> = {
    'STORM APPROACHING': 'var(--color-critical)',
    'CAUTION': 'var(--color-attention)',
    'WATCH': 'var(--color-attention)',
    'STABLE': 'var(--color-healthy)',
  };
  const color = colors[label] || 'var(--color-text-primary)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <p className="section-label" style={{ margin: 0 }}>Financial Weather</p>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color }}>{label}</p>
      </div>
    </div>
  );
};
