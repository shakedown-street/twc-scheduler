/* eslint-disable react-refresh/only-export-components */

import React from 'react';

type Theme = 'dark' | 'light' | 'system';

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeContextType = {
  theme: 'system',
  setTheme: () => {},
};

export const ThemeContext = React.createContext<ThemeContextType>(initialState);

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) => {
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);

  React.useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
