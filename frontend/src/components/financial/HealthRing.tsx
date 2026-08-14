import React from 'react';
import { getRiskInfo } from '../../utils/format';

interface SubScore {
  label: string;
  value: number;
}

interface HealthRingProps {
  score: number;
  subScores?: SubScore[];
  size?: number;
}

export const HealthRing: React.FC<HealthRingProps> = ({
  score,
  subScores = [],
  size = 160,
}) => {
  const radius = (size / 2) - 14;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;
  const { label, color } = getRiskInfo(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={10}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: size * 0.22,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}>
            {Math.round(clamped)}
          </span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color,
            marginTop: 3,
            textTransform: 'uppercase',
          }}>
            {label}
          </span>
        </div>
      </div>

      {/* Sub-scores */}
      {subScores.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {subScores.map((ss) => {
            const { color: ssColor } = getRiskInfo(100 - ss.value); // invert: high value = good
            return (
              <div key={ss.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="section-label">{ss.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: ssColor }}>
                    {Math.round(ss.value)}
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, ss.value)}%`,
                    background: ssColor,
                    borderRadius: 2,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
