import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
      openSidebar: () => set({ isSidebarOpen: true }),
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      // Theme
      theme: 'dark', // Default
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme 
      }), // Persist both sidebar and theme
    }
  )
);
