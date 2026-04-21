'use client';
import { motion } from 'framer-motion';

/**
 * Full-page animated loader with floating orbs and pulsing logo.
 * accentColor controls the glow color so it matches admin (purple) vs user (green) themes.
 */
export default function PageLoader({
  text = 'Loading...',
  accentColor = '#10b981',
}: {
  text?: string;
  accentColor?: string;
}) {
  const secondaryColor = accentColor === '#a855f7' ? '#6366f1' : '#a855f7';
  const orbColor1 = `${accentColor}18`;
  const orbColor2 = `${secondaryColor}12`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', gap: 'var(--space-6)',
    }}>
      {/* Floating orbs */}
      {[
        { size: 400, color: orbColor1, anim: { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }, dur: 3 },
        { size: 300, color: orbColor2, anim: { scale: [1.2, 1, 1.2], opacity: [0.4, 0.8, 0.4], x: [30, -30, 30] }, dur: 4 },
        { size: 200, color: orbColor1, anim: { scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3], y: [-20, 20, -20] }, dur: 5 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', width: orb.size, height: orb.size, borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={orb.anim}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Spinning ring */}
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        <motion.svg
          width="88" height="88" viewBox="0 0 88 88"
          style={{ position: 'absolute', inset: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="44" cy="44" r="38"
            fill="none" stroke={`url(#pg-grad-${accentColor.replace('#', '')})`}
            strokeWidth="3" strokeLinecap="round"
            strokeDasharray="60 180" strokeDashoffset="20"
          />
          <defs>
            <linearGradient id={`pg-grad-${accentColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Icon pulse */}
        <motion.div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: `0 0 24px ${accentColor}60`,
          }}
          animate={{ scale: [1, 1.12, 1], boxShadow: [`0 0 24px ${accentColor}60`, `0 0 40px ${accentColor}90`, `0 0 24px ${accentColor}60`] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⚡
        </motion.div>
      </div>

      {/* Dots loader */}
      <div className="dots-loader" style={{ marginTop: 8 }}>
        <span style={{ background: accentColor }} />
        <span style={{ background: accentColor }} />
        <span style={{ background: accentColor }} />
      </div>

      {/* Text */}
      <motion.div
        style={{ textAlign: 'center' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: accentColor, marginBottom: 4 }}>
          Digital Heroes
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{text}</div>
      </motion.div>
    </div>
  );
}
