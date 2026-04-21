'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Eye, Database, Lock, Globe, Mail } from 'lucide-react';

const sections = [
  {
    icon: Database, title: 'Information We Collect',
    content: [
      'Account information: name, email address, and password (hashed and never stored in plain text).',
      'Subscription data: your billing plan, subscription status, and payment history via Stripe.',
      'Golf scores: the Stableford scores you enter in the platform, linked only to your account.',
      'Charity preferences: the charity you choose to support with your subscription.',
      'Usage data: pages visited and features used, collected anonymously for product improvement.',
    ],
  },
  {
    icon: Eye, title: 'How We Use Your Information',
    content: [
      'To manage your account and provide platform services (score tracking, draw entries, prize notifications).',
      'To process your subscription payments securely via Stripe.',
      'To distribute your charity contribution to your chosen charity partner each month.',
      'To send you draw results, prize notifications, and important account updates.',
      'To improve the platform through anonymised usage analytics.',
    ],
  },
  {
    icon: Globe, title: 'Data Sharing',
    content: [
      'We never sell your personal data to third parties.',
      'Stripe receives payment information necessary to process your subscription.',
      'Charity partners receive aggregated donation totals — never individual user data.',
      'We may disclose data if required by law or to protect our legal rights.',
    ],
  },
  {
    icon: Lock, title: 'Data Security',
    content: [
      'All data is stored on MongoDB Atlas (ISO 27001 certified infrastructure).',
      'Passwords are hashed using bcrypt — we cannot see your password.',
      'All traffic is encrypted in transit using TLS/HTTPS.',
      'Stripe handles all payment data under PCI DSS Level 1 compliance.',
    ],
  },
  {
    icon: Shield, title: 'Your Rights',
    content: [
      'Access: You can request a copy of all personal data we hold about you.',
      'Correction: You can update your name and account details in your dashboard Settings.',
      'Deletion: You can request full account deletion by contacting support@digitalheroes.co.in.',
      'Portability: You can request your data in a machine-readable format.',
      'Objection: You can opt out of non-essential communications at any time.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section className="section" style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 100%)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge badge-neutral" style={{ marginBottom: 16, display: 'inline-flex' }}><Shield size={12} /> Privacy Policy</span>
              <h1 className="text-h1" style={{ marginBottom: 12 }}>Your Privacy <span className="text-gradient">Matters</span></h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Last updated: April 2026 · Effective: April 2026</p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Digital Heroes (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your personal data. This policy explains what we collect, why, and how we protect it.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {sections.map((s, i) => (
                <motion.div key={i} className="card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <s.icon size={18} color="white" />
                    </div>
                    <h3 className="text-h4">{s.title}</h3>
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 0, listStyle: 'none' }}>
                    {s.content.map((item, j) => (
                      <li key={j} style={{ display: 'flex', gap: 10, color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9375rem' }}>
                        <span style={{ color: 'var(--primary-400)', marginTop: 2 }}>›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              <motion.div className="card" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), transparent)' }}>
                <Mail size={28} style={{ color: 'var(--primary-400)', margin: '0 auto 12px' }} />
                <h3 className="text-h4" style={{ marginBottom: 8 }}>Questions about your privacy?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Contact our data protection team at <strong style={{ color: 'var(--primary-400)' }}>privacy@digitalheroes.co.in</strong></p>
                <Link href="/contact" className="btn btn-primary btn-sm">Contact Us</Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
