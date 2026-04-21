'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Trophy, Heart, CreditCard,
  Settings, LogOut, Menu, X, Sparkles, Shield,
} from 'lucide-react';
import { swal } from '@/lib/swal';
import PageLoader from '@/components/PageLoader';
import '../user-theme.css';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/scores', label: 'My Scores', icon: Target },
  { href: '/dashboard/draws', label: 'Prize Draws', icon: Trophy },
  { href: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { href: '/dashboard/winnings', label: 'Winnings', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

type SessionUser = {
  role?: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  // Time-based greeting
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (status === 'loading') return <PageLoader text="Loading Your Dashboard..." />;
  if (!session) return null;

  const handleLogout = async () => {
    const confirmed = await swal.confirm('Sign Out?', 'You will be redirected to the home page.', 'Yes, sign out');
    if (!confirmed) return;
    await signOut({ callbackUrl: '/' });
  };

  const sessionUser = session?.user as SessionUser | undefined;
  const isAdmin = sessionUser?.role === 'admin';

  const initials = session.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session.user?.email?.[0].toUpperCase() || '?';

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="user-theme" style={{ minHeight: '100vh' }}>
      {/* ── Warm top nav ── */}
      <nav className="nav nav-user"
        style={{ background: 'linear-gradient(135deg, rgba(4,15,10,0.97), rgba(6,20,12,0.97))', borderBottom: '1px solid rgba(16,185,129,0.18)' }}>
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button id="dash-menu-btn" className="btn btn-icon btn-ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <style>{`@media(max-width:900px){#dash-menu-btn{display:flex!important}}`}</style>

            <Link href="/" style={{ textDecoration: 'none' }}>
              <motion.div style={{ display: 'flex', alignItems: 'center', gap: 12 }} whileHover={{ scale: 1.02 }}>
                {/* Organic round logo */}
                <motion.div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)',
                }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(16,185,129,0.2)',
                      '0 0 30px rgba(16,185,129,0.4)',
                      '0 0 20px rgba(16,185,129,0.2)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}>
                  ⚡
                </motion.div>
                <div className="hide-mobile">
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#34d399', letterSpacing: '-0.01em' }}>Digital Heroes</div>
                  <div style={{ fontSize: '0.65rem', color: '#065f46', fontWeight: 500 }}>Player Dashboard</div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Right: admin switch (if admin) + greeting + Avatar */}
          <div className="nav-actions" style={{ gap: 10 }}>
            {/* Switch to Admin Panel — only visible if user has admin role */}
            {isAdmin && (
              <Link href="/admin" className="hide-mobile" id="user-switch-admin">
                <motion.div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
                    background: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.25)',
                    borderRadius: 12,
                    fontSize: '0.75rem', fontWeight: 700,
                    color: '#c084fc',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                  whileHover={{
                    background: 'rgba(168,85,247,0.15)',
                    borderColor: 'rgba(168,85,247,0.5)',
                    boxShadow: '0 0 16px rgba(168,85,247,0.2)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  title="Switch to Admin Panel"
                >
                  <Shield size={13} />
                  Admin Panel
                </motion.div>
              </Link>
            )}
            <div className="hide-mobile" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 500 }}>{greeting} 👋</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0' }}>{session.user?.name}</div>
            </div>
            <motion.div
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 700, color: 'white',
                boxShadow: '0 0 16px rgba(16,185,129,0.25)',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.1, boxShadow: '0 0 24px rgba(16,185,129,0.4)' }}
              whileTap={{ scale: 0.95 }}>
              {initials}
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="dashboard-layout">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div id="dash-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(6px)', display: 'none' }} />
          )}
        </AnimatePresence>
        <style>{`@media(max-width:900px){#dash-backdrop{display:block!important}}`}</style>

        {/* ── Sidebar — warm rounded ── */}
        <motion.aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
          style={{ background: 'linear-gradient(180deg, rgba(4,15,10,0.98), rgba(2,10,6,0.99))', borderRight: '1px solid rgba(16,185,129,0.1)' }}>

          {/* Membership card — rounded pill */}
          <div style={{
            margin: '16px 12px', padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#10b981,#34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(16,185,129,0.3)',
            }}>
              <Sparkles size={14} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>ACTIVE MEMBER</div>
              <div style={{ fontSize: '0.65rem', color: '#065f46' }}>Monthly Subscriber</div>
            </div>
          </div>

          {/* Nav items */}
          <div className="sidebar-section">
            <div className="sidebar-section-title" style={{ color: '#065f46', fontSize: '0.65rem', letterSpacing: '0.06em' }}>MY ACCOUNT</div>
            <nav className="sidebar-nav">
              {navItems.map((item, i) => {
                const active = isActive(item);
                return (
                  <motion.div key={item.href}
                    initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}>
                    <Link
                      href={item.href}
                      className={`sidebar-link ${active ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                      style={active ? { borderRadius: 12 } : {}}
                    >
                      <item.icon size={17} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active && (
                        <motion.div
                          layoutId="user-active"
                          style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#10b981,#34d399)',
                            boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Bottom user card — organic rounded */}
          <div style={{ marginTop: 'auto', padding: '0 12px 16px' }}>
            <div style={{
              padding: 14, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))',
              border: '1px solid rgba(16,185,129,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white',
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{session.user?.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#10b981' }}>{session.user?.email}</div>
                </div>
              </div>
              <motion.button onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', color: '#ef4444', justifyContent: 'center', gap: 8, borderRadius: 10 }}
                whileHover={{ background: 'rgba(239,68,68,0.08)' }}>
                <LogOut size={13} /> Sign Out
              </motion.button>
            </div>
          </div>
        </motion.aside>

        {/* ── Main content ── */}
        <main className="dashboard-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
