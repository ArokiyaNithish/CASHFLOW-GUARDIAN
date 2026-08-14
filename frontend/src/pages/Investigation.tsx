import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { CashRunwayChart } from '../components/charts/CashRunwayChart';
import { SkeletonCard } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/format';

export default function Investigation() {
  const { companyId, latestForecast, setForecast } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [reasoning, setReasoning] = useState<string>('');
  const [rootCauses, setRootCauses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!companyId) return;
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      let fc = latestForecast;
      if (!fc) {
        const fcRes = await api.runForecast(companyId!);
        fc = fcRes.data;
        setForecast(fc!);
      }

      if (fc && fc.forecast_id && fc.forecast_id !== 'fc-zero-001') {
        try {
          const riskRes = await api.getForecastRisk(fc.forecast_id);
          const data = riskRes.data;
          setReasoning(data.analysis?.summary || 'Cash flow analysis complete.');
          setRootCauses(data.analysis?.root_causes || []);
          return;
        } catch {
          // continue to fallback
        }
      }

      if (fc && fc.deficit_day) {
        setReasoning(
          `Your business has ${formatINR(fc.current_cash, true)} in available cash. A projected deficit of ` +
          `${formatINR(Math.abs(fc.deficit_amount ?? 0), true)} has been identified on Day ${fc.deficit_day}.`
        );
      } else {
        setReasoning(
          `Your cash position is currently stable with no active deficit detected. Click + Add Money / Financial Data to enter your cash records and invoices.`
        );
      }
    } catch (err) {
      toast.error('Failed to load investigation data');
    } finally {
      setLoading(false);
    }
  };

  const fc = latestForecast;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--color-guardian)', fontWeight: 900, fontSize: 18 }}>✦</span>
          <h1 className="page-title" style={{ margin: 0 }}>Guardian Investigation</h1>
          <span className={`badge badge-${fc?.deficit_day ? 'critical' : 'healthy'}`}>
            {fc?.deficit_day ? 'SHORTFALL DETECTED' : 'STABLE'}
          </span>
        </div>
        <p className="page-subtitle">Root cause analysis of your projected cash runway</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SkeletonCard lines={3} /><SkeletonCard lines={6} />
        </div>
      ) : (
        <>
          {/* Chart */}
          {fc && (
            <div className="card" style={{ marginBottom: 24 }}>
              <p className="section-label" style={{ marginBottom: 12 }}>Cash Runway Trajectory</p>
              <CashRunwayChart data={fc.daily_projection} deficitDay={fc.deficit_day} safetyReserve={fc.safety_reserve || 0} height={200} />
            </div>
          )}

          {/* Reasoning */}
          <div className="guardian-panel" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>✦</span>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Guardian Analysis
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
              {reasoning}
            </p>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
            <button className="btn-primary" onClick={() => navigate('/guardian/plan')}>
              Generate Rescue Options →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
