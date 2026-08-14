import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { PlanOptionCard } from '../components/guardian/PlanOptionCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { AgentPlan } from '../types';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/format';

export default function AgentPlan() {
  const { companyId, latestForecast, setForecast } = useAppStore();
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlan();
  }, [companyId]);

  const loadPlan = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      let fc = latestForecast;
      if (!fc) {
        try { const r = await api.getLatestForecast(companyId); fc = r.data; }
        catch { const r = await api.runForecast(companyId); fc = r.data; }
        setForecast(fc!);
      }
      if (!fc) return;

      const planRes = await api.generatePlan(fc.forecast_id);
      const p = planRes.data;
      setPlan(p);
      setSelectedOption(p.recommended_option);
    } catch (err) {
      toast.error('Failed to generate rescue plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!plan) return;
    setApproving(true);
    try {
      await api.approvePlan(plan.plan_id);
      toast.success('✦ Plan approved! Actions are being prepared for your review.');
      navigate('/actions');
    } catch {
      toast.error('Approval failed. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!plan) return;
    try {
      await api.rejectPlan(plan.plan_id);
      toast('Plan rejected. You can generate a new plan from the Investigation page.');
      navigate('/guardian');
    } catch {
      toast.error('Failed to reject plan');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--color-guardian)', fontWeight: 900, fontSize: 18 }}>✦</span>
          <h1 className="page-title" style={{ margin: 0 }}>Rescue Plan</h1>
        </div>
        <p className="page-subtitle">
          Guardian-generated strategies to prevent{' '}
          {latestForecast?.deficit_amount && (
            <strong style={{ color: 'var(--color-critical)' }}>
              {formatINR(Math.abs(latestForecast.deficit_amount), true)} deficit
            </strong>
          )}{' '}
          {latestForecast?.deficit_day && `on Day ${latestForecast.deficit_day}`}
        </p>
      </div>

      {loading ? (
        <div>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: '60px 0', color: 'var(--color-text-secondary)',
          }}>
            <span className="pulse" style={{ fontSize: '2rem' }}>✦</span>
            <p style={{ fontSize: 15, fontWeight: 600 }}>Guardian is reasoning about your finances…</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Analysing risk events, retrieving policy context, generating rescue options
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SkeletonCard lines={5} /><SkeletonCard lines={5} />
            <SkeletonCard lines={5} /><SkeletonCard lines={5} />
          </div>
        </div>
      ) : plan ? (
        <>
          {/* Reasoning */}
          <div className="card guardian-panel" style={{ marginBottom: 24 }}>
            <p className="section-label" style={{ marginBottom: 8, color: 'var(--color-guardian)' }}>✦ GUARDIAN REASONING</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{plan.reasoning_text}</p>
          </div>

          {/* Option cards */}
          <p className="section-label" style={{ marginBottom: 14 }}>SELECT A RESCUE STRATEGY</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
            {plan.options.map((opt) => (
              <PlanOptionCard
                key={opt.label}
                option={opt}
                isSelected={selectedOption === opt.label}
                isRecommended={opt.label === plan.recommended_option}
                onSelect={() => setSelectedOption(opt.label)}
              />
            ))}
          </div>

          {/* Justification + Actions */}
          <div className="card" style={{ background: 'var(--color-guardian-bg)', border: '1px solid var(--color-guardian)', marginBottom: 20 }}>
            <p className="section-label" style={{ marginBottom: 8, color: 'var(--color-guardian)' }}>
              ✦ WHY GUARDIAN RECOMMENDS OPTION {plan.recommended_option}
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>{plan.justification}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-danger" onClick={handleReject}>Reject Plan</button>
              <button className="btn-secondary" onClick={() => toast('Modification flow — select an option and click Approve')}>
                Request Modification
              </button>
              <button className="btn-primary" onClick={handleApprove} disabled={approving} style={{ marginLeft: 'auto' }}>
                {approving ? 'Approving…' : `✓ Approve Option ${selectedOption} & Proceed`}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No plan data available. Go back to Investigation.</p>
          <button className="btn-secondary" onClick={() => navigate('/guardian')} style={{ marginTop: 16 }}>
            ← Back to Investigation
          </button>
        </div>
      )}
    </div>
  );
}
