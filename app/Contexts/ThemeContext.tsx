import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

const getInitialTheme = (): Theme => {
  // Only run on client side
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved) return saved;

  // Check system preference
  const system: Theme = window.matchMedia?.("(prefers-color-scheme: dark)")
    .matches
    ? "dark"
    : "light";

  return system;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Initialize with the correct theme immediately
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle initial theme setup
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);

    // Apply theme to document immediately
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    setIsInitialized(true);
  }, []);

  // Handle theme changes after initialization
  useEffect(() => {
    if (!isInitialized) return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, isInitialized]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme: handleSetTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};

export { ThemeProvider, useTheme };
