'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══ Context ═══════════════════════════════════════════════════════════════ */

interface LoadingCtx {
  isLoading: boolean;
  loadingText: string;
  loadingSubtext: string;
  startLoading: (text?: string, subtext?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>, text?: string, subtext?: string) => Promise<T>;
}

const Ctx = createContext<LoadingCtx>({
  isLoading: false,
  loadingText: '',
  loadingSubtext: '',
  startLoading: () => {},
  stopLoading: () => {},
  withLoading: async (fn) => fn(),
});

export const useGlobalLoader = () => useContext(Ctx);

/* ═══ Centered Animated Loader Overlay ══════════════════════════════════════ */

function CenteredLoader({ text, subtext }: { text: string; subtext: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* === Outer glow orbs === */}
      <motion.div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.4, 0.8, 0.4], x: [20, -20, 20] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* === Spinner rings === */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        {/* Outer ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#10b981',
            borderRightColor: '#10b98155',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Middle ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#a855f7',
            borderLeftColor: '#a855f755',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 24,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#f59e0b',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center logo */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            boxShadow: '0 0 20px rgba(16,185,129,0.5)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: ['0 0 20px rgba(16,185,129,0.4)', '0 0 35px rgba(168,85,247,0.6)', '0 0 20px rgba(16,185,129,0.4)'],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⚡
        </motion.div>
      </div>

      {/* === Text === */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <motion.div
          style={{ fontWeight: 700, fontSize: '1.125rem', color: '#f8fafc', marginBottom: 8 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          {text || 'Loading…'}
        </motion.div>
        {subtext && (
          <motion.div
            style={{ fontSize: '0.875rem', color: '#94a3b8' }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {subtext}
          </motion.div>
        )}

        {/* Animated dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}
              animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Thin top progress bar (non-blocking) ══════════════════════════════════ */
function TopBar({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 99998,
            background: 'linear-gradient(90deg, #10b981, #a855f7, #6366f1)',
            transformOrigin: 'left center',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 0.3, 0.6, 0.85, 0.95] }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}

/* ═══ Provider ═══════════════════════════════════════════════════════════════ */

export default function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [loadingSubtext, setLoadingSubtext] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback((text = 'Loading…', subtext = '') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoadingText(text);
    setLoadingSubtext(subtext);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    // Small delay so fast operations don't flicker
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadingText('');
      setLoadingSubtext('');
    }, 250);
  }, []);

  const withLoading = useCallback(async <T,>(
    fn: () => Promise<T>,
    text = 'Loading…',
    subtext = ''
  ): Promise<T> => {
    startLoading(text, subtext);
    try {
      return await fn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return (
    <Ctx.Provider value={{ isLoading, loadingText, loadingSubtext, startLoading, stopLoading, withLoading }}>
      <TopBar active={isLoading} />
      <AnimatePresence>
        {isLoading && <CenteredLoader text={loadingText} subtext={loadingSubtext} />}
      </AnimatePresence>
      {children}
    </Ctx.Provider>
  );
}
