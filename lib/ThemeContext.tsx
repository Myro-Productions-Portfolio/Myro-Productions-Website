'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
  pendingTheme: Theme | null;
  executeThemeChange: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isTransitioning: false,
  pendingTheme: null,
  executeThemeChange: () => {},
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    } else {
      const systemPreference = window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
      setTheme(systemPreference);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setPendingTheme(newTheme);
    setIsTransitioning(true);
  };

  const executeThemeChange = () => {
    if (pendingTheme) {
      setTheme(pendingTheme);
      localStorage.setItem('theme', pendingTheme);
    }
    setIsTransitioning(false);
    setPendingTheme(null);
  };

  // Prevent flash of wrong theme by rendering children only after mounting
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning, pendingTheme, executeThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}
