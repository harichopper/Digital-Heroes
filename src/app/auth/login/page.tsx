'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession, signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Zap } from 'lucide-react';
import { swal } from '@/lib/swal';
import { Spinner } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { withLoading } = useGlobalLoader();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    router.replace(userRole === 'admin' ? '/admin' : '/dashboard');
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await withLoading(
        () => signIn('credentials', { email, password, redirect: false }),
        'Signing you in…',
        'Verifying your credentials'
      );

      if (result?.error) {
        await swal.error('Login Failed', 'Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      await swal.success('Welcome Back! 👋', 'Redirecting…');
      let latestSession = await getSession();
      for (let attempt = 0; !latestSession?.user && attempt < 5; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        latestSession = await getSession();
      }

      const userRole = (latestSession?.user as { role?: string } | undefined)?.role;
      const defaultRedirect = userRole === 'admin' ? '/admin' : '/dashboard';
      const callbackUrl = searchParams.get('callbackUrl');
      const isAuthCallback = callbackUrl?.startsWith('/auth/');
      const redirect = callbackUrl && !isAuthCallback ? callbackUrl : defaultRedirect;
      setLoading(false);
      router.replace(redirect);
      router.refresh();
    } catch {
      await swal.error('Something went wrong', 'Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background */}
      <motion.div style={{ width: 500, height: 500, background: 'rgba(16,185,129,0.07)', top: -200, right: -200, position: 'absolute', borderRadius: '50%', filter: 'blur(80px)' }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div style={{ width: 400, height: 400, background: 'rgba(168,85,247,0.06)', bottom: -150, left: -150, position: 'absolute', borderRadius: '50%', filter: 'blur(80px)' }}
        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -120, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="card"
        style={{ maxWidth: 460, width: '100%', padding: 'var(--space-10)', position: 'relative' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gradient-primary)', borderRadius: '1rem 1rem 0 0' }} />

        {/* Logo */}
        <motion.div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none', color: 'inherit' }}>
            <motion.div className="nav-logo-icon" style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', fontSize: '1.5rem' }}
              animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}>
              <Zap size={22} />
            </motion.div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Digital Heroes</span>
          </Link>
          <h1 className="text-h2" style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your account to continue</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <motion.div className="form-group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="login-email" type="email" className="form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 42 }} />
            </div>
          </motion.div>

          <motion.div className="form-group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="login-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: 42, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          <motion.button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="login-submit"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
            {loading ? <><Spinner size={18} color="white" /> Signing in…</> : <>Sign In <ArrowRight size={16} /></>}
          </motion.button>
        </form>

        {/* Demo credentials — clickable to auto-fill */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demo Credentials — Click to fill
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: '👤', label: 'User', e: 'user@digitalheroes.com', p: 'User@123456', color: 'var(--text-secondary)' },
              { icon: '⚡', label: 'Admin', e: 'admin@digitalheroes.com', p: 'Admin@123456', color: 'var(--accent-400)' },
            ].map(c => (
              <motion.div key={c.label} className="text-xs" style={{ color: c.color, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, border: '1px solid transparent' }}
                whileHover={{ borderColor: 'var(--border-default)', background: 'rgba(255,255,255,0.03)' }}
                onClick={() => { setEmail(c.e); setPassword(c.p); }}>
                {c.icon} {c.label}: {c.e} / {c.p}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <LoginPageContent />
    </Suspense>
  );
}
