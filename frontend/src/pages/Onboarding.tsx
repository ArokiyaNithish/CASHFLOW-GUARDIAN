import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

const STEPS = ['Company Details', 'Upload Data', 'Building Twin', 'Ready!'];

const FILE_TYPES = [
  { key: 'customers', label: 'Customers', icon: '👥', desc: 'Customer payment history' },
  { key: 'suppliers', label: 'Suppliers', icon: '🏭', desc: 'Supplier terms & negotiability' },
  { key: 'invoices', label: 'Invoices', icon: '📄', desc: 'Open receivables' },
  { key: 'payables', label: 'Payables', icon: '💳', desc: 'Outstanding payables' },
  { key: 'transactions', label: 'Transactions', icon: '📊', desc: 'Bank transaction history' },
  { key: 'recurring_obligations', label: 'Obligations', icon: '🔄', desc: 'Payroll, EMI, rent, tax' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());
  const { setAuth } = useAppStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.register(ownerName, email, password, companyName);
      const { access_token, user } = res.data;
      setAuth(user, access_token);
      setStep(1);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (fileType: string, file: File) => {
    const companyId = useAppStore.getState().companyId;
    if (!companyId) return;
    try {
      await api.uploadCSV(companyId, fileType, file);
      setUploaded((prev) => new Set([...prev, fileType]));
      toast.success(`${fileType} uploaded!`);
    } catch {
      toast.error(`Failed to upload ${fileType}`);
    }
  };

  const useDemoData = () => {
    const demoAuth = useAppStore.getState();
    // If not logged in, skip to demo account
    navigate('/login');
  };

  const proceedToBuilding = () => {
    setStep(2);
    setTimeout(() => setStep(3), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i <= step ? 'var(--color-guardian)' : 'var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i <= step ? '#fff' : 'var(--color-text-muted)',
                  fontWeight: 700, fontSize: 13,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === step ? 'var(--color-guardian)' : 'var(--color-text-muted)', fontWeight: i === step ? 700 : 400 }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--color-guardian)' : 'var(--color-border)', margin: '0 4px', marginBottom: 22 }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: Company Setup */}
        {step === 0 && (
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontSize: 32 }}>✦</span>
              <h2 style={{ margin: '8px 0 4px' }}>Set up CashFlow Guardian</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Build your financial digital twin in minutes</p>
            </div>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Company Name</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Precision Components" required />
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Your Name</label>
                <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Arun Kumar" required />
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="arun@company.com" required />
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? 'Creating account…' : 'Continue →'}
              </button>
            </form>
            <div style={{ margin: '16px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>or</div>
            <button className="btn-secondary" onClick={useDemoData} style={{ width: '100%', justifyContent: 'center' }}>
              ✦ Try with Demo Data (ABC Precision Components)
            </button>
          </div>
        )}

        {/* Step 1: Upload Data */}
        {step === 1 && (
          <div className="card">
            <h2 style={{ margin: '0 0 6px' }}>Upload Financial Data</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Upload CSV files to build your financial model. You can skip any file.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {FILE_TYPES.map((ft) => (
                <label key={ft.key} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: uploaded.has(ft.key) ? 'var(--color-healthy-bg)' : 'var(--color-bg)',
                  border: `1px solid ${uploaded.has(ft.key) ? 'var(--color-healthy)' : 'var(--color-border)'}`,
                  borderRadius: 10, cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 22 }}>{ft.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                      {ft.label}
                      {uploaded.has(ft.key) && <span style={{ marginLeft: 6, color: 'var(--color-healthy)' }}>✓</span>}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>{ft.desc}</p>
                  </div>
                  <input type="file" accept=".csv" style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.[0]) handleUpload(ft.key, e.target.files[0]); }} />
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => navigate('/login')}>← Back</button>
              <button className="btn-primary" onClick={proceedToBuilding} style={{ flex: 1, justifyContent: 'center' }}>
                Build Financial Twin →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Building */}
        {step === 2 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div className="pulse" style={{ fontSize: '3rem', marginBottom: 16 }}>✦</div>
            <h2 style={{ margin: '0 0 8px' }}>Building your Financial Digital Twin</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
              Analysing transactions · Training payment model · Running Monte Carlo forecast
            </p>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, color: 'var(--color-healthy)' }}>✓</div>
            <h2 style={{ margin: '0 0 8px' }}>Your Financial Twin is Ready!</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
              Guardian has analysed your financial data and is ready to monitor your cash position.
            </p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '12px 32px' }}>
              Open Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
