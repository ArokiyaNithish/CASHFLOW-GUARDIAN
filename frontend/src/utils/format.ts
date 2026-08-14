export const formatINR = (amount: number, compact = false): string => {
  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
    if (abs >= 1_00_000)   return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
    if (abs >= 1_000)      return `${sign}₹${(abs / 1_000).toFixed(0)}K`;
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getRiskInfo = (score: number) => {
  if (score >= 80) return {
    label: 'CRITICAL',
    color: 'var(--color-critical)',
    bg: 'var(--color-critical-bg)',
    badge: 'badge-critical',
  };
  if (score >= 60) return {
    label: 'ATTENTION',
    color: 'var(--color-attention)',
    bg: 'var(--color-attention-bg)',
    badge: 'badge-attention',
  };
  if (score >= 40) return {
    label: 'WATCH',
    color: 'var(--color-attention)',
    bg: 'var(--color-attention-bg)',
    badge: 'badge-attention',
  };
  return {
    label: 'HEALTHY',
    color: 'var(--color-healthy)',
    bg: 'var(--color-healthy-bg)',
    badge: 'badge-healthy',
  };
};

export const getRiskLabel = getRiskInfo;

export const getWeather = (score: number) => {
  if (score >= 80) return { icon: '🌩', label: 'STORM APPROACHING' };
  if (score >= 60) return { icon: '⚠',  label: 'CAUTION' };
  if (score >= 40) return { icon: '⚡',  label: 'WATCH' };
  return              { icon: '☀',  label: 'STABLE' };
};

export const getCostRiskColor = (level: string): string => {
  if (level === 'high')   return 'var(--color-critical)';
  if (level === 'medium') return 'var(--color-attention)';
  return 'var(--color-healthy)';
};
