'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Clock, X, DollarSign, Upload } from 'lucide-react';
import { swal } from '@/lib/swal';
import { SkeletonCard } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type Winner = { _id: string; prizeAmount: number; matchCount: number; verificationStatus: string; paymentStatus: string; proofUrl?: string; adminNotes?: string; createdAt: string };

export default function WinningsPage() {
  const { withLoading } = useGlobalLoader();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const fmt = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);

  const loadWinnings = useCallback(() => withLoading(
      () => fetch('/api/user/winnings').then(r => r.json()),
      'Loading winnings…', 'Checking your prize history'
    ).then(d => { setWinners(d.winners || []); setLoading(false); }).catch(() => setLoading(false)), [withLoading]);

  useEffect(() => {
    loadWinnings();
  }, [loadWinnings]);

  const handleProofUpload = async (id: string, file: File) => {
    const readAsDataURL = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(f);
      });

    await withLoading(async () => {
      let proofUrl: string;
      try {
        proofUrl = await readAsDataURL(file);
      } catch {
        await swal.error('Upload Failed', 'Could not read the image file.');
        return;
      }

      const res = await fetch('/api/user/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId: id, proofUrl }),
      });
      if (res.ok) {
        await swal.success('Proof Uploaded!', 'Admin will review your proof shortly.');
        const data = await res.json();
        setWinners(ws => ws.map(w => (w._id === id ? { ...w, proofUrl: data.winner.proofUrl } : w)));
      } else {
        const err = await res.json().catch(() => ({}));
        await swal.error('Upload Failed', err.error || 'Please try again.');
      }
    }, 'Uploading proof…', 'Sending your verification');
  };

  const total = winners.reduce((s, w) => s + w.prizeAmount, 0);
  const paid = winners.filter(w => w.paymentStatus === 'paid').reduce((s, w) => s + w.prizeAmount, 0);

  return (
    <div>
      <div className="dashboard-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><CreditCard size={24} />  My Winnings</h1>
        <p>Track prizes, upload proof, and monitor payouts.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {[['Total Won', fmt(total), 'var(--primary-400)'], ['Paid Out', fmt(paid), 'var(--primary-400)'], ['Pending', fmt(total - paid), 'var(--warm-400)']].map(([label, val, color], i) => (
          <motion.div key={label} className="card card-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{val}</div>
          </motion.div>
        ))}
      </div>

      {loading ? <SkeletonCard height={200} /> : winners.length === 0 ? (
        <div className="card empty-state" style={{ padding: 'var(--space-16)' }}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}><CreditCard size={48} style={{ opacity: 0.3 }} /></motion.div>
          <h3>No Winnings Yet</h3><p>Keep entering scores and participating in draws!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {winners.map((w, i) => (
            <motion.div key={w._id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <span className="badge badge-warm" style={{ marginBottom: 'var(--space-2)' }}>{w.matchCount}-Number Match</span>
                  <div className="text-h3" style={{ color: 'var(--primary-400)' }}>{fmt(w.prizeAmount)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
                  <span className={`badge ${w.verificationStatus === 'approved' ? 'badge-success' : w.verificationStatus === 'rejected' ? 'badge-danger' : 'badge-warn'}`}>
                    {w.verificationStatus === 'approved' ? <Check size={12} /> : w.verificationStatus === 'pending' ? <Clock size={12} /> : <X size={12} />}
                    {w.verificationStatus}
                  </span>
                  <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-success' : 'badge-neutral'}`}>
                    <DollarSign size={12} /> {w.paymentStatus}
                  </span>
                </div>
              </div>
              {w.verificationStatus === 'pending' && !w.proofUrl && (
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                  <label className="btn btn-outline btn-sm" htmlFor={`proof-${w._id}`} style={{ cursor: 'pointer' }}>
                    <Upload size={14} /> Upload Proof
                  </label>
                  <input id={`proof-${w._id}`} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleProofUpload(w._id, f); }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
