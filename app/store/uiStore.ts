import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type SidebarBehavior = 'always-open' | 'always-closed';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  sidebarBehavior: SidebarBehavior;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setSidebarBehavior: (behavior: SidebarBehavior) => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar (default open on page visit, configurable via sidebarBehavior)
      isSidebarOpen: true,
      sidebarBehavior: 'always-open',
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
      openSidebar: () => set({ isSidebarOpen: true }),
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setSidebarBehavior: (behavior) =>
        set({
          sidebarBehavior: behavior,
          isSidebarOpen: behavior === 'always-open',
        }),

      // Theme
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        isSidebarOpen: state.isSidebarOpen,
        sidebarBehavior: state.sidebarBehavior,
        theme: state.theme 
      }),
    }
  )
);
