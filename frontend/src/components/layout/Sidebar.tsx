import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Search, Zap, CheckSquare,
  FlaskConical, FileText, LogOut, Building2, Menu, X
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cashflow',    icon: TrendingUp,       label: 'Cash Forecast' },
  { to: '/receivables', icon: FileText,         label: 'Receivables' },
  { to: '/payables',    icon: FileText,         label: 'Payables' },
];

const GUARDIAN_ITEMS = [
  { to: '/guardian',      icon: Search,      label: 'Investigation' },
  { to: '/guardian/plan', icon: Zap,         label: 'Rescue Plan' },
  { to: '/actions',       icon: CheckSquare, label: 'Action Center' },
];

const TOOLS_ITEMS = [
  { to: '/simulator', icon: FlaskConical, label: 'Scenario Lab' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Navigation Header (Visible on Mobile/Tablets <= 768px) */}
      <div className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--color-guardian)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 13,
          }}>✦</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-nav-active)' }}>CashFlow Guardian</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: '#FFFDF8', cursor: 'pointer', padding: 4 }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobile} />
      )}

      {/* Sidebar Container */}
      <nav className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--color-guardian)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 14,
            }}>✦</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-nav-active)' }}>CashFlow</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-nav-text)' }}>Guardian</p>
            </div>
          </div>
        </div>

        {/* Company */}
        {user && (
          <div style={{ padding: '8px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Building2 size={12} color="var(--color-nav-text)" />
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-nav-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name ? `${user.name}'s Business` : 'My Enterprise'}
              </p>
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
          <p className="section-label" style={{ padding: '12px 20px 4px', color: 'rgba(200,194,186,0.4)' }}>Overview</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={closeMobile} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          <p className="section-label" style={{ padding: '16px 20px 4px', color: 'rgba(200,194,186,0.4)' }}>✦ Guardian</p>
          {GUARDIAN_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={closeMobile} className={({ isActive }) => `nav-item guardian-nav${isActive ? ' active' : ''}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          <p className="section-label" style={{ padding: '16px 20px 4px', color: 'rgba(200,194,186,0.4)' }}>Tools</p>
          {TOOLS_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={closeMobile} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* User + Logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {user && (
            <p style={{ margin: '0 0 8px 4px', fontSize: 12, color: 'var(--color-nav-text)', fontWeight: 500 }}>
              {user.name}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-nav-text)', fontSize: 13, padding: '6px 4px', width: '100%',
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
};
