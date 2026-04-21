'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { SkeletonCard } from '@/components/Loaders';
import { AnimatedBall } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type Draw = { _id: string; drawDate: string; winningNumbers: number[]; totalPool: number; totalParticipants: number; status: string; drawType: string };

function daysUntil() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DrawsPage() {
  const { withLoading } = useGlobalLoader();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDraws = useCallback(() => withLoading(
      () => fetch('/api/draws').then(r => r.json()),
      'Loading draws…', 'Fetching prize draw history'
    ).then(d => { setDraws(d.draws || []); setLoading(false); }).catch(() => setLoading(false)), [withLoading]);

  useEffect(() => {
    loadDraws();
  }, [loadDraws]);

  const fmt = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);

  return (
    <div>
      <div className="dashboard-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Trophy size={24} /> Prize Draws</h1>
        <p>View upcoming and past draws, and track your participation.</p>
      </div>

      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--space-8)', textAlign: 'center', padding: 'var(--space-10)' }}>
        <span className="badge badge-warm" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>Upcoming Draw</span>
        <h2 className="text-h1" style={{ marginBottom: 'var(--space-2)' }}>
          <span className="text-gradient-warm">{daysUntil()}</span> Days Remaining
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Enter 5 Stableford scores to be eligible!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
          {[['40%', 'Jackpot (5 match)', 'var(--primary-400)'], ['35%', '4-Number Match', 'var(--accent-400)'], ['25%', '3-Number Match', 'var(--warm-400)']].map(([pct, label, color]) => (
            <div key={label}>
              <div className="text-h3" style={{ color }}>{pct}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <h2 className="text-h3" style={{ marginBottom: 'var(--space-5)' }}>Past Draws</h2>
      {loading ? <SkeletonCard height={200} /> : draws.length === 0 ? (
        <div className="card empty-state">
          <Trophy size={48} /><h3>No Draws Yet</h3><p>Draws are published monthly.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {draws.map((d, i) => (
            <motion.div key={d._id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <span className={`badge ${d.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{d.status}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(d.drawDate).toLocaleDateString('en-GB')} · {d.drawType}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)', marginRight: 8 }}>Winning:</span>
                    {d.winningNumbers.map((n, j) => <AnimatedBall key={j} value={n} delay={j * 0.05} size={36} />)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-h4" style={{ color: 'var(--primary-400)' }}>{fmt(d.totalPool)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.totalParticipants} participants</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
