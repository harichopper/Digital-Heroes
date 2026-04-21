'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Client-side SessionProvider wrapper.
 * 
 * NOTE: We do NOT pass an initial session prop here.
 * NextAuth will automatically fetch and hydrate the session
 * client-side via /api/auth/session on mount.
 * This prevents session mismatch between server and client renders.
 */
export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}         // Don't auto-refetch every N seconds
      refetchOnWindowFocus={true} // Re-check session when tab is focused
    >
      {children}
    </SessionProvider>
  );
}
