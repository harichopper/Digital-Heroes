'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Play, CheckCircle, Plus } from 'lucide-react';
import { swal } from '@/lib/swal';
import { Spinner, ContentLoader, AnimatedBall } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type Draw = {
  _id: string; drawDate: string; status: string;
  drawType: string; winningNumbers: number[];
  totalPool: number; totalParticipants: number;
};

function fmt(p: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);
}

export default function AdminDrawsPage() {
  const { withLoading } = useGlobalLoader();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadDraws = async () => {
    const d = await fetch('/api/admin/draws').then(r => r.json());
    setDraws(d.draws || []);
    setLoading(false);
  };

  useEffect(() => { loadDraws(); }, []);

  const createDraw = async () => {
    const ok = await swal.confirm('Create Draw', 'Create a new monthly draw for the current period?', 'Yes, create');
    if (!ok) return;
    const d = await withLoading(
      () => fetch('/api/admin/draws', { method: 'POST' }).then(r => r.json().then(j => ({ ...j, ok: r.ok }))),
      'Creating draw…', 'Setting up prize pools'
    );
    if (d.ok) { await swal.success('Draw Created!', 'Prize pools are now configured.'); loadDraws(); }
    else { await swal.error('Error', d.error || 'Failed to create draw'); }
  };

  const simulate = async (id: string) => {
    setActionId(id);
    const d = await withLoading(
      () => fetch('/api/admin/draws', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'simulate' }),
      }).then(r => r.json().then(j => ({ ...j, ok: r.ok }))),
      'Simulating draw…', 'Generating winning numbers'
    );
    if (d.ok) { await swal.success('Draw Simulated!', 'Winning numbers have been generated. Review before publishing.'); loadDraws(); }
    else { await swal.error('Simulation Failed', d.error); }
    setActionId(null);
  };

  const publish = async (id: string) => {
    const ok = await swal.confirm('Publish Draw?', 'This will post results live. This action is irreversible!', 'Yes, publish now', true);
    if (!ok) return;
    setActionId(id);
    const d = await withLoading(
      () => fetch('/api/admin/draws', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'publish' }),
      }).then(r => r.json().then(j => ({ ...j, ok: r.ok }))),
      'Publishing draw…', 'Finalising results'
    );
    if (d.ok) { await swal.success('Draw Published! 🎉', 'Results are now live for all participants.'); loadDraws(); }
    else { await swal.error('Error', d.error); }
    setActionId(null);
  };

  const statusColor = (s: string) =>
    s === 'published' ? 'badge-success' : s === 'simulated' ? 'badge-warn' : 'badge-neutral';

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={24} /> Draw Management</h1>
          <p>Create, simulate, and publish monthly draws.</p>
        </div>
        <motion.button className="btn btn-primary" onClick={createDraw} id="create-draw-btn"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Plus size={16} /> New Draw
        </motion.button>
      </div>

      {loading ? <ContentLoader rows={4} /> : draws.length === 0 ? (
        <div className="card empty-state" style={{ padding: 'var(--space-16)' }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Trophy size={48} style={{ opacity: 0.3 }} />
          </motion.div>
          <h3>No Draws Yet</h3>
          <p>Create the first monthly draw to get started.</p>
          <motion.button className="btn btn-primary" onClick={createDraw} style={{ marginTop: 'var(--space-4)' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Plus size={16} /> Create First Draw
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {draws.map((d, i) => (
            <motion.div key={d._id} className="card"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Top status bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: d.status === 'published' ? 'linear-gradient(90deg,#10b981,#059669)'
                  : d.status === 'simulated' ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                  : 'linear-gradient(90deg,#475569,#334155)',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                    <span className={`badge ${statusColor(d.status)}`}>{d.status.toUpperCase()}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(d.drawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {d.drawType}
                    </span>
                  </div>

                  {d.winningNumbers.length > 0 ? (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-3)' }}>
                      {d.winningNumbers.map((n, j) => <AnimatedBall key={j} value={n} delay={j * 0.08} size={40} />)}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-3)' }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="score-ball" style={{ width: 40, height: 40, opacity: 0.15, borderStyle: 'dashed', fontSize: '0.7rem' }}>?</div>
                      ))}
                    </div>
                  )}

                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {d.totalParticipants} participants · Pool: <strong style={{ color: 'var(--warm-400)' }}>{fmt(d.totalPool)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                  {d.status === 'pending' && (
                    <motion.button className="btn btn-outline btn-sm" onClick={() => simulate(d._id)}
                      disabled={actionId === d._id} whileHover={{ scale: 1.05 }} id={`simulate-${i}`}>
                      {actionId === d._id
                        ? <><Spinner size={14} /> Simulating…</>
                        : <><Play size={14} /> Simulate</>}
                    </motion.button>
                  )}
                  {d.status === 'simulated' && (
                    <motion.button className="btn btn-primary btn-sm" onClick={() => publish(d._id)}
                      disabled={actionId === d._id} whileHover={{ scale: 1.05 }} id={`publish-${i}`}
                      style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
                      {actionId === d._id
                        ? <><Spinner size={14} color="white" /> Publishing…</>
                        : <><CheckCircle size={14} /> Publish Results</>}
                    </motion.button>
                  )}
                  {d.status === 'published' && (
                    <span className="badge badge-success"><CheckCircle size={12} /> Live</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
