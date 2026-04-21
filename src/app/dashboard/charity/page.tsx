'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Check } from 'lucide-react';
import { swal } from '@/lib/swal';
import { SkeletonCard } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type Charity = { _id: string; name: string; slug: string; shortDescription?: string; category?: string; isFeatured: boolean; totalReceived: number };

export default function CharityPage() {
  const { withLoading } = useGlobalLoader();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [user, setUser] = useState<{ selectedCharityId?: string | { _id: string }; charityPercentage?: number } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(10);
  const [savingPercentage, setSavingPercentage] = useState(false);

  const loadCharityData = useCallback(() => withLoading(
      () => Promise.all([
        fetch('/api/charities').then(r => r.json()),
        fetch('/api/user/subscription').then(r => r.json()),
      ]),
      'Loading charities…', 'Finding charity partners'
    ).then(([cData, uData]) => {
      setCharities(cData.charities || []);
      setUser(uData.user);
      setPercentage(uData.user?.charityPercentage ?? 10);
      setLoading(false);
    }), [withLoading]);

  useEffect(() => {
    loadCharityData();
  }, [loadCharityData]);

  const selectCharity = async (id: string, name: string) => {
    await withLoading(async () => {
      const res = await fetch('/api/user/subscription', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedCharityId: id }) });
      if (res.ok) { setUser((u) => ({ ...u, selectedCharityId: id })); await swal.success('Charity Updated!', `You are now supporting ${name}`); }
      else { await swal.error('Error', 'Could not update charity'); }
    }, 'Updating charity…', `Selecting ${name}`);
  };

  const updatePercentage = async () => {
    setSavingPercentage(true);
    await withLoading(async () => {
      const res = await fetch('/api/user/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityPercentage: percentage }),
      });
      if (res.ok) {
        setUser((u) => ({ ...u, charityPercentage: percentage }));
        await swal.success('Percentage Updated!', `${percentage}% of your subscription will go to charity.`);
      } else {
        const err = await res.json().catch(() => ({}));
        await swal.error('Error', err.error || 'Could not update percentage');
      }
    }, 'Updating percentage…', 'Saving your preference');
    setSavingPercentage(false);
  };

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const fmt = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(p / 100);

  return (
    <div>
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Heart size={24} /> My Charity</h1>
        <p>Choose a charity to support with your subscription.</p>
      </motion.div>

      <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" className="form-input" placeholder="Search charities..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>

      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-6)' }}>
        <h3 className="text-h4" style={{ marginBottom: 'var(--space-4)' }}>Charity Contribution</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Choose what percentage of your subscription goes to your selected charity.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={percentage}
            onChange={e => setPercentage(Number(e.target.value))}
            style={{ flex: '1 1 200px', accentColor: 'var(--primary-500)' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-h4" style={{ color: 'var(--primary-400)', minWidth: 48 }}>{percentage}%</span>
            <motion.button
              className="btn btn-primary btn-sm"
              onClick={updatePercentage}
              disabled={savingPercentage || percentage === (user?.charityPercentage ?? 10)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {savingPercentage ? 'Saving…' : 'Save'}
            </motion.button>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
          Current: {user?.charityPercentage ?? 10}% of your subscription supports charity.
        </p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} height={160} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'var(--space-4)' }}>
          {filtered.map((c, i) => {
            const selectedCharityId = typeof user?.selectedCharityId === 'string'
              ? user.selectedCharityId
              : user?.selectedCharityId?._id;
            const selected = c._id === selectedCharityId;
            return (
              <motion.div key={c._id} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                style={{ cursor: 'pointer', border: selected ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)', background: selected ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)' }}
                onClick={() => !selected && selectCharity(c._id, c.name)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: selected ? 'var(--gradient-primary)' : 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selected ? <Check size={18} color="white" /> : '💚'}
                  </div>
                  {c.isFeatured && <span className="badge badge-warm">Featured</span>}
                </div>
                <h4 className="text-h4" style={{ marginBottom: 'var(--space-1)' }}>{c.name}</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>{c.shortDescription}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {c.category && <span className="badge badge-neutral">{c.category}</span>}
                  <span className="text-sm" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{fmt(c.totalReceived)}</span>
                </div>
                {selected && <div className="badge badge-success" style={{ marginTop: 'var(--space-3)', width: '100%', justifyContent: 'center' }}>✓ Currently Selected</div>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
