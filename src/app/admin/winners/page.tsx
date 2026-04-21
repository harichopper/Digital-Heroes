'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Check, X, DollarSign } from 'lucide-react';
import { swal } from '@/lib/swal';
import { ContentLoader } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type WinnerUser = { email?: string; fullName?: string };
type Winner = { _id: string; userId: WinnerUser | string; prizeAmount: number; matchCount: number; verificationStatus: string; paymentStatus: string; proofUrl?: string; createdAt: string };

function fmt(p: number) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100); }

export default function AdminWinnersPage() {
  const { withLoading } = useGlobalLoader();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWinners = useCallback(() => withLoading(
    () => fetch('/api/admin/winners').then(r => r.json()),
    'Loading winners…'
  ).then(d => { setWinners(d.winners || []); setLoading(false); }).catch(() => setLoading(false)), [withLoading]);

  useEffect(() => { loadWinners(); }, [loadWinners]);

  const updateStatus = async (id: string, update: object, msg: string) => {
    await withLoading(async () => {
      const res = await fetch('/api/admin/winners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...update }) });
      if (res.ok) { await swal.success(msg); loadWinners(); }
      else { await swal.error('Error', 'Could not update status'); }
    }, 'Processing…');
  };

  return (
    <div>
      <div className="dashboard-header"><h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Award size={24} /> Winners</h1><p>Review proofs and process payouts.</p></div>
      {loading ? <ContentLoader rows={5} /> : winners.length === 0 ? (
        <div className="card empty-state"><Award size={48} /><h3>No Winners</h3><p>Winners appear here after draws are published.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {winners.map((w, i) => {
            const user = typeof w.userId === 'string' ? null : w.userId;
            return (
              <motion.div key={w._id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{user?.fullName || user?.email || 'Unknown'}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</div>
                    <span className="badge badge-warm" style={{ marginBottom: 8 }}>{w.matchCount}-Match</span>
                    <div className="text-h4" style={{ color: 'var(--primary-400)' }}>{fmt(w.prizeAmount)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <span className={`badge ${w.verificationStatus === 'approved' ? 'badge-success' : w.verificationStatus === 'rejected' ? 'badge-danger' : 'badge-warn'}`}>
                      {w.verificationStatus}
                    </span>
                    <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-success' : 'badge-neutral'}`}>{w.paymentStatus}</span>
                  </div>
                </div>
                {w.proofUrl && (
                  <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                    <a href={w.proofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View Proof</a>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  {w.verificationStatus === 'pending' && (
                    <>
                      <motion.button className="btn btn-primary btn-sm" onClick={() => updateStatus(w._id, { verificationStatus: 'approved' }, 'Approved!')} whileHover={{ scale: 1.05 }}><Check size={14} /> Approve</motion.button>
                      <motion.button className="btn btn-outline btn-sm" style={{ color: 'var(--danger-500)' }} onClick={() => updateStatus(w._id, { verificationStatus: 'rejected' }, 'Rejected')} whileHover={{ scale: 1.05 }}><X size={14} /> Reject</motion.button>
                    </>
                  )}
                  {w.verificationStatus === 'approved' && w.paymentStatus === 'pending' && (
                    <motion.button className="btn btn-accent btn-sm" onClick={() => updateStatus(w._id, { paymentStatus: 'paid' }, 'Marked as Paid!')} whileHover={{ scale: 1.05 }}><DollarSign size={14} /> Mark Paid</motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
