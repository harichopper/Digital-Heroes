'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, User, Target, CreditCard, Save, Trash2, Plus } from 'lucide-react';
import { swal } from '@/lib/swal';
import { ContentLoader } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type UserRow = { _id: string; email: string; fullName: string; role: string; createdAt: string };
type ScoreRow = { _id: string; score: number; playedDate: string };
type SubscriptionRow = {
  _id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  planType: 'monthly' | 'yearly';
  cancelAtPeriodEnd: boolean;
};

export default function AdminUsersPage() {
  const { withLoading } = useGlobalLoader();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');

  const loadUsers = useCallback(() => withLoading(
      () => fetch('/api/admin/users').then(r => r.json()),
      'Loading users…', 'Fetching platform users'
    ).then(d => { setUsers(d.users || []); setLoading(false); }).catch(() => setLoading(false)), [withLoading]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleAdmin = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const ok = await swal.confirm(`${newRole === 'admin' ? 'Grant' : 'Revoke'} Admin?`, `Change role to ${newRole}?`, 'Yes, change it', newRole !== 'admin');
    if (!ok) return;
    await withLoading(async () => {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role: newRole }) });
      if (res.ok) { setUsers(u => u.map(x => x._id === id ? { ...x, role: newRole } : x)); await swal.success('Role Updated!'); }
      else { await swal.error('Error', 'Could not update role'); }
    }, 'Updating role…');
  };

  const filtered = users.filter(u => u.email.includes(search) || u.fullName.toLowerCase().includes(search.toLowerCase()));

  const loadUserDetails = async (userId: string) => {
    setDetailsLoading(true);
    const payload = await withLoading(
      () => fetch(`/api/admin/users/${userId}`).then((r) => r.json().then((d) => ({ ...d, ok: r.ok }))),
      'Loading user details…'
    );
    if (!payload.ok) {
      await swal.error('Error', payload.error || 'Could not load user details');
      setDetailsLoading(false);
      return;
    }
    setScores(payload.scores || []);
    setSubscription(payload.subscription || null);
    setSelectedUserId(userId);
    setDetailsLoading(false);
  };

  const saveSubscription = async () => {
    if (!selectedUserId || !subscription) return;
    const payload = await withLoading(
      () => fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSubscription',
          status: subscription.status,
          planType: subscription.planType,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }),
      }).then((r) => r.json().then((d) => ({ ...d, ok: r.ok }))),
      'Updating subscription…'
    );
    if (!payload.ok) {
      await swal.error('Error', payload.error || 'Failed to update subscription');
      return;
    }
    setSubscription(payload.subscription);
    await swal.success('Subscription Updated!');
  };

  const upsertScore = async (scoreId?: string) => {
    if (!selectedUserId) return;
    const scoreValue = Number(newScore);
    if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45 || !newDate) {
      await swal.warning('Invalid input', 'Enter a score between 1 and 45 and choose a date.');
      return;
    }
    const payload = await withLoading(
      () => fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsertScore', scoreId, score: scoreValue, playedDate: newDate }),
      }).then((r) => r.json().then((d) => ({ ...d, ok: r.ok }))),
      scoreId ? 'Updating score…' : 'Adding score…'
    );
    if (!payload.ok) {
      await swal.error('Error', payload.error || 'Failed to save score');
      return;
    }
    setNewScore('');
    setNewDate('');
    await loadUserDetails(selectedUserId);
  };

  const deleteScore = async (scoreId: string) => {
    if (!selectedUserId) return;
    const ok = await swal.confirm('Delete score?', 'This cannot be undone.', 'Delete', true);
    if (!ok) return;
    const payload = await withLoading(
      () => fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteScore', scoreId }),
      }).then((r) => r.json().then((d) => ({ ...d, ok: r.ok }))),
      'Deleting score…'
    );
    if (!payload.ok) {
      await swal.error('Error', payload.error || 'Failed to delete score');
      return;
    }
    await loadUserDetails(selectedUserId);
  };

  return (
    <div>
      <div className="dashboard-header"><h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={24} /> Users</h1><p>Manage platform users and roles.</p></div>
      <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>
      {loading ? <ContentLoader rows={6} /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>User</th><th>Role</th><th>Joined</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm">{(u.fullName || u.email)[0].toUpperCase()}</div>
                        <div><div style={{ fontWeight: 600 }}>{u.fullName || '—'}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</div></div>
                      </div>
                    </td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-neutral'}`}>{u.role === 'admin' ? <><Shield size={10} /> Admin</> : <><User size={10} /> User</>}</span></td>
                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <motion.button className="btn btn-ghost btn-sm" onClick={() => loadUserDetails(u._id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          Manage
                        </motion.button>
                        <motion.button className="btn btn-ghost btn-sm" onClick={() => toggleAdmin(u._id, u.role)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {u.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUserId && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <h3 className="text-h4" style={{ marginBottom: 'var(--space-4)' }}>User Management Tools</h3>
          {detailsLoading ? <ContentLoader rows={4} /> : (
            <>
              {subscription && (
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><CreditCard size={16} /> Subscription</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 10 }}>
                    <select className="form-input" value={subscription.status} onChange={(e) => setSubscription({ ...subscription, status: e.target.value as SubscriptionRow['status'] })}>
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="cancelled">cancelled</option>
                      <option value="past_due">past_due</option>
                      <option value="trialing">trialing</option>
                    </select>
                    <select className="form-input" value={subscription.planType} onChange={(e) => setSubscription({ ...subscription, planType: e.target.value as SubscriptionRow['planType'] })}>
                      <option value="monthly">monthly</option>
                      <option value="yearly">yearly</option>
                    </select>
                    <select className="form-input" value={subscription.cancelAtPeriodEnd ? 'yes' : 'no'} onChange={(e) => setSubscription({ ...subscription, cancelAtPeriodEnd: e.target.value === 'yes' })}>
                      <option value="no">No cancel at period end</option>
                      <option value="yes">Cancel at period end</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={saveSubscription}><Save size={14} /> Save</button>
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Target size={16} /> Golf Scores</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 12 }}>
                  <input className="form-input" type="number" min={1} max={45} placeholder="Score (1-45)" value={newScore} onChange={(e) => setNewScore(e.target.value)} />
                  <input className="form-input" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                  <button className="btn btn-outline btn-sm" onClick={() => upsertScore()}><Plus size={14} /> Add</button>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>Score</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                    <tbody>
                      {scores.map((s) => (
                        <tr key={s._id}>
                          <td>{s.score}</td>
                          <td>{s.playedDate}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => { setNewScore(String(s.score)); setNewDate(s.playedDate); }}>Edit</button>
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-500)' }} onClick={() => deleteScore(s._id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {scores.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--text-muted)' }}>No scores yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
