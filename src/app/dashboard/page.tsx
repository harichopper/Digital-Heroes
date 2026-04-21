'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Target, Trophy, Heart, CreditCard, ArrowRight, TrendingUp } from 'lucide-react';
import { AnimatedBall } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type Score = { _id: string; score: number; playedDate: string };
type SubscriptionInfo = { status?: string } | null;

function daysUntilDraw() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { withLoading } = useGlobalLoader();
  const [scores, setScores] = useState<Score[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    const [scoresData, subData] = await withLoading(
      () => Promise.all([
        fetch('/api/scores').then(r => r.json()),
        fetch('/api/user/subscription').then(r => r.json()),
      ]),
      'Loading dashboard…', 'Fetching your data'
    );
    setScores(scoresData.scores || []);
    setSubscription(subData.subscription || null);
    setLoading(false);
  }, [withLoading]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const name = session?.user?.name || 'Player';
  const firstName = name.split(' ')[0];
  const daysLeft = daysUntilDraw();

  if (loading) return null; // GlobalLoader handles the visual

  return (
    <div>
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Welcome back, <span className="text-gradient">{firstName}</span> 👋</h1>
        <p>Here&apos;s your performance snapshot for this month.</p>
      </motion.div>

      <div className="stats-grid">
        {[
          { label: 'Subscription', value: <span className={`badge ${subscription?.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{subscription?.status || 'Inactive'}</span>, icon: TrendingUp, link: null, color: 'var(--primary-400)' },
          { label: 'My Scores', value: <><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--primary-400)' }}>{scores.length}</span><span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/5</span></>, icon: Target, link: '/dashboard/scores', color: 'var(--primary-400)' },
          { label: 'Next Draw', value: <><span className="text-gradient-warm" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>{daysLeft}</span><span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: 4 }}>days</span></>, icon: Trophy, link: '/dashboard/draws', color: 'var(--warm-400)' },
          { label: 'Charity', value: subscription?.status === 'active' ? <span className="badge badge-accent">Active</span> : <span className="badge badge-neutral">Not set</span>, icon: Heart, link: '/dashboard/charity', color: 'var(--accent-400)' },
        ].map((stat, i) => (
          <motion.div key={i} className="card card-stat" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
              <div className="stat-label">{stat.label}</div>
              <stat.icon size={18} style={{ color: stat.color, opacity: 0.7 }} />
            </div>
            <div className="stat-value">{stat.value}</div>
            {stat.link && (
              <Link href={stat.link} className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                View <ArrowRight size={10} />
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h3 className="text-h4" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Target size={18} /> Current Numbers</h3>
            <Link href="/dashboard/scores" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}><Target size={40} style={{ opacity: 0.2 }} /></motion.div>
              <p className="text-sm" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>No scores yet</p>
              <Link href="/dashboard/scores" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-3)' }}>Add First Score</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {scores.map((s, i) => (<AnimatedBall key={s._id} value={s.score} delay={i * 0.1} size={56} />))}
              {Array.from({ length: 5 - scores.length }).map((_, i) => (
                <div key={i} className="score-ball" style={{ width: 56, height: 56, opacity: 0.15, borderStyle: 'dashed' }}>?</div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div className="card card-glow" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gradient-warm)' }} />
          <Trophy size={32} style={{ color: 'var(--warm-400)', margin: '0 auto var(--space-3)' }} />
          <div className="text-xs" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Draw</div>
          <motion.div className="text-gradient-warm" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '3rem', lineHeight: 1 }}
            animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}>{daysLeft}</motion.div>
          <div className="text-sm" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>days remaining</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            {[['40%', '5 Match'], ['35%', '4 Match'], ['25%', '3 Match']].map(([pct, label]) => (
              <div key={label} style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{pct}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div></div>
            ))}
          </div>
          {scores.length >= 5
            ? <div className="badge badge-success" style={{ marginTop: 'var(--space-4)' }}>✅ Eligible for this draw</div>
            : <div className="badge badge-warm" style={{ marginTop: 'var(--space-4)' }}>{5 - scores.length} more score{5 - scores.length !== 1 ? 's' : ''} needed</div>}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        {[
          { href: '/dashboard/draws', icon: Trophy, label: 'View All Draws', color: 'var(--warm-400)' },
          { href: '/dashboard/charity', icon: Heart, label: 'My Charity', color: 'var(--accent-400)' },
          { href: '/dashboard/winnings', icon: CreditCard, label: 'My Winnings', color: 'var(--primary-400)' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div className="card" whileHover={{ y: -4, borderColor: item.color }} transition={{ duration: 0.2 }}
              style={{ textAlign: 'center', padding: 'var(--space-5)', cursor: 'pointer' }}>
              <item.icon size={28} style={{ color: item.color, margin: '0 auto var(--space-3)' }} />
              <div className="text-sm" style={{ fontWeight: 600 }}>{item.label}</div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
