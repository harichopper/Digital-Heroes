/**
 * Zustand store for client-side UI state management.
 * Auth is handled by NextAuth — this manages UI toggles and cached data.
 */
import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}));
