import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
}) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="card">
    <Skeleton height="12px" width="60px" borderRadius="3px" />
    <div style={{ marginTop: 12 }}>
      <Skeleton height="32px" width="140px" />
    </div>
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} style={{ marginTop: 8 }}>
        <Skeleton height="14px" width={i === 0 ? '80%' : '60%'} />
      </div>
    ))}
  </div>
);
