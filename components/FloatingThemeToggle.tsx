'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      className={`
        fixed bottom-5 right-5 z-[9999]
        flex items-center gap-2 px-3 py-2 rounded-full
        text-xs font-semibold
        shadow-lg border transition-all duration-300
        hover:scale-105 active:scale-95
        ${isDark
          ? 'bg-[#1a3a6b] border-blue-500/40 text-blue-200 hover:bg-[#1e4480] hover:border-blue-400/60 shadow-blue-900/40'
          : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 shadow-orange-100'
        }
      `}
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-yellow-300" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-blue-600" />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
