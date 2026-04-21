'use client';
import { motion } from 'framer-motion';

/** Inline skeleton shimmer card */
export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div className="skeleton" style={{ height, borderRadius: 'var(--radius-xl)', width: '100%' }} />
  );
}

/** Animated skeleton text lines */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 16, borderRadius: 6, width: i === lines - 1 ? '65%' : '100%' }} />
      ))}
    </div>
  );
}

/** Rotating spinner — small inline use */
export function Spinner({ size = 20, color = 'var(--primary-500)' }: { size?: number; color?: string }) {
  return (
    <motion.div
      style={{
        width: size, height: size,
        border: `2.5px solid rgba(255,255,255,0.1)`,
        borderTopColor: color,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-block',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/** Animated dots loader */
export function DotsLoader({ color = 'var(--primary-400)' }: { color?: string }) {
  return (
    <div className="dots-loader">
      <span style={{ background: color }} />
      <span style={{ background: color }} />
      <span style={{ background: color }} />
    </div>
  );
}

/** Ripple + spinner button state */
export function ButtonLoader({ text = 'Loading...', color = 'white' }: { text?: string; color?: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Spinner size={16} color={color} />
      {text}
    </span>
  );
}

/** Skeleton rows for table/list loading */
export function ContentLoader({ rows = 4, height = 56 }: { rows?: number; height?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          className="skeleton"
          style={{ height, borderRadius: 'var(--radius-md)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.06 }}
        />
      ))}
    </div>
  );
}

/** Full section loading state with icon */
export function SectionLoader({ icon = '⚡', text = 'Loading data...' }: { icon?: string; text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 24px' }}
    >
      <motion.div
        style={{ fontSize: '2.5rem' }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>
      <DotsLoader />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</p>
    </motion.div>
  );
}

/** Score / lottery number ball with spring animation */
export function AnimatedBall({
  value,
  matched = false,
  delay = 0,
  size = 48,
}: {
  value: number;
  matched?: boolean;
  delay?: number;
  size?: number;
}) {
  return (
    <motion.div
      className={`score-ball ${matched ? 'matched' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.28 }}
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      whileHover={{ scale: 1.15 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
    >
      {value}
    </motion.div>
  );
}

/** Loading overlay for a specific card/section */
export function CardLoader({ height = 200, text = 'Loading...' }: { height?: number; text?: string }) {
  return (
    <div style={{ position: 'relative', height, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <DotsLoader />
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{text}</span>
      </div>
    </div>
  );
}
