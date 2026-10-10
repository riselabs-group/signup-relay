import React from 'react';
import { useI18n } from '../../i18n/index.jsx';

export function Navbar({ currentRoute, onNavigate, onToggleTheme, currentTheme }) {
  const { t, lang, toggleLang } = useI18n();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-base-300 bg-base-100/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('home')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('home');
            }
          }}
        >
          <div className="w-8 h-8 rounded bg-primary text-primary-content font-bold flex items-center justify-center text-sm shadow">
            Δ
          </div>
          <span className="font-bold text-base tracking-tight">Chatchi</span>
          <span className="badge badge-xs badge-neutral">Relay</span>
        </div>

        {/* Desktop route navigation */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => onNavigate('home')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'home' ? 'btn-active' : ''}`}
          >
            {t('nav_home')}
          </button>
          <button
            onClick={() => onNavigate('share')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'share' ? 'btn-active' : ''}`}
          >
            {t('nav_share')}
          </button>
          <button
            onClick={() => onNavigate('apps')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'apps' ? 'btn-active' : ''}`}
          >
            {t('nav_apps')}
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'docs' ? 'btn-active' : ''}`}
          >
            {t('nav_docs')}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile dropdown route menu */}
          <div className="dropdown dropdown-end md:hidden">
            <button tabIndex={0} className="btn btn-ghost btn-xs btn-square text-base leading-none" aria-label="Menu">
              ☰
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 z-50 text-xs border border-base-300">
              <li><button onClick={() => onNavigate('home')}>{t('nav_home')}</button></li>
              <li><button onClick={() => onNavigate('share')}>{t('nav_share')}</button></li>
              <li><button onClick={() => onNavigate('apps')}>{t('nav_apps')}</button></li>
              <li><button onClick={() => onNavigate('docs')}>{t('nav_docs')}</button></li>
            </ul>
          </div>

          <button onClick={toggleLang} className="btn btn-outline btn-xs px-2.5 font-bold">
            {lang === 'fa' ? 'EN' : 'فا'}
          </button>
          <button onClick={onToggleTheme} className="btn btn-ghost btn-sm btn-square" aria-label="Toggle theme">
            {currentTheme === 'chatchi-dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
