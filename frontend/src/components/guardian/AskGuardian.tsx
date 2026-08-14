import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const SUGGESTED = [
  'Why is my cash running low?',
  'Can I delay the supplier payment?',
  'What is my best option to avoid the deficit?',
];

export const AskGuardian: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const companyId = useAppStore((s) => s.companyId);

  const ask = async (q: string) => {
    if (!q.trim() || !companyId) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await api.ask(companyId, q);
      setAnswer(res.data.answer);
    } catch {
      toast.error('Guardian could not answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ borderLeft: '3px solid var(--color-guardian)', borderRadius: '0 12px 12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ color: 'var(--color-guardian)', fontWeight: 800, fontSize: 13 }}>✦ ASK GUARDIAN</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Grounded in your actual numbers</span>
      </div>

      {/* Suggested questions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => { setQuestion(s); ask(s); }}
            style={{
              background: 'var(--color-guardian-bg)',
              border: '1px solid var(--color-guardian)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              color: 'var(--color-guardian)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(question)}
          placeholder="Ask anything about your cash position…"
          style={{ flexGrow: 1 }}
        />
        <button className="btn-primary" onClick={() => ask(question)} disabled={loading || !question.trim()}>
          {loading ? '…' : '→'}
        </button>
      </div>

      {/* Response */}
      {loading && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="pulse" style={{ color: 'var(--color-guardian)', fontWeight: 700, fontSize: 13 }}>✦ Guardian is reasoning…</span>
        </div>
      )}
      {answer && !loading && (
        <div style={{
          marginTop: 14,
          padding: '14px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          fontSize: 13,
          lineHeight: 1.65,
          color: 'var(--color-text-primary)',
          whiteSpace: 'pre-wrap',
        }}>
          <span style={{ color: 'var(--color-guardian)', fontWeight: 700, marginRight: 6 }}>✦</span>
          {answer}
        </div>
      )}
    </div>
  );
};
