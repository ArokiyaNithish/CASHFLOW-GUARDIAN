import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, Legend,
} from 'recharts';
import { formatINR } from '../../utils/format';
import type { DayForecast } from '../../types';

interface CashRunwayChartProps {
  data: DayForecast[];
  deficitDay?: number | null;
  safetyReserve?: number;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>
      <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
        Day {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ margin: '2px 0', fontSize: 12, color: p.color }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {formatINR(p.value, true)}
          </span>{' '}
          <span style={{ color: 'var(--color-text-secondary)' }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
};

export const CashRunwayChart: React.FC<CashRunwayChartProps> = ({
  data,
  deficitDay,
  safetyReserve,
  height = 280,
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No forecast data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="bestGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F7D62" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#4F7D62" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="worstGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C85C4A" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#C85C4A" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Red danger zone below zero */}
        <ReferenceArea y1={-9999999} y2={0} fill="#FAE9E7" fillOpacity={0.35} />

        {deficitDay && (
          <ReferenceLine
            x={deficitDay}
            stroke="var(--color-critical)"
            strokeDasharray="4 4"
            label={{ value: `Day ${deficitDay}`, position: 'insideTopRight', fill: 'var(--color-critical)', fontSize: 11, fontWeight: 600 }}
          />
        )}
        {safetyReserve && (
          <ReferenceLine
            y={safetyReserve}
            stroke="var(--color-attention)"
            strokeDasharray="3 3"
            label={{ value: 'Safety Reserve', position: 'insideTopRight', fill: 'var(--color-attention)', fontSize: 10 }}
          />
        )}

        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          tickFormatter={(d) => `D${d}`}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          tickFormatter={(v) => formatINR(v, true)}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />

        <Area type="monotone" dataKey="worst" name="Worst Case" stroke="#C85C4A" strokeWidth={0} fill="url(#worstGrad)" />
        <Area type="monotone" dataKey="best" name="Best Case" stroke="#4F7D62" strokeWidth={0} fill="url(#bestGrad)" />
        <Area type="monotone" dataKey="expected" name="Expected" stroke="#B8663F" strokeWidth={2.5} fill="none" dot={false} activeDot={{ r: 4, fill: '#B8663F' }} />

        <Legend
          iconType="line"
          iconSize={12}
          wrapperStyle={{ fontSize: 12, paddingTop: 8, color: 'var(--color-text-secondary)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
