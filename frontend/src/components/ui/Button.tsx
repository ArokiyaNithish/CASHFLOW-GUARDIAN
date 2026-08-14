import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled,
  loading,
  type = 'button',
  fullWidth,
  style,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`btn-${variant}`}
    style={{ ...(fullWidth ? { width: '100%', justifyContent: 'center' } : {}), ...style }}
  >
    {loading ? (
      <>
        <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
        Loading…
      </>
    ) : children}
  </button>
);
