import React, { useState } from 'react';
import { useI18n } from '../../i18n/index.jsx';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export function Shell({ currentRoute, onNavigate, children }) {
  const { dir } = useI18n();
  const [theme, setTheme] = useState(() => {
    return (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'chatchi-dark';
  });

  const toggleTheme = () => {
    const next = theme === 'chatchi-dark' ? 'chatchi-light' : 'chatchi-dark';
    setTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('chatchi_theme', next);
      } catch (_) {}
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content" dir={dir}>
      <Navbar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
