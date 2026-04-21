import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)',
      }}
    >
      <div className="hero-bg-orb hero-bg-orb-1" />
      <div className="hero-bg-orb hero-bg-orb-2" />

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '8rem',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--primary-400), var(--accent-400))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        404
      </div>

      <h1 className="text-h2">Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <Link href="/" className="btn btn-primary">
          <Home size={16} /> Go Home
        </Link>
        <Link href="/dashboard" className="btn btn-outline">
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </div>
    </div>
  );
}
