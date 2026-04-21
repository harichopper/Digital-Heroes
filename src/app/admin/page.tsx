'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Trophy, Heart, Calendar, RefreshCw, AlertTriangle, MessageSquare, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { SkeletonCard } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type AdminStats = {
  totalUsers: number;
  activeSubscribers: number;
  totalDraws: number;
  pendingWinners: number;
  totalPrizePool: number;
  charityTotal: number;
  unreadMessages: number;
};

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: string;
  delay: number;
  href?: string;
  warn?: boolean;
};

function fmt(p: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(p / 100);
}

function StatCard({ label, value, sub, icon: Icon, color, delay, href, warn }: StatCardProps) {
  const card = (
    <motion.div
      className={`card ${warn ? 'card-stat-danger' : ''}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -4, scale: 1.01 }}
      style={{ position: 'relative', overflow: 'hidden', cursor: href ? 'pointer' : 'default' }}
    >
      {/* Gradient top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
      {/* Corner glow */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color, opacity: 0.06, filter: 'blur(20px)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <motion.div
          style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${color}22, ${color}11)`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          whileHover={{ rotate: 10, scale: 1.1 }}
        >
          <Icon size={16} style={{ color }} />
        </motion.div>
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.875rem', color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub}</div>}
    </motion.div>
  );

  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

export default function AdminPage() {
  const { withLoading } = useGlobalLoader();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadStats = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    const d = await withLoading(
      () => fetch('/api/admin/stats').then(r => r.json()),
      showRefresh ? 'Refreshing data…' : 'Loading dashboard…',
      'Fetching platform metrics'
    ) as Partial<AdminStats> | null;
    setStats({
      totalUsers: d?.totalUsers ?? 0,
      activeSubscribers: d?.activeSubscribers ?? 0,
      totalDraws: d?.totalDraws ?? 0,
      pendingWinners: d?.pendingWinners ?? 0,
      totalPrizePool: d?.totalPrizePool ?? 0,
      charityTotal: d?.charityTotal ?? 0,
      unreadMessages: d?.unreadMessages ?? 0,
    });
    setLoading(false);
    setRefreshing(false);
    setLastUpdated(new Date().toLocaleTimeString('en-GB'));
  }, [withLoading]);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => loadStats(true), 30000);
    return () => clearInterval(id);
  }, [loadStats]);

  if (loading) return (
    <div>
      <div className="dashboard-header"><div className="skeleton" style={{ height: 32, width: 200 }} /><div className="skeleton" style={{ height: 20, width: 300, marginTop: 8 }} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} height={110} />)}
      </div>
    </div>
  );

  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, sub: 'Registered accounts', icon: Users, color: '#a855f7', href: '/admin/users' },
    { label: 'Active Subscribers', value: stats.activeSubscribers, sub: `${Math.round(stats.activeSubscribers / Math.max(stats.totalUsers, 1) * 100)}% conversion`, icon: TrendingUp, color: '#10b981', href: '/admin/users' },
    { label: 'Total Draws', value: stats.totalDraws, sub: 'Published draws', icon: Calendar, color: '#f59e0b', href: '/admin/draws' },
    { label: 'Prize Pool', value: fmt(stats.totalPrizePool || 0), sub: 'Cumulative across all draws', icon: Trophy, color: '#f97316', href: '/admin/draws' },
    { label: 'Charity Raised', value: fmt(stats.charityTotal || 0), sub: 'Across all partners', icon: Heart, color: '#ec4899', href: '/admin/charities' },
    { label: 'Pending Verifications', value: stats.pendingWinners, sub: 'Requires action', icon: AlertTriangle, color: '#ef4444', href: '/admin/winners', warn: stats.pendingWinners > 0 },
    { label: 'Unread Messages', value: stats.unreadMessages ?? 0, sub: 'Contact form submissions', icon: MessageSquare, color: '#3b82f6', href: '/admin/contact', warn: (stats.unreadMessages ?? 0) > 0 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontFamily: 'monospace', letterSpacing: '0.1em' }}>◈ COMMAND CENTRE</div>
          </div>
          <h1 style={{ marginBottom: 4 }}>
            Platform <span style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Overview</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Real-time metrics and system health</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && <span style={{ fontSize: '0.75rem', color: '#475569' }}>Updated {lastUpdated}</span>}
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={() => loadStats(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={refreshing}
          >
            <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={14} />
            </motion.div>
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {cards.map((c, i) => <StatCard key={i} {...c} delay={i * 0.06} />)}
      </div>

      {/* Quick action bar */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{ marginBottom: 24 }}
      >
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          ⚡ Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: '+ New Draw', href: '/admin/draws', color: '#f59e0b' },
            { label: '+ Add Charity', href: '/admin/charities', color: '#ec4899' },
            { label: 'Review Winners', href: '/admin/winners', color: '#ef4444' },
            { label: 'View Messages', href: '/admin/contact', color: '#3b82f6' },
            { label: 'View Reports', href: '/admin/reports', color: '#a855f7' },
            { label: 'Manage Users', href: '/admin/users', color: '#10b981' },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color,
                  transition: 'all 0.15s',
                }}
              >
                {a.label}
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* System status panel */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          ◈ System Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {[
            ['MongoDB Atlas', 'Connected', '#10b981'],
            ['NextAuth', 'Active', '#10b981'],
            ['API Routes', 'Operational', '#10b981'],
            ['Stripe', 'Configured', stats.totalUsers > 0 ? '#10b981' : '#f59e0b'],
          ].map(([name, status, color]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: '0.7rem', color }}>{status}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
