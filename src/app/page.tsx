'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Trophy,
  Target,
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  LayoutDashboard,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { daysUntilDraw } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function HomePage() {
  const daysLeft = daysUntilDraw();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session;
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const dashPath = isAdmin ? '/admin' : '/dashboard';
  const dashLabel = isAdmin ? 'Go to Admin Panel' : 'Go to Dashboard';
  const DashIcon = isAdmin ? Shield : LayoutDashboard;

  return (
    <>
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="hero" id="hero">
        {/* Background orbs */}
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="hero-bg-orb hero-bg-orb-3" />

        <div className="container">
          <motion.div
            className="hero-content"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            {/* Live badge */}
            <motion.div className="hero-badge" variants={fadeInUp}>
              <span className="pulse-dot" />
              <span>Next draw in {daysLeft} days — Join now</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 className="text-display" variants={fadeInUp}>
              Play Golf.<br />
              <span className="text-gradient">Win Prizes.</span><br />
              Change Lives.
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={fadeInUp}>
              Enter your Stableford scores, compete in monthly prize draws,
              and direct a portion of every subscription to charities
              that matter to you.
            </motion.p>

            {/* CTAs — session-aware */}
            <motion.div className="hero-actions" variants={fadeInUp}>
              {isLoggedIn ? (
                <>
                  <Link
                    href={dashPath}
                    className="btn btn-primary btn-lg"
                    id="hero-dashboard"
                    style={isAdmin ? { background: 'linear-gradient(135deg,#a855f7,#7c3aed)', boxShadow: '0 8px 30px rgba(168,85,247,0.4)' } : {}}
                  >
                    <DashIcon size={18} />
                    {dashLabel}
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="btn btn-outline btn-lg"
                    id="hero-learn-more"
                  >
                    Learn How It Works
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="btn btn-primary btn-lg"
                    id="hero-subscribe"
                  >
                    <Sparkles size={18} />
                    Subscribe &amp; Play
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="btn btn-outline btn-lg"
                    id="hero-learn-more"
                  >
                    Learn How It Works
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div className="hero-stats" variants={fadeInUp}>
              <div className="hero-stat">
                <div className="hero-stat-value text-gradient">£12,450</div>
                <div className="hero-stat-label">Total Prize Pool</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value text-gradient-warm">1,240+</div>
                <div className="hero-stat-label">Active Players</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value" style={{ color: 'var(--accent-400)' }}>
                  £8,200
                </div>
                <div className="hero-stat-label">Donated to Charity</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section" id="how-it-works">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}
          >
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>
              Simple Process
            </span>
            <h2 className="text-h1" style={{ marginBottom: 'var(--space-4)' }}>
              How It Works
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Four simple steps from subscribing to making a real difference.
            </p>
          </motion.div>

          <div className="steps-grid">
            {[
              {
                icon: <Zap size={22} />,
                title: 'Subscribe',
                desc: 'Pick a monthly or yearly plan. A portion goes to your chosen charity automatically.',
              },
              {
                icon: <Target size={22} />,
                title: 'Enter Scores',
                desc: 'Submit your last 5 Stableford scores (1–45). One score per date, rolling format.',
              },
              {
                icon: <Trophy size={22} />,
                title: 'Match & Win',
                desc: 'Each month, 5 winning numbers are drawn. Match 3, 4, or all 5 to win your share.',
              },
              {
                icon: <Heart size={22} />,
                title: 'Give Back',
                desc: 'At least 10% of your subscription supports a charity you personally choose.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="card step-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="step-number">{i + 1}</div>
                <h3 className="text-h4">{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRIZE DRAW ============ */}
      <section className="section" id="prizes" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}
          >
            <span className="badge badge-warm" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>
              Monthly Draws
            </span>
            <h2 className="text-h1" style={{ marginBottom: 'var(--space-4)' }}>
              Three Ways to Win
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Your golf scores are your lottery numbers. The more you match, the bigger you win.
            </p>
          </motion.div>

          {/* Winning numbers demo */}
          <motion.div
            className="score-balls"
            style={{ marginBottom: 'var(--space-12)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {[12, 23, 31, 38, 42].map((num, i) => (
              <motion.div
                key={i}
                className="number-reveal"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 300 }}
              >
                {num}
              </motion.div>
            ))}
          </motion.div>

          <div className="prize-tiers">
            {[
              {
                label: '5-Number Match',
                percentage: '40%',
                desc: 'Jackpot — rolls over if unclaimed',
                color: 'var(--warm-400)',
                featured: true,
              },
              {
                label: '4-Number Match',
                percentage: '35%',
                desc: 'Split equally among all 4-match winners',
                color: 'var(--primary-400)',
                featured: false,
              },
              {
                label: '3-Number Match',
                percentage: '25%',
                desc: 'Split equally among all 3-match winners',
                color: 'var(--accent-400)',
                featured: false,
              },
            ].map((tier, i) => (
              <motion.div
                key={i}
                className={`card prize-tier ${tier.featured ? 'featured' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {tier.featured && (
                  <span
                    className="badge badge-warm"
                    style={{
                      position: 'absolute',
                      top: 'var(--space-4)',
                      right: 'var(--space-4)',
                    }}
                  >
                    Jackpot
                  </span>
                )}
                <div className="tier-label" style={{ color: tier.color }}>
                  {tier.label}
                </div>
                <div className="tier-percentage" style={{ color: tier.color }}>
                  {tier.percentage}
                </div>
                <div className="tier-description">{tier.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHARITY IMPACT ============ */}
      <section className="section" id="impact">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}
          >
            <span className="badge badge-accent" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>
              Real Impact
            </span>
            <h2 className="text-h1" style={{ marginBottom: 'var(--space-4)' }}>
              Every Subscription Creates Change
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Choose a charity that matters to you. At least 10% of every subscription
              goes directly to your selected cause — and you can increase that amount anytime.
            </p>
          </motion.div>

          <div className="charity-spotlight">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="card" style={{ padding: 'var(--space-8)' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--gradient-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-5)',
                    fontSize: '1.75rem',
                  }}
                >
                  🌱
                </div>
                <h3 className="text-h3" style={{ marginBottom: 'var(--space-3)' }}>
                  Featured: Golf for Good Foundation
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
                  Empowering underprivileged youth through golf programs and mentorship.
                  Providing equipment, coaching, and scholarships to young people who
                  would otherwise never have the opportunity to play.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                  <div>
                    <div className="text-h3 text-gradient">£3,200</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Total Raised
                    </div>
                  </div>
                  <div>
                    <div className="text-h3" style={{ color: 'var(--accent-400)' }}>
                      142
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Supporters
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
            >
              {[
                {
                  icon: <Heart size={20} />,
                  title: 'You Choose the Cause',
                  desc: 'Browse our curated directory and select a charity aligned with your values.',
                },
                {
                  icon: <Shield size={20} />,
                  title: 'Transparent Giving',
                  desc: 'Track every penny. See exactly how much has been contributed to your chosen charity.',
                },
                {
                  icon: <TrendingUp size={20} />,
                  title: 'Increase Your Impact',
                  desc: 'Start at 10% and raise your contribution percentage anytime you like.',
                },
              ].map((item, i) => (
                <div key={i} className="card" style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(168, 85, 247, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-400)',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-h4" style={{ marginBottom: 'var(--space-1)' }}>
                      {item.title}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

              <Link href="/charities" className="btn btn-accent" id="explore-charities">
                Explore All Charities
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="section" id="pricing" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container container-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}
          >
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>
              Simple Pricing
            </span>
            <h2 className="text-h1" style={{ marginBottom: 'var(--space-4)' }}>
              One Platform. Two Plans.
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-muted)' }}>
              Every subscription includes prize draws, score tracking, and charity giving.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Monthly */}
            <motion.div
              className="card pricing-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-h4" style={{ color: 'var(--text-secondary)' }}>Monthly</h3>
              <div className="price">
                £9.99<span>/month</span>
              </div>
              <ul className="pricing-features">
                <li><Check size={16} /> Monthly prize draw entry</li>
                <li><Check size={16} /> Score tracking (5 rolling scores)</li>
                <li><Check size={16} /> Charity contribution (min 10%)</li>
                <li><Check size={16} /> Full dashboard access</li>
                <li><Check size={16} /> Cancel anytime</li>
              </ul>
              <Link
                href="/auth/signup?plan=monthly"
                className="btn btn-outline"
                style={{ width: '100%' }}
                id="pricing-monthly"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Yearly */}
            <motion.div
              className="card pricing-card recommended"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="recommend-badge">Save £19.98</div>
              <h3 className="text-h4" style={{ color: 'var(--primary-400)' }}>Yearly</h3>
              <div className="price">
                £99.90<span>/year</span>
              </div>
              <ul className="pricing-features">
                <li><Check size={16} /> Everything in Monthly</li>
                <li><Check size={16} /> 2 months free</li>
                <li><Check size={16} /> Priority draw entry</li>
                <li><Check size={16} /> Early access to features</li>
                <li><Check size={16} /> Annual impact report</li>
              </ul>
              <Link
                href="/auth/signup?plan=yearly"
                className="btn btn-primary"
                style={{ width: '100%' }}
                id="pricing-yearly"
              >
                Subscribe & Save
                <Sparkles size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-h1"
              style={{ marginBottom: 'var(--space-4)', maxWidth: '600px', margin: '0 auto var(--space-4)' }}
            >
              Ready to Make Every Round Count?
            </h2>
            <p
              className="text-body-lg"
              style={{
                color: 'var(--text-muted)',
                maxWidth: '500px',
                margin: '0 auto var(--space-8)',
              }}
            >
              Join thousands of golfers who play, win, and give back every single month.
            </p>
            <Link
              href={isLoggedIn ? dashPath : '/auth/signup'}
              className="btn btn-primary btn-lg animate-pulse-glow"
              id="final-cta"
            >
              {isLoggedIn ? <DashIcon size={18} /> : <Sparkles size={18} />}
              {isLoggedIn ? (isAdmin ? 'Open Admin Panel' : 'Open Dashboard') : 'Start Your Journey'}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
