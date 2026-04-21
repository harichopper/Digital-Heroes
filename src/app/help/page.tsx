'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Trophy, CreditCard, Target, Heart, Shield, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const categories = [
  { icon: Target, label: 'Scores & Draws', color: '#10b981' },
  { icon: CreditCard, label: 'Billing & Plans', color: '#f59e0b' },
  { icon: Trophy, label: 'Prizes & Winners', color: '#a855f7' },
  { icon: Heart, label: 'Charities', color: '#ec4899' },
  { icon: Shield, label: 'Account & Security', color: '#3b82f6' },
];

const faqs = [
  { cat: 'Scores & Draws', q: 'How many scores do I need to enter?', a: 'You need to enter exactly 5 Stableford scores each month to be eligible for the monthly prize draw. Scores must be between 1 and 45 points, and each score must be from a different date.' },
  { cat: 'Scores & Draws', q: 'When is the monthly draw?', a: 'The draw takes place on the first day of each month. Results are published in your dashboard under "Prize Draws". You will also be notified by email if you win.' },
  { cat: 'Scores & Draws', q: 'How are winning numbers selected?', a: 'The draw engine generates 5 winning numbers. Prizes are awarded based on how many of your 5 scores match: 5 matches = Jackpot (40%), 4 matches = 35%, 3 matches = 25% of the prize pool.' },
  { cat: 'Scores & Draws', q: 'Can I edit or delete a score?', a: 'Yes. Go to My Scores in your dashboard. You can edit or delete any score before the end of the month. Once a draw is published, scores are locked.' },
  { cat: 'Billing & Plans', q: 'What plans are available?', a: 'We offer two plans: Monthly (£9.99/month) and Annual (£99/year — save 17%). Both plans include full platform access, monthly draw entries, and charity contributions.' },
  { cat: 'Billing & Plans', q: 'How do I cancel my subscription?', a: 'You can cancel at any time from your dashboard under Settings. Your access continues until the end of your billing period. No hidden fees or cancellation charges.' },
  { cat: 'Billing & Plans', q: 'Is my payment information secure?', a: 'Yes. All payments are processed securely via Stripe. Digital Heroes never stores your card details. Stripe is PCI DSS Level 1 certified.' },
  { cat: 'Prizes & Winners', q: 'How do I claim my prize?', a: 'If you win, you will see a notification in your Winnings dashboard. You need to submit proof of your golf round (scorecard photo). Admin will verify and process payment within 5 business days.' },
  { cat: 'Prizes & Winners', q: 'What happens to unclaimed prizes?', a: 'If a winner does not submit proof within 30 days, the prize rolls over to the next month\'s jackpot, increasing the prize pool for all players.' },
  { cat: 'Charities', q: 'How much of my subscription goes to charity?', a: 'A minimum of 10% of every subscription fee is distributed to charities. You choose which charity to support from our verified directory of partners.' },
  { cat: 'Charities', q: 'Can I change my chosen charity?', a: 'Yes, you can change your charity selection at any time from the My Charity section of your dashboard. The change takes effect from your next billing cycle.' },
  { cat: 'Account & Security', q: 'How do I change my password?', a: 'Go to Dashboard → Settings → Change Password. Enter your current password and your new password (min 6 characters). Changes take effect immediately.' },
  { cat: 'Account & Security', q: 'How do I delete my account?', a: 'Please contact us at support@digitalheroes.co.in with your registered email address and we will process your deletion request within 7 business days.' },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = faqs.filter(f => {
    const matchCat = activeCat === 'All' || f.cat === activeCat;
    const matchSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section className="section" style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 100%)' }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Help Centre</span>
              <h1 className="text-h1" style={{ marginBottom: 12 }}>How can we <span className="text-gradient">help you?</span></h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Find answers to common questions about scores, prizes, billing, and charities.</p>
              <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" placeholder="Search help articles…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 46, fontSize: '1rem' }} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section style={{ paddingBottom: 'var(--space-8)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['All', ...categories.map(c => c.label)].map(cat => (
                <motion.button key={cat} onClick={() => setActiveCat(cat)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '8px 18px', borderRadius: 100, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    background: activeCat === cat ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    color: activeCat === cat ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${activeCat === cat ? 'transparent' : 'var(--border-subtle)'}`,
                  }}>
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-sm">
          <div className="container" style={{ maxWidth: 720 }}>
            {filtered.length === 0 ? (
              <div className="card empty-state"><Search size={40} /><h3>No results found</h3><p>Try a different search term.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map((faq, i) => (
                  <motion.div key={i} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div>
                        <span className="badge badge-neutral" style={{ marginBottom: 6, fontSize: '0.65rem' }}>{faq.cat}</span>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{faq.q}</div>
                      </div>
                      <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0, marginLeft: 12 }}>
                        <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                          <div style={{ padding: '0 20px 18px', color: 'var(--text-muted)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ paddingTop: 14 }}>{faq.a}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Still need help CTA */}
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ textAlign: 'center', marginTop: 32, background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))' }}>
              <Mail size={32} style={{ color: 'var(--primary-400)', margin: '0 auto 12px' }} />
              <h3 className="text-h4" style={{ marginBottom: 8 }}>Still need help?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Our support team is available Monday–Friday, 9am–5pm GMT.</p>
              <Link href="/contact" className="btn btn-primary">Contact Us</Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
