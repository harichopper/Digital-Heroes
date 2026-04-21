'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FileText, AlertTriangle, CreditCard, Trophy, Shield, Scale } from 'lucide-react';

const clauses = [
  {
    icon: FileText, title: '1. Acceptance of Terms',
    body: 'By accessing or using the Digital Heroes platform at digitalheroes.co.in, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not use the platform. These terms constitute a legally binding agreement between you and Digital Heroes.',
  },
  {
    icon: CreditCard, title: '2. Subscriptions & Payments',
    body: 'The platform operates on a subscription model (Monthly: £9.99/month; Annual: £99/year). Payments are processed by Stripe and are subject to Stripe\'s terms. Subscriptions auto-renew unless cancelled before the renewal date. No refunds are issued for partial billing periods. Prices may change with 30 days\' notice.',
  },
  {
    icon: Trophy, title: '3. Prize Draws',
    body: 'Monthly prize draws are available to active subscribers who have entered 5 valid Stableford scores in the current month. Draws are conducted fairly using our draw engine. Winners must submit valid proof of their golf round within 30 days of notification. Digital Heroes reserves the right to verify all winning claims. Unclaimed prizes roll over to the next month.',
  },
  {
    icon: FileText, title: '4. Score Entry Rules',
    body: 'Scores must be genuine Stableford golf scores between 1 and 45 points. You may enter one score per calendar date per month, up to a maximum of 5 scores. Falsifying scores or entering fraudulent data is grounds for immediate account termination and forfeiture of any prizes. Digital Heroes reserves the right to request verification of scores.',
  },
  {
    icon: Shield, title: '5. Charity Contributions',
    body: 'A minimum of 10% of each subscription fee is donated to charity partners. You may select your preferred charity from our verified directory. Charitable contributions are non-refundable. Digital Heroes reserves the right to modify the charity partner list. The exact amounts distributed to each charity are published in our annual transparency report.',
  },
  {
    icon: AlertTriangle, title: '6. Prohibited Use',
    body: 'You may not: use the platform for any unlawful purpose; attempt to manipulate draw results; create multiple accounts; share account credentials; reverse-engineer any part of the platform; scrape or extract data; or impersonate Digital Heroes staff. Violations may result in immediate account suspension.',
  },
  {
    icon: Scale, title: '7. Limitation of Liability',
    body: 'Digital Heroes is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the subscription fees paid in the 3 months preceding any claim. The platform is provided "as is" without warranties of uninterrupted availability.',
  },
  {
    icon: FileText, title: '8. Governing Law',
    body: 'These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. If any provision of these Terms is found invalid, the remaining provisions continue in full force.',
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section className="section" style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(245,158,11,0.05) 0%, transparent 100%)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge badge-warm" style={{ marginBottom: 16, display: 'inline-flex' }}><Scale size={12} /> Terms of Service</span>
              <h1 className="text-h1" style={{ marginBottom: 12 }}>Terms of <span className="text-gradient-warm">Service</span></h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Last updated: April 2026 · Effective: April 2026</p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Please read these Terms of Service carefully before using Digital Heroes. These terms govern your access to and use of our platform.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {clauses.map((c, i) => (
                <motion.div key={i} className="card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <c.icon size={16} style={{ color: 'var(--warm-400)' }} />
                    </div>
                    <h3 className="text-h4">{c.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.9375rem' }}>{c.body}</p>
                </motion.div>
              ))}

              <motion.div className="card" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                style={{ padding: 20, borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  For questions about these Terms, contact us at <strong style={{ color: 'var(--warm-400)' }}>legal@digitalheroes.co.in</strong> or visit our{' '}
                  <Link href="/contact" style={{ color: 'var(--primary-400)' }}>Contact page</Link>.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
