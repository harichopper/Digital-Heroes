'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Trophy, Heart, Award, BarChart3,
  LogOut, Menu, Shield, X, Terminal, Wifi, ChevronRight, MessageSquare,
} from 'lucide-react';
import { swal } from '@/lib/swal';
import { useGlobalLoader } from '@/components/GlobalLoader';
import PageLoader from '@/components/PageLoader';
import '../admin-theme.css';

const navItems = [
  { href: '/admin', label: 'OVERVIEW', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'USERS', icon: Users },
  { href: '/admin/draws', label: 'DRAW MGMT', icon: Trophy },
  { href: '/admin/charities', label: 'CHARITIES', icon: Heart },
  { href: '/admin/winners', label: 'WINNERS', icon: Award },
  { href: '/admin/contact', label: 'MESSAGES', icon: MessageSquare },
  { href: '/admin/reports', label: 'REPORTS', icon: BarChart3 },
];

type SessionUser = {
  role?: string;
  name?: string | null;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { withLoading } = useGlobalLoader();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [uptime, setUptime] = useState(0);
  const sessionUser = session?.user as SessionUser | undefined;

  // Live clock + uptime counter
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    const up = setInterval(() => setUptime(u => u + 1), 1000);
    return () => { clearInterval(id); clearInterval(up); };
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated' && sessionUser?.role !== 'admin') {
      swal.error('ACCESS DENIED', 'Insufficient privileges for this terminal.').then(() => router.push('/dashboard'));
    }
  }, [status, sessionUser?.role, router]);

  if (status === 'loading') return <PageLoader text="INITIALISING ADMIN CONSOLE..." accentColor="#a855f7" />;
  if (!session || sessionUser?.role !== 'admin') return null;

  const handleLogout = async () => {
    const ok = await swal.confirm('TERMINATE SESSION?', 'You will be disconnected from the admin terminal.', 'CONFIRM EXIT', true);
    if (ok) {
      await withLoading(() => signOut({ callbackUrl: '/' }), 'Terminating session…', 'Disconnecting securely');
    }
  };

  const initials = session.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'A';

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const fmtUptime = () => {
    const m = Math.floor(uptime / 60);
    const s = uptime % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="admin-theme" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── HUD Top Bar ── */}
      <nav className="nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div className="nav-inner">
          {/* Left: Logo + HUD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button id="admin-menu-toggle" className="btn btn-icon btn-ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <style>{`@media(max-width:900px){#admin-menu-toggle{display:flex!important}}`}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Angular shield logo */}
              <motion.div style={{
                width: 36, height: 36,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 25px rgba(168,85,247,0.4)',
              }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168,85,247,0.3)',
                    '0 0 40px rgba(168,85,247,0.6)',
                    '0 0 20px rgba(168,85,247,0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}>
                <Shield size={16} color="white" />
              </motion.div>
              <div className="hide-mobile">
                <div style={{
                  fontFamily: '"Courier New", monospace', fontWeight: 700,
                  fontSize: '0.875rem', color: '#c084fc', letterSpacing: '0.06em',
                }}>
                  ADMIN CONSOLE
                </div>
                <div style={{
                  fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
                  color: '#7c3aed', letterSpacing: '0.12em',
                }}>
                  DIGITAL HEROES v1.0
                </div>
              </div>
            </div>
          </div>

          {/* Centre: Live HUD clock + indicators */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="live-dot">LIVE</div>
            <code style={{
              fontFamily: '"Courier New", monospace', fontSize: '1rem',
              color: '#c084fc', letterSpacing: '0.12em', fontWeight: 700,
            }}>
              {time}
            </code>
            <div style={{ width: 1, height: 20, background: 'rgba(168,85,247,0.2)' }} />
            <code style={{
              fontFamily: '"Courier New", monospace', fontSize: '0.7rem',
              color: '#7c3aed', letterSpacing: '0.08em',
            }}>
              {date}
            </code>
            <div style={{ width: 1, height: 20, background: 'rgba(168,85,247,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Wifi size={12} style={{ color: '#4ade80' }} />
              <code style={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#64748b' }}>
                UP {fmtUptime()}
              </code>
            </div>
          </div>

          {/* Right: Switch view + badge */}
          <div className="nav-actions" style={{ gap: 10 }}>
            {/* Prominent Switch to User View button */}
            <Link href="/dashboard" className="hide-mobile" id="admin-switch-user">
              <motion.div
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 4,
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem', fontWeight: 700,
                  color: '#34d399',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
                whileHover={{
                  background: 'rgba(16,185,129,0.15)',
                  borderColor: 'rgba(16,185,129,0.5)',
                  boxShadow: '0 0 16px rgba(16,185,129,0.2)',
                  x: -2,
                }}
                whileTap={{ scale: 0.97 }}
                title="Switch to User Dashboard"
              >
                <LayoutDashboard size={13} />
                USER DASHBOARD
              </motion.div>
            </Link>
            <div className="admin-badge">
              <Shield size={10} />
              {session.user?.name || 'ADMIN'}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 40, display: 'none', backdropFilter: 'blur(4px)' }}
            id="admin-backdrop" />
        )}
      </AnimatePresence>
      <style>{`@media(max-width:900px){#admin-backdrop{display:block!important}}`}</style>

      <div className="dashboard-layout" style={{ paddingTop: 64 }}>
        {/* ── HUD Sidebar ── */}
        <motion.aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
          style={{ background: 'rgba(8, 6, 15, 0.98)', borderRight: '1px solid rgba(168,85,247,0.18)' }}>

          {/* System status — terminal style */}
          <div style={{
            margin: '16px 10px', padding: '10px 12px',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 3,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }}
                animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <div>
                <div style={{
                  fontFamily: '"Courier New", monospace', fontSize: '0.65rem',
                  color: '#4ade80', fontWeight: 700, letterSpacing: '0.1em',
                }}>
                  SYS:ONLINE
                </div>
                <div style={{
                  fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
                  color: '#475569', letterSpacing: '0.06em',
                }}>
                  All services operational
                </div>
              </div>
            </div>
          </div>

          {/* Nav — terminal-style */}
          <div className="sidebar-section">
            <div className="sidebar-section-title" style={{
              fontFamily: '"Courier New", monospace', color: '#7c3aed',
              letterSpacing: '0.15em', fontSize: '0.6rem',
            }}>
              <Terminal size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              NAVIGATION
            </div>
            <nav className="sidebar-nav">
              {navItems.map((item, i) => {
                const active = isActive(item);
                return (
                  <motion.div key={item.href}
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}>
                    <Link href={item.href}
                      className={`sidebar-link ${active ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        ...(active ? { borderLeftColor: '#a855f7', color: '#c084fc', background: 'rgba(168,85,247,0.12)' } : {}),
                      }}>
                      <item.icon size={16} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active ? (
                        <motion.div layoutId="admin-active"
                          style={{ width: 4, height: 16, borderRadius: 1, background: '#a855f7', flexShrink: 0 }} />
                      ) : (
                        <ChevronRight size={12} style={{ opacity: 0.2 }} />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Admin info — terminal card */}
          <div style={{ marginTop: 'auto', padding: '0 10px 16px' }}>
            <div style={{
              padding: 12, borderRadius: 3,
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {/* Hexagonal avatar */}
                <div style={{
                  width: 36, height: 36,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white',
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{
                    fontFamily: '"Courier New", monospace', fontSize: '0.8rem',
                    fontWeight: 600, color: '#e2e8f0',
                  }}>
                    {session.user?.name}
                  </div>
                  <div style={{
                    fontFamily: '"Courier New", monospace', fontSize: '0.65rem',
                    color: '#a855f7', letterSpacing: '0.06em',
                  }}>
                    SUPER ADMIN
                  </div>
                </div>
              </div>
              <motion.button onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                style={{
                  width: '100%', color: '#ef4444', justifyContent: 'center', gap: 8,
                  borderRadius: 3, fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem', letterSpacing: '0.06em',
                }}
                whileHover={{ background: 'rgba(239,68,68,0.08)' }}>
                <LogOut size={13} /> SIGN OUT
              </motion.button>
            </div>
          </div>
        </motion.aside>

        {/* ── Main content ── */}
        <main className="dashboard-main" style={{ background: 'transparent' }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
