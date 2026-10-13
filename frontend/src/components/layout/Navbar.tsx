import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useI18n } from '../../i18n/index.tsx';

export type RouteKey = 'home' | 'share' | 'apps' | 'docs';

export interface NavbarProps {
  currentRoute: RouteKey;
  onNavigate: (route: RouteKey) => void;
  onToggleTheme: () => void;
  currentTheme: string;
}

export function Navbar({ currentRoute, onNavigate, onToggleTheme, currentTheme }: NavbarProps) {
  const { t, lang, toggleLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNav = (route: RouteKey) => {
    setIsOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="navbar min-h-16 px-0 flex justify-between">
          {/* Start: Sandwich mobile dropdown & Brand */}
          <div className="navbar-start w-auto flex items-center gap-2">
            <div ref={dropdownRef} className={`dropdown lg:hidden ${isOpen ? 'dropdown-open' : ''}`}>
              <button
                type="button"
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-square btn-sm"
                aria-label="Menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <Menu className="w-5 h-5" />
              </button>
              {isOpen && (
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow-lg border border-base-300"
                >
                  <li>
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('home');
                      }}
                      className={currentRoute === 'home' ? 'active' : ''}
                    >
                      {t('nav_home')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="/apps"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('apps');
                      }}
                      className={currentRoute === 'apps' ? 'active' : ''}
                    >
                      {t('nav_apps')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="/docs"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('docs');
                      }}
                      className={currentRoute === 'docs' ? 'active' : ''}
                    >
                      {t('nav_docs')}
                    </a>
                  </li>
                </ul>
              )}
            </div>

            <div
              role="button"
              tabIndex={0}
              className="btn btn-ghost px-2 normal-case flex items-center gap-2.5 cursor-pointer shrink-0"
              onClick={() => handleNav('home')}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNav('home');
                }
              }}
            >
              <img
                src="/logo.svg"
                alt={t('app_title')}
                className="h-8 max-h-8 w-auto max-w-[120px] object-contain shrink-0"
              />
              <span className="font-bold text-base tracking-tight">{t('app_title')}</span>
            </div>
          </div>

          {/* Center: Desktop horizontal menu */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-1 text-xs font-semibold">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('home');
                  }}
                  className={currentRoute === 'home' ? 'active' : ''}
                >
                  {t('nav_home')}
                </a>
              </li>
              <li>
                <a
                  href="/apps"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('apps');
                  }}
                  className={currentRoute === 'apps' ? 'active' : ''}
                >
                  {t('nav_apps')}
                </a>
              </li>
              <li>
                <a
                  href="/docs"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('docs');
                  }}
                  className={currentRoute === 'docs' ? 'active' : ''}
                >
                  {t('nav_docs')}
                </a>
              </li>
            </ul>
          </div>

          {/* End: Language toggle & Theme button */}
          <div className="navbar-end w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              dir="ltr"
              className="btn btn-outline btn-xs h-7 min-h-0 w-9 p-0 font-bold inline-flex items-center justify-center text-center leading-none"
              aria-label="Toggle language"
            >
              <span className="leading-none text-center flex items-center justify-center">
                {lang === 'fa' ? 'EN' : 'فا'}
              </span>
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Toggle theme"
            >
              {currentTheme === 'chatchi-dark' ? (
                <Sun className="w-4 h-4 text-warning" />
              ) : (
                <Moon className="w-4 h-4 text-base-content" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
