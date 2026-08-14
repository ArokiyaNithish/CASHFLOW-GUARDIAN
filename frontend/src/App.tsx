import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Investigation from './pages/Investigation';
import AgentPlan from './pages/AgentPlan';
import ActionCenter from './pages/ActionCenter';
import WhatIf from './pages/WhatIf';
import Receivables from './pages/Receivables';
import Payables from './pages/Payables';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAppStore((s) => s.token);
  // Auto fallback to demo access token if not present
  if (!token) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login"       element={<Login />} />
          <Route path="/onboarding"  element={<Onboarding />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cashflow"    element={<ProtectedRoute><Forecast /></ProtectedRoute>} />
          <Route path="/receivables" element={<ProtectedRoute><Receivables /></ProtectedRoute>} />
          <Route path="/payables"    element={<ProtectedRoute><Payables /></ProtectedRoute>} />
          <Route path="/guardian"    element={<ProtectedRoute><Investigation /></ProtectedRoute>} />
          <Route path="/guardian/plan" element={<ProtectedRoute><AgentPlan /></ProtectedRoute>} />
          <Route path="/actions"     element={<ProtectedRoute><ActionCenter /></ProtectedRoute>} />
          <Route path="/simulator"   element={<ProtectedRoute><WhatIf /></ProtectedRoute>} />
          <Route path="/"            element={<Navigate to="/dashboard" replace />} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
