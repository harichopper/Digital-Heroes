'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit3, Trash2, Check, X, AlertCircle, Calendar } from 'lucide-react';
import { swal } from '@/lib/swal';
import { AnimatedBall, ContentLoader, Spinner } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

const MAX = 5;
type Score = { _id: string; score: number; playedDate: string; createdAt: string };

export default function ScoresPage() {
  const { withLoading } = useGlobalLoader();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Score | null>(null);
  const [scoreVal, setScoreVal] = useState('');
  const [playedDate, setPlayedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadScores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await withLoading(
        () => fetch('/api/scores').then(r => r.json()),
        'Loading scores…', 'Fetching your Stableford scores'
      );
      setScores(data.scores || []);
    } catch {
      await swal.error('Load Error', 'Could not fetch your scores');
    } finally {
      setLoading(false);
    }
  }, [withLoading]);

  useEffect(() => { loadScores(); }, [loadScores]);

  const resetForm = () => { setShowForm(false); setEditing(null); setScoreVal(''); setPlayedDate(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(scoreVal);
    if (!scoreVal || num < 1 || num > 45) { await swal.warning('Invalid Score', 'Score must be between 1 and 45'); return; }
    if (!playedDate) { await swal.warning('Date Required', 'Please pick a date'); return; }
    if (new Date(playedDate) > new Date()) { await swal.warning('Future Date', 'You cannot enter a future date'); return; }

    setSubmitting(true);
    try {
      const isEdit = !!editing;
      const data = await withLoading(async () => {
        const res = await fetch('/api/scores', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEdit
            ? { id: editing!._id, score: num, playedDate }
            : { score: num, playedDate }),
        });
        return res.json().then(d => ({ ...d, ok: res.ok }));
      }, isEdit ? 'Updating score…' : 'Saving score…');
      if (!data.ok) { await swal.error('Error', data.error); return; }
      await swal.success(isEdit ? 'Score Updated!' : 'Score Added!', `Your score of ${num} has been saved.`);
      resetForm();
      loadScores();
    } catch {
      await swal.error('Error', 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, score: number) => {
    const confirmed = await swal.confirm('Delete Score?', `Remove your score of ${score}? This action cannot be undone.`, 'Yes, delete it', true);
    if (!confirmed) return;
    await withLoading(async () => {
      const res = await fetch(`/api/scores?id=${id}`, { method: 'DELETE' });
      if (res.ok) { await swal.success('Deleted', 'Score removed successfully'); loadScores(); }
      else { const d = await res.json(); await swal.error('Error', d.error); }
    }, 'Deleting score…');
  };

  const startEdit = (s: Score) => { setEditing(s); setScoreVal(s.score.toString()); setPlayedDate(s.playedDate); setShowForm(true); };

  return (
    <div>
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Target size={24} /> My Scores
            </h1>
            <p>Stableford scores 1–45 · Max 5 · One per date · Rolling replacement</p>
          </div>
          {!showForm && (
            <motion.button className="btn btn-primary" onClick={() => setShowForm(true)} id="add-score-btn"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Plus size={16} /> Add Score
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Progress banner */}
      <motion.div
        className="card"
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', borderColor: scores.length >= MAX ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.2)', background: scores.length >= MAX ? 'rgba(16,185,129,0.04)' : 'rgba(245,158,11,0.03)' }}
      >
        <AlertCircle size={18} style={{ color: scores.length >= MAX ? 'var(--primary-400)' : 'var(--warm-400)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {scores.length >= MAX ? '✅ Ready for the next draw!' : `${MAX - scores.length} more score${MAX - scores.length !== 1 ? 's' : ''} needed for draw entry`}
            </span>
            <span className="text-sm" style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{scores.length}/{MAX}</span>
          </div>
          <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(scores.length / MAX) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Score entry form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="card" initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -20 }} style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <h3 className="text-h4">{editing ? '✏️ Edit Score' : '➕ Add New Score'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={resetForm}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: '1 1 180px' }}>
                <label className="form-label" htmlFor="score-value">Stableford Score (1–45)</label>
                <input id="score-value" type="number" className="form-input" placeholder="e.g. 36" min={1} max={45} value={scoreVal} onChange={(e) => setScoreVal(e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: '1 1 180px' }}>
                <label className="form-label" htmlFor="played-date">Date Played</label>
                <input id="played-date" type="date" className="form-input" value={playedDate} onChange={(e) => setPlayedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <motion.button type="submit" className="btn btn-primary" disabled={submitting} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {submitting ? <><Spinner size={14} color="white" /> Saving...</> : <><Check size={16} /> {editing ? 'Update' : 'Save'}</>}
                </motion.button>
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score balls display */}
      {loading ? (
        <ContentLoader rows={3} />
      ) : (
        <>
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 className="text-h4" style={{ marginBottom: 'var(--space-5)' }}>Your Numbers</h3>
            <div className="score-balls" style={{ justifyContent: 'center' }}>
              {scores.map((s, i) => (
                <div key={s._id} style={{ textAlign: 'center' }}>
                  <AnimatedBall value={s.score} delay={i * 0.08} size={64} />
                  <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                    {new Date(s.playedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
              {Array.from({ length: MAX - scores.length }).map((_, i) => (
                <div key={`empty-${i}`} style={{ textAlign: 'center' }}>
                  <div className="score-ball" style={{ width: 64, height: 64, opacity: 0.2, borderStyle: 'dashed', cursor: 'pointer' }} onClick={() => setShowForm(true)}>+</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Empty</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Score table */}
          {scores.length > 0 && (
            <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>#</th><th>Score</th><th>Date Played</th><th>Entered</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {scores.map((s, i) => (
                      <motion.tr key={s._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                        <td>{i + 1}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-400)' }}>{s.score}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                            {new Date(s.playedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {new Date(s.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <motion.button className="btn btn-icon btn-ghost" onClick={() => startEdit(s)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} id={`edit-${i}`}><Edit3 size={14} /></motion.button>
                            <motion.button className="btn btn-icon btn-ghost" onClick={() => handleDelete(s._id, s.score)} style={{ color: 'var(--danger-500)' }} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} id={`delete-${i}`}><Trash2 size={14} /></motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {scores.length === 0 && !showForm && (
            <motion.div className="card empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 'var(--space-16)' }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Target size={56} style={{ opacity: 0.3 }} />
              </motion.div>
              <h3>No Scores Yet</h3>
              <p>Enter your first Stableford score to start your journey!</p>
              <motion.button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 'var(--space-4)' }} whileHover={{ scale: 1.05 }}>
                <Plus size={16} /> Add Your First Score
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
