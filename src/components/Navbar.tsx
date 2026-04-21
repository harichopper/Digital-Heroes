'use client';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { swal } from '@/lib/swal';

type SessionUser = {
  role?: string;
};

/**
 * Public navigation bar — session-aware.
 * Shows Dashboard / Admin link when logged in, Login / Subscribe when logged out.
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = status === 'authenticated' && !!session;
  const sessionUser = session?.user as SessionUser | undefined;
  const isAdmin = sessionUser?.role === 'admin';
  const dashPath = isAdmin ? '/admin' : '/dashboard';
  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (session?.user?.email?.[0].toUpperCase() ?? '?');

  const handleSignOut = async () => {
    const ok = await swal.confirm('Sign Out?', 'You will be redirected to the home page.', 'Sign Out');
    if (ok) await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <nav className="nav" id="main-nav">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo" id="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            <span>Digital Heroes</span>
          </Link>

          {/* Desktop Links */}
          <ul className="nav-links">
            <li><Link href="/#how-it-works">How It Works</Link></li>
            <li><Link href="/#prizes">Prizes</Link></li>
            <li><Link href="/charities">Charities</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
          </ul>

          {/* Actions — session aware */}
          <div className="nav-actions">
            {status === 'loading' ? (
              // Skeleton while checking session
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 70, height: 34, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 110, height: 34, borderRadius: 8 }} />
              </div>
            ) : isLoggedIn ? (
              // ── Logged-in state ──
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <motion.div
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {/* Avatar */}
                  <div
                    className="avatar avatar-sm"
                    style={{
                      background: isAdmin
                        ? 'linear-gradient(135deg,#a855f7,#7c3aed)'
                        : 'linear-gradient(135deg,#10b981,#059669)',
                      boxShadow: isAdmin
                        ? '0 0 10px rgba(168,85,247,0.4)'
                        : '0 0 10px rgba(16,185,129,0.35)',
                    }}
                  >
                    {initials}
                  </div>

                  <div className="hide-mobile">
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.2 }}>
                      {session.user?.name || session.user?.email}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: isAdmin ? '#a855f7' : '#10b981', fontWeight: 600 }}>
                      {isAdmin ? 'Admin' : 'Active Player'}
                    </div>
                  </div>
                </motion.div>

                {/* Dashboard Button */}
                <Link
                  href={dashPath}
                  className="btn btn-primary btn-sm hide-mobile"
                  id="nav-dashboard"
                  style={isAdmin ? { background: 'linear-gradient(135deg,#a855f7,#7c3aed)' } : {}}
                >
                  {isAdmin ? <><Shield size={14} /> Admin Panel</> : <><LayoutDashboard size={14} /> Dashboard</>}
                </Link>

                {/* Sign out */}
                <motion.button
                  className="btn btn-ghost btn-sm hide-mobile"
                  onClick={handleSignOut}
                  id="nav-signout"
                  style={{ color: '#ef4444', gap: 6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={14} /> Out
                </motion.button>
              </div>
            ) : (
              // ── Logged-out state ──
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm" id="nav-login">Log In</Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm hide-mobile" id="nav-subscribe">
                  Subscribe Now
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="nav-mobile-toggle"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            id="mobile-menu"
          >
            <Link href="/#how-it-works" onClick={() => setMobileOpen(false)}>How It Works</Link>
            <Link href="/#prizes" onClick={() => setMobileOpen(false)}>Prizes</Link>
            <Link href="/charities" onClick={() => setMobileOpen(false)}>Charities</Link>
            <Link href="/#pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>

            {isLoggedIn ? (
              <>
                <Link href={dashPath} className="btn btn-primary" onClick={() => setMobileOpen(false)} id="mobile-dashboard">
                  {isAdmin ? <><Shield size={14} /> Admin Panel</> : <><LayoutDashboard size={14} /> Dashboard</>}
                </Link>
                <button className="btn btn-ghost" onClick={() => { setMobileOpen(false); handleSignOut(); }} style={{ color: '#ef4444' }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/signup" className="btn btn-primary" onClick={() => setMobileOpen(false)} id="mobile-subscribe">
                Subscribe Now
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
