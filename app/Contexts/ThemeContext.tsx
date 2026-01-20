import { useEffect } from "react";
import { useUIStore } from "~/store/uiStore";

// Re-export types if needed by consumers, though state is now in store
type Theme = "light" | "dark";

/* 
 * Bridge component to handle DOM updates and FOUC prevention logic 
 * based on the global Zustand store.
 */
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useUIStore();

  useEffect(() => {
    // 1. Update DOM class
    document.documentElement.classList.toggle("dark", theme === "dark");
    
    // 2. Update localStorage for FOUC script compatibility (root.tsx inline script reads 'theme')
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Render children directly, no Context Provider needed as state is global
  return <>{children}</>;
};

/*
 * Hook Compatibility Adapter
 * Allows existing components to use useTheme() API while using Zustand under the hood.
 */
const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useUIStore();
  return { 
    theme, 
    toggleTheme, 
    setTheme,
    isDark: theme === "dark" 
  };
};

export { ThemeProvider, useTheme };
export type { Theme };
