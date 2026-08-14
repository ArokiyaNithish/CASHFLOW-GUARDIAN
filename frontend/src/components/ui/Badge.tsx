import React from 'react';

type Variant = 'healthy' | 'attention' | 'critical' | 'guardian' | 'default';

interface BadgeProps {
  label: string;
  variant?: Variant;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => (
  <span className={`badge badge-${variant}`}>{label}</span>
);
