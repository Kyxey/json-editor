import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
} {
  const [theme, setTheme] = useState<Theme>(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent): void => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme;
  }, [theme]);

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}