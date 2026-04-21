'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Mail, CheckCircle, Trash2,
  RefreshCw, AlertCircle, Search,
} from 'lucide-react';
import { swal } from '@/lib/swal';
import { useGlobalLoader } from '@/components/GlobalLoader';
import { SkeletonCard } from '@/components/Loaders';

type Status = 'new' | 'read' | 'resolved';

interface ContactMsg {
  _id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: Status;
  createdAt: string;
}

const STATUS_COLORS: Record<Status, string> = {
  new: '#ef4444',
  read: '#f59e0b',
  resolved: '#10b981',
};
const STATUS_LABELS: Record<Status, string> = {
  new: 'NEW',
  read: 'READ',
  resolved: 'RESOLVED',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminContactPage() {
  const { withLoading } = useGlobalLoader();
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState<ContactMsg | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    const data = await withLoading(
      () => fetch('/api/admin/contact').then(r => r.json()),
      showRefresh ? 'Refreshing messages…' : 'Loading messages…',
      'Fetching contact submissions'
    );
    setMessages(data.messages || []);
    setUnread(data.unread || 0);
    setLoading(false);
    setRefreshing(false);
  }, [withLoading]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: Status) => {
    await fetch(`/api/admin/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, status } : m));
    setUnread(prev => {
      const msg = messages.find(m => m._id === id);
      if (msg?.status === 'new' && status !== 'new') return Math.max(0, prev - 1);
      if (msg?.status !== 'new' && status === 'new') return prev + 1;
      return prev;
    });
    if (selected?._id === id) setSelected(s => s ? { ...s, status } : s);
  };

  const deleteMsg = async (id: string) => {
    const ok = await swal.confirm('DELETE MESSAGE?', 'This action cannot be undone.', 'DELETE', true);
    if (!ok) return;
    await fetch(`/api/admin/contact/${id}`, { method: 'DELETE' });
    setMessages(prev => {
      const msg = prev.find(m => m._id === id);
      if (msg?.status === 'new') setUnread(u => Math.max(0, u - 1));
      return prev.filter(m => m._id !== id);
    });
    if (selected?._id === id) setSelected(null);
  };

  const openMessage = (msg: ContactMsg) => {
    setSelected(msg);
    if (msg.status === 'new') updateStatus(msg._id, 'read');
  };

  const filtered = messages.filter(m => {
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.topic.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div>
      <div className="dashboard-header">
        <div className="skeleton" style={{ height: 32, width: 260 }} />
        <div className="skeleton" style={{ height: 20, width: 200, marginTop: 8 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} height={72} />)}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
            ◈ CONTACT INBOX
          </div>
          <h1 style={{ marginBottom: 4 }}>
            Support <span style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Messages</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {unread > 0 ? (
              <><span style={{ color: '#ef4444', fontWeight: 700 }}>{unread} unread</span> · {messages.length} total submissions</>
            ) : (
              <>{messages.length} total submissions · all read</>
            )}
          </p>
        </div>
        <motion.button
          className="btn btn-ghost btn-sm"
          onClick={() => load(true)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          disabled={refreshing}
          style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
        >
          <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={14} />
          </motion.div>
          REFRESH
        </motion.button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {([
          { label: 'Unread', count: messages.filter(m => m.status === 'new').length, color: '#ef4444' },
          { label: 'In Review', count: messages.filter(m => m.status === 'read').length, color: '#f59e0b' },
          { label: 'Resolved', count: messages.filter(m => m.status === 'resolved').length, color: '#10b981' },
          { label: 'Total', count: messages.length, color: '#a855f7' },
        ] as const).map((s, i) => (
          <motion.div key={s.label} className="card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.08em', marginTop: 4 }}>{s.label.toUpperCase()}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            className="form-input"
            placeholder="Search messages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, fontSize: '0.8125rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'new', 'read', 'resolved'] as const).map(s => (
            <motion.button key={s}
              onClick={() => setFilterStatus(s)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: '6px 14px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700,
                fontFamily: 'monospace', letterSpacing: '0.06em', cursor: 'pointer',
                background: filterStatus === s
                  ? (s === 'all' ? 'linear-gradient(135deg,#a855f7,#6366f1)' : `${STATUS_COLORS[s as Status]}22`)
                  : 'rgba(255,255,255,0.04)',
                color: filterStatus === s
                  ? (s === 'all' ? 'white' : STATUS_COLORS[s as Status])
                  : '#64748b',
                border: `1px solid ${filterStatus === s
                  ? (s === 'all' ? 'transparent' : STATUS_COLORS[s as Status] + '44')
                  : 'rgba(255,255,255,0.07)'}`,
              }}>
              {s.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Two-pane layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.4fr' : '1fr', gap: 16, alignItems: 'start' }}>

        {/* Message list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div className="card empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <MessageSquare size={40} style={{ color: '#475569', margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'monospace', color: '#7c3aed', marginBottom: 6 }}>NO MESSAGES</h3>
              <p style={{ color: '#475569', fontSize: '0.8125rem' }}>No messages match your filter.</p>
            </div>
          ) : (
            filtered.map((msg, i) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => openMessage(msg)}
                style={{
                  padding: '14px 16px', borderRadius: 6, cursor: 'pointer',
                  background: selected?._id === msg._id ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected?._id === msg._id ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.06)' }}
              >
                {msg.status === 'new' && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: '#ef4444', borderRadius: '4px 0 0 4px' }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700,
                        color: msg.status === 'new' ? '#e2e8f0' : '#94a3b8',
                      }}>{msg.name}</span>
                      <span style={{
                        padding: '1px 6px', borderRadius: 3, fontSize: '0.6rem', fontWeight: 700,
                        fontFamily: 'monospace', letterSpacing: '0.06em',
                        background: `${STATUS_COLORS[msg.status]}18`,
                        color: STATUS_COLORS[msg.status],
                        border: `1px solid ${STATUS_COLORS[msg.status]}30`,
                      }}>{STATUS_LABELS[msg.status]}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginBottom: 4 }}>{msg.email}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.topic && <span style={{ color: '#7c3aed', marginRight: 6 }}>[{msg.topic}]</span>}
                      {msg.message}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace', flexShrink: 0, textAlign: 'right' }}>
                    {formatDate(msg.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail pane */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected._id}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
              className="card"
              style={{ position: 'sticky', top: 80, background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.2)' }}
            >
              {/* Detail header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#7c3aed', letterSpacing: '0.12em', marginBottom: 6 }}>
                    ◈ MESSAGE DETAIL
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>{selected.name}</h3>
                  <div style={{ fontSize: '0.8125rem', color: '#7c3aed', fontFamily: 'monospace' }}>{selected.email}</div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '1.2rem', lineHeight: 1 }}
                >✕</button>
              </div>

              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'TOPIC', value: selected.topic || 'General Enquiry' },
                  { label: 'RECEIVED', value: formatDate(selected.createdAt) },
                  { label: 'STATUS', value: STATUS_LABELS[selected.status] },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#475569', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Message body */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#475569', letterSpacing: '0.1em', marginBottom: 8 }}>MESSAGE</div>
                <div style={{
                  padding: '14px 16px', borderRadius: 4,
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                  color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                }}>
                  {selected.message}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.topic || 'Your Enquiry')}`}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: '0.75rem' }}
                >
                  <Mail size={13} /> REPLY
                </a>
                {selected.status !== 'resolved' && (
                  <motion.button
                    className="btn btn-sm"
                    onClick={() => updateStatus(selected._id, 'resolved')}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                      color: '#10b981', fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <CheckCircle size={13} /> RESOLVE
                  </motion.button>
                )}
                {selected.status !== 'new' && (
                  <motion.button
                    className="btn btn-sm"
                    onClick={() => updateStatus(selected._id, 'new')}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#ef4444', fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <AlertCircle size={13} /> MARK UNREAD
                  </motion.button>
                )}
                <motion.button
                  className="btn btn-sm"
                  onClick={() => deleteMsg(selected._id)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    color: '#ef4444', fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6,
                    marginLeft: 'auto',
                  }}
                >
                  <Trash2 size={13} /> DELETE
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
