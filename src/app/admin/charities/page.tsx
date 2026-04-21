'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Edit3, Trash2, Star, X, Check } from 'lucide-react';
import { swal } from '@/lib/swal';
import { ContentLoader, Spinner } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type Charity = { _id: string; name: string; slug: string; shortDescription?: string; category?: string; isFeatured: boolean; isActive: boolean };

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function AdminCharitiesPage() {
  const { withLoading } = useGlobalLoader();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Charity | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', shortDescription: '', category: '', isFeatured: false, isActive: true });

  const loadCharities = useCallback(() => withLoading(
    () => fetch('/api/charities').then(r => r.json()),
    'Loading charities…'
  ).then(d => { setCharities(d.charities || []); setLoading(false); }), [withLoading]);
  useEffect(() => { loadCharities(); }, [loadCharities]);

  const resetForm = () => { setShowForm(false); setEditing(null); setForm({ name: '', slug: '', shortDescription: '', category: '', isFeatured: false, isActive: true }); };
  const startEdit = (c: Charity) => { setEditing(c); setForm({ name: c.name, slug: c.slug, shortDescription: c.shortDescription || '', category: c.category || '', isFeatured: c.isFeatured, isActive: c.isActive }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const url = '/api/admin/charities';
    const payload = editing ? { ...form, id: editing._id } : { ...form, slug: slugify(form.name) };
    await withLoading(async () => {
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { await swal.success(editing ? 'Charity Updated!' : 'Charity Created!'); resetForm(); loadCharities(); }
      else { const d = await res.json(); await swal.error('Error', d.error); }
    }, editing ? 'Updating charity…' : 'Creating charity…');
    setSaving(false);
  };

  const deleteCharity = async (id: string, name: string) => {
    const ok = await swal.confirm('Delete Charity?', `Delete "${name}"? This cannot be undone.`, 'Delete', true);
    if (!ok) return;
    await withLoading(async () => {
      const res = await fetch(`/api/admin/charities?id=${id}`, { method: 'DELETE' });
      if (res.ok) { await swal.success('Deleted!'); loadCharities(); }
    }, 'Deleting charity…');
  };

  const toggleFeatured = async (c: Charity) => {
    await withLoading(async () => {
      const res = await fetch('/api/admin/charities', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c._id, isFeatured: !c.isFeatured }) });
      if (res.ok) { loadCharities(); }
    }, 'Updating…');
  };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={24} /> Charities</h1><p>Manage charity partners.</p></div>
        {!showForm && <motion.button className="btn btn-primary" onClick={() => setShowForm(true)} whileHover={{ scale: 1.05 }}><Plus size={16} /> Add Charity</motion.button>}
      </div>

      {showForm && (
        <motion.div className="card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <h3 className="text-h4">{editing ? 'Edit Charity' : 'New Charity'}</h3>
            <button className="btn btn-icon btn-ghost" onClick={resetForm}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Short Description</label><textarea className="form-input" rows={2} value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} /> Featured</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <motion.button type="submit" className="btn btn-primary" disabled={saving} whileHover={{ scale: 1.03 }}>
                {saving ? <><Spinner size={14} color="white" /> Saving...</> : <><Check size={16} /> {editing ? 'Update' : 'Create'}</>}
              </motion.button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? <ContentLoader rows={5} /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Name</th><th>Category</th><th>Featured</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {charities.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-neutral">{c.category || '—'}</span></td>
                    <td>
                      <motion.button className={`btn btn-icon btn-sm btn-ghost`} onClick={() => toggleFeatured(c)} whileHover={{ scale: 1.2 }}>
                        <Star size={16} style={{ color: c.isFeatured ? 'var(--warm-400)' : 'var(--text-muted)', fill: c.isFeatured ? 'var(--warm-400)' : 'none' }} />
                      </motion.button>
                    </td>
                    <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-neutral'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <motion.button className="btn btn-icon btn-ghost" onClick={() => startEdit(c)} whileHover={{ scale: 1.1 }}><Edit3 size={14} /></motion.button>
                        <motion.button className="btn btn-icon btn-ghost" onClick={() => deleteCharity(c._id, c.name)} style={{ color: 'var(--danger-500)' }} whileHover={{ scale: 1.1 }}><Trash2 size={14} /></motion.button>
                      </div>
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
