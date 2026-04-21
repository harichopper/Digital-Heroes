'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { SkeletonCard } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

const COLORS = ['#10b981', '#a855f7', '#f59e0b', '#3b82f6', '#ef4444'];

type ReportStats = {
  totalUsers: number;
  activeSubscribers: number;
  totalDraws: number;
  pendingWinners: number;
  totalPrizePool: number;
  charityTotal: number;
};

export default function AdminReportsPage() {
  const { withLoading } = useGlobalLoader();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    const d = await withLoading(
      () => fetch('/api/admin/stats').then(r => r.json()),
      'Loading reports…', 'Generating analytics'
    ) as Partial<ReportStats> | null;
    setStats({
      totalUsers: d?.totalUsers ?? 0,
      activeSubscribers: d?.activeSubscribers ?? 0,
      totalDraws: d?.totalDraws ?? 0,
      pendingWinners: d?.pendingWinners ?? 0,
      totalPrizePool: d?.totalPrizePool ?? 0,
      charityTotal: d?.charityTotal ?? 0,
    });
    setLoading(false);
  }, [withLoading]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const barData = stats ? [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Subscribers', value: stats.activeSubscribers },
    { name: 'Draws', value: stats.totalDraws },
    { name: 'Pending', value: stats.pendingWinners },
  ] : [];

  const pieData = stats ? [
    { name: 'Prize Pool', value: stats.totalPrizePool || 0 },
    { name: 'Charity', value: stats.charityTotal || 0 },
  ] : [];

  return (
    <div>
      <div className="dashboard-header"><h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={24} /> Reports</h1><p>Platform analytics and financial overview.</p></div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}><SkeletonCard height={300} /><SkeletonCard height={300} /></div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-h4" style={{ marginBottom: 'var(--space-6)' }}>Platform Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f8fafc' }} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-h4" style={{ marginBottom: 'var(--space-6)' }}>Financial Distribution (pence)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: £${(value / 100).toFixed(0)}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(value: number | string) => `£${(Number(value) / 100).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
}
