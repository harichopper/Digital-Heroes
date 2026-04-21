'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, User } from 'lucide-react';
import { swal } from '@/lib/swal';
import { ContentLoader } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type UserRow = { _id: string; email: string; fullName: string; role: string; createdAt: string };

export default function AdminUsersPage() {
  const { withLoading } = useGlobalLoader();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
                      <motion.button className="btn btn-ghost btn-sm" onClick={() => toggleAdmin(u._id, u.role)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {u.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
