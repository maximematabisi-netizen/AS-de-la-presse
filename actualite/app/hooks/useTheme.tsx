"use client";

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export default function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const v = localStorage.getItem('theme');
      return (v as Theme) || 'system';
    } catch (e) {
      return 'system';
    }
  });

  useEffect(() => {
    const apply = (t: Theme) => {
      const el = document.documentElement;
      if (t === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        el.classList.toggle('dark', prefersDark);
      } else {
        el.classList.toggle('dark', t === 'dark');
      }
    };

    apply(theme);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (theme === 'system') apply('system');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [theme]);

  const setTheme = (t: Theme) => {
    try {
      localStorage.setItem('theme', t);
    } catch (e) {}
    setThemeState(t);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
