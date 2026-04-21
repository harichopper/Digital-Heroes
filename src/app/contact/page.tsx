'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MessageSquare, Clock, CheckCircle, Send, Phone, AlertCircle } from 'lucide-react';
import { swal } from '@/lib/swal';
import { useGlobalLoader } from '@/components/GlobalLoader';

const topics = [
  'General Enquiry',
  'Billing & Subscription',
  'Technical Issue',
  'Prize / Winner Query',
  'Charity Question',
  'Partnership',
  'Other',
];

export default function ContactPage() {
  const { withLoading } = useGlobalLoader();
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      await swal.warning('Missing fields', 'Please fill in your name, email, and message.');
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      await swal.warning('Invalid email', 'Please enter a valid email address.');
      return;
    }

    const result = await withLoading(async () => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          topic: form.topic || 'General Enquiry',
          message: form.message.trim(),
        }),
      });
      return res.json();
    }, 'Sending message…', 'Connecting to support team');

    if (result?.success) {
      setSent(true);
    } else {
      setError(result?.error || 'Something went wrong. Please try again.');
    }
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section className="section" style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 100%)' }}>
          <div className="container" style={{ maxWidth: 640 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>
                <MessageSquare size={12} /> Get in Touch
              </span>
              <h1 className="text-h1" style={{ marginBottom: 12 }}>Contact <span className="text-gradient">Support</span></h1>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Have a question or need help? Our support team is here for you. We typically respond within 24 hours on business days.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 32, alignItems: 'start', maxWidth: 900, margin: '0 auto' }}>

              {/* Left: info cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: Mail, title: 'Email Support', body: 'support@digitalheroes.co.in', sub: 'For general enquiries', href: 'mailto:support@digitalheroes.co.in' },
                  { icon: Clock, title: 'Response Time', body: 'Within 24 hours', sub: 'Mon–Fri, 9am–5pm GMT', href: null },
                  { icon: Phone, title: 'Urgent Issues', body: 'admin@digitalheroes.co.in', sub: 'Prize or billing emergencies', href: 'mailto:admin@digitalheroes.co.in' },
                ].map((item, i) => {
                  const inner = (
                    <motion.div
                      key={i} className="card"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      whileHover={item.href ? { y: -2, borderColor: 'rgba(16,185,129,0.3)' } : {}}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: item.href ? 'pointer' : 'default' }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                        <div style={{ color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600 }}>{item.body}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.sub}</div>
                      </div>
                    </motion.div>
                  );
                  return item.href
                    ? <a key={i} href={item.href} style={{ textDecoration: 'none' }}>{inner}</a>
                    : <div key={i}>{inner}</div>;
                })}

                <motion.div className="card"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--primary-400)' }}>Tip:</strong> Many answers are in our{' '}
                    <a href="/help" style={{ color: 'var(--primary-400)' }}>Help Centre</a> — check there first for instant answers.
                  </div>
                </motion.div>
              </div>

              {/* Right: form */}
              <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <CheckCircle size={56} style={{ color: 'var(--primary-400)', margin: '0 auto 16px' }} />
                    </motion.div>
                    <h3 className="text-h3" style={{ marginBottom: 8 }}>Message Sent!</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                      We&apos;ve received your message and will respond within 24 hours on business days.
                    </p>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => { setSent(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 className="text-h4" style={{ marginBottom: 4 }}>Send us a message</h3>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 14px', borderRadius: 'var(--radius-md)',
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          color: '#f87171', fontSize: '0.875rem',
                        }}
                      >
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        {error}
                      </motion.div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input
                          id="contact-name"
                          className="form-input"
                          placeholder="Your name"
                          value={form.name}
                          onChange={e => set('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          id="contact-email"
                          className="form-input"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Topic</label>
                      <select
                        id="contact-topic"
                        className="form-input"
                        value={form.topic}
                        onChange={e => set('topic', e.target.value)}
                      >
                        <option value="">Select a topic…</option>
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea
                        id="contact-message"
                        className="form-input"
                        rows={5}
                        placeholder="Describe your issue or question in detail…"
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        required
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <motion.button
                      id="contact-submit"
                      type="submit"
                      className="btn btn-primary"
                      style={{ justifyContent: 'center', gap: 8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send size={16} /> Send Message
                    </motion.button>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      By submitting this form you agree to our{' '}
                      <a href="/privacy" style={{ color: 'var(--primary-400)' }}>Privacy Policy</a>.
                    </p>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
