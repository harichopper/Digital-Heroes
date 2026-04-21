'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getSession, signIn, useSession } from 'next-auth/react';
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff, Check,
  Sparkles, Zap, Heart, ChevronRight,
} from 'lucide-react';
import { swal } from '@/lib/swal';
import { Spinner, DotsLoader } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type Charity = { _id: string; name: string; shortDescription?: string; category?: string; isFeatured: boolean };

const STEPS = ['Plan', 'Account', 'Charity'];

function SignupPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { withLoading } = useGlobalLoader();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loadingCharities, setLoadingCharities] = useState(false);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');

  useEffect(() => {
    if (searchParams.get('plan') === 'yearly') setPlan('yearly');
  }, [searchParams]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    router.replace(userRole === 'admin' ? '/admin' : '/dashboard');
  }, [status, session, router]);

  // Load charities when moving to step 3
  useEffect(() => {
    if (step === 3 && charities.length === 0) {
      setLoadingCharities(true);
      fetch('/api/charities')
        .then(r => r.json())
        .then(d => { setCharities(d.charities || []); setLoadingCharities(false); })
        .catch(() => setLoadingCharities(false));
    }
  }, [step, charities.length]);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const data = await withLoading(async () => {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName, plan, selectedCharityId }),
        });
        return res.json().then(d => ({ ...d, ok: res.ok }));
      }, 'Creating your account…', 'Setting up your profile');

      if (!data.ok) {
        await swal.error('Registration Failed', data.error || 'Please try again.');
        setLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', { email, password, redirect: false });
      if (signInResult?.error) {
        await swal.warning(
          'Account created, login required',
          'Your account was created, but automatic sign-in failed. Please log in to continue.'
        );
        router.push('/auth/login');
        return;
      }

      // Session cookies may take a short moment to become available to server routes.
      let sessionReady = false;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const currentSession = await getSession();
        if (currentSession?.user) {
          sessionReady = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (!sessionReady) {
        await swal.warning(
          'Account created, login required',
          'Please log in once to continue to checkout.'
        );
        router.push('/auth/login');
        return;
      }

      const checkout = await withLoading(async () => {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        return res.json().then((payload: { url?: string; error?: string }) => ({
          ok: res.ok,
          ...payload,
        }));
      }, 'Creating secure checkout…', 'Redirecting to Stripe');

      if (checkout.ok && checkout.url) {
        window.location.href = checkout.url;
        return;
      }

      await swal.warning(
        'Account created, payment pending',
        checkout.error || 'We could not start checkout. Open Settings to complete subscription.'
      );
      router.push('/dashboard/settings');
      router.refresh();
    } catch {
      await swal.error('Something went wrong', 'Please try again later.');
      setLoading(false);
    }
  };

  const goToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { swal.error('Weak password', 'Password must be at least 6 characters'); return; }
    setStep(3);
  };

  const plans = [
    { id: 'monthly' as const, name: 'Monthly', price: '£9.99', period: '/month', note: 'Billed monthly · Cancel anytime', badge: null },
    { id: 'yearly' as const, name: 'Yearly', price: '£99.90', period: '/year', note: 'Save £19.98 · 2 months free', badge: 'BEST VALUE' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <motion.div style={{ width: 500, height: 500, background: 'rgba(168,85,247,0.07)', top: -200, left: -200, position: 'absolute', borderRadius: '50%', filter: 'blur(80px)' }}
        animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div style={{ width: 400, height: 400, background: 'rgba(16,185,129,0.06)', bottom: -150, right: -150, position: 'absolute', borderRadius: '50%', filter: 'blur(80px)' }}
        animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 10, repeat: Infinity }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ maxWidth: step === 3 ? 600 : 520, width: '100%', padding: 'var(--space-10)', position: 'relative', transition: 'max-width 0.3s' }}
      >
        {/* Gradient top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gradient-accent)', borderRadius: '1rem 1rem 0 0' }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none', color: 'inherit' }}>
            <div className="nav-logo-icon" style={{ width: 48, height: 48, fontSize: '1.5rem' }}><Zap size={22} /></div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Digital Heroes</span>
          </Link>
          <h1 className="text-h2" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-1)' }}>Join the Movement</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Play golf. Win prizes. Change lives.</p>
        </div>

        {/* Step progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 'var(--space-8)' }}>
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <motion.div
                    animate={{ background: done ? 'var(--primary-500)' : active ? 'var(--gradient-primary)' : 'var(--bg-card)', borderColor: active || done ? 'var(--primary-500)' : 'var(--border-subtle)' }}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    {done ? <Check size={14} /> : n}
                  </motion.div>
                  <span style={{ fontSize: '0.65rem', color: active ? 'var(--primary-400)' : 'var(--text-muted)', fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 48, height: 2, background: step > n ? 'var(--primary-500)' : 'var(--border-subtle)', marginBottom: 20, marginLeft: 4, marginRight: 4, transition: 'background 0.3s' }} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Plan ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h3 className="text-h4" style={{ marginBottom: 'var(--space-5)', textAlign: 'center' }}>Choose Your Plan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {plans.map((p) => (
                  <motion.button key={p.id} type="button" onClick={() => setPlan(p.id)} id={`plan-${p.id}`}
                    className="card" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--space-5)', border: plan === p.id ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)', background: plan === p.id ? 'rgba(16,185,129,0.07)' : 'var(--bg-card)', position: 'relative' }}>
                    {p.badge && <span style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-warm)', borderRadius: 'var(--radius-full)', padding: '2px 12px', fontSize: '0.65rem', fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}>{p.badge}</span>}
                    {plan === p.id && <Check size={16} style={{ position: 'absolute', top: 10, right: 10, color: 'var(--primary-400)' }} />}
                    <div className="text-sm" style={{ fontWeight: 600, color: plan === p.id ? 'var(--primary-400)' : 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>{p.price}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.period}</div>
                    <div className="text-xs" style={{ color: 'var(--primary-400)', marginTop: 'var(--space-2)', fontWeight: 500 }}>{p.note}</div>
                  </motion.button>
                ))}
              </div>
              <motion.button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setStep(2)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Continue <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2: Account Details ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <button onClick={() => setStep(1)} className="btn btn-icon btn-ghost" style={{ padding: 8 }}>←</button>
                <div>
                  <h3 className="text-h4">Create Account</h3>
                  <span className="badge badge-primary" style={{ marginTop: 4 }}>
                    <Sparkles size={10} /> {plan === 'yearly' ? 'Yearly — £99.90' : 'Monthly — £9.99'}
                  </span>
                </div>
              </div>
              <form onSubmit={goToStep3} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-name">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="signup-name" type="text" className="form-input" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ paddingLeft: 42 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-email">Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="signup-email" type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 42 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="signup-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ paddingLeft: 42, paddingRight: 42 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <motion.button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-2)' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Next: Choose Charity <ChevronRight size={16} />
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 3: Charity Selection ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <button onClick={() => setStep(2)} className="btn btn-icon btn-ghost" style={{ padding: 8 }}>←</button>
                <div>
                  <h3 className="text-h4">Choose Your Charity</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>10% of your subscription goes here. You can change this anytime.</p>
                </div>
              </div>

              {loadingCharities ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}><DotsLoader /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: 320, overflowY: 'auto', marginBottom: 'var(--space-6)', paddingRight: 4 }}>
                  {/* "Skip" option */}
                  <motion.div
                    onClick={() => setSelectedCharityId('')}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: !selectedCharityId ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)', background: !selectedCharityId ? 'rgba(16,185,129,0.07)' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>⏭</div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Choose Later</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You can pick a charity from your dashboard anytime.</div>
                    </div>
                    {!selectedCharityId && <Check size={16} style={{ color: 'var(--primary-400)', marginLeft: 'auto', flexShrink: 0 }} />}
                  </motion.div>

                  {charities.map((c, i) => (
                    <motion.div
                      key={c._id}
                      onClick={() => setSelectedCharityId(c._id)}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: selectedCharityId === c._id ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)', background: selectedCharityId === c._id ? 'rgba(16,185,129,0.07)' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Heart size={14} style={{ color: 'var(--accent-400)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {c.name}
                          {c.isFeatured && <span className="badge badge-warm" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Featured</span>}
                        </div>
                        {c.shortDescription && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.shortDescription}</div>}
                        {c.category && <span className="badge badge-neutral" style={{ fontSize: '0.6rem', marginTop: 2 }}>{c.category}</span>}
                      </div>
                      {selectedCharityId === c._id && <Check size={16} style={{ color: 'var(--primary-400)', flexShrink: 0 }} />}
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleSignup}
                disabled={loading || loadingCharities}
                id="signup-submit"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                {loading ? <><Spinner size={18} color="white" /> Creating account...</> : <><Sparkles size={16} /> Create Account & Start Playing</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <SignupPageContent />
    </Suspense>
  );
}
