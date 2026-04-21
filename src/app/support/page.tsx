'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { HelpCircle, MessageSquare, Book, Mail, Clock, Zap, ChevronRight } from 'lucide-react';

const options = [
  {
    icon: Book, title: 'Help Centre',
    desc: 'Browse our FAQ library covering scores, draws, billing, charities, and account management.',
    href: '/help', cta: 'Browse FAQs', color: '#10b981',
  },
  {
    icon: MessageSquare, title: 'Contact Support',
    desc: 'Send us a message and our team will get back to you within 24 hours on business days.',
    href: '/contact', cta: 'Send Message', color: '#a855f7',
  },
  {
    icon: Mail, title: 'Email Us Directly',
    desc: 'Prefer email? Reach us at support@digitalheroes.co.in for any enquiry.',
    href: 'mailto:support@digitalheroes.co.in', cta: 'Send Email', color: '#3b82f6',
  },
];

const quickLinks = [
  { q: 'How do I enter my Stableford score?', href: '/help' },
  { q: 'How do I cancel my subscription?', href: '/help' },
  { q: 'How does the prize draw work?', href: '/help' },
  { q: 'How do I claim my prize?', href: '/help' },
  { q: 'Can I change my charity?', href: '/help' },
  { q: 'How do I reset my password?', href: '/help' },
];

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section className="section" style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(168,85,247,0.05) 0%, transparent 100%)' }}>
          <div className="container" style={{ maxWidth: 640 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <HelpCircle size={32} color="white" />
              </motion.div>
              <h1 className="text-h1" style={{ marginBottom: 12 }}>Support <span className="text-gradient">Centre</span></h1>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                We&apos;re here to help. Choose how you&apos;d like to reach us or browse our self-service resources below.
              </p>
              <div className="badge badge-success" style={{ marginTop: 16, display: 'inline-flex', gap: 6 }}>
                <Clock size={12} /> Average response time: under 4 hours
              </div>
            </motion.div>
          </div>
        </section>

        {/* Support options */}
        <section className="section-sm">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto 48px' }}>
              {options.map((opt, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link href={opt.href} style={{ textDecoration: 'none' }}>
                    <motion.div className="card" whileHover={{ y: -4, borderColor: opt.color + '40' }} style={{ height: '100%', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${opt.color}, transparent)` }} />
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: `${opt.color}18`, border: `1px solid ${opt.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <opt.icon size={22} style={{ color: opt.color }} />
                      </div>
                      <h3 className="text-h4" style={{ marginBottom: 8 }}>{opt.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>{opt.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: opt.color, fontSize: '0.875rem', fontWeight: 600 }}>
                        {opt.cta} <ChevronRight size={14} />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <h2 className="text-h3" style={{ marginBottom: 20, textAlign: 'center' }}>
                <Zap size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--warm-400)' }} />
                Common Questions
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {quickLinks.map((link, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                    <Link href={link.href}>
                      <motion.div className="card" whileHover={{ x: 4, borderColor: 'rgba(16,185,129,0.3)' }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                        <ChevronRight size={14} style={{ color: 'var(--primary-400)', flexShrink: 0 }} />
                        {link.q}
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
