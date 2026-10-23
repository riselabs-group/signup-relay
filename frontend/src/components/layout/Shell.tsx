import { useState, useEffect, type ReactNode } from 'react';
import { useI18n } from '../../i18n/index.tsx';
import { useServerConfig } from '../../services/ConfigContext.tsx';
import { getPlatformName, getPlatformFavicon } from '../../utils/branding.ts';
import { Navbar, type RouteKey } from './Navbar.tsx';
import { Footer } from './Footer.tsx';

export interface ShellProps {
  currentRoute: RouteKey;
  onNavigate: (route: RouteKey) => void;
  children: ReactNode;
}

export function Shell({ currentRoute, onNavigate, children }: ShellProps) {
  const { dir, lang, t } = useI18n();
  const config = useServerConfig();
  const platformName = getPlatformName(config, lang);
  const [theme, setTheme] = useState<string>(() => {
    return (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'chatchi-dark';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const routeTitles: Record<RouteKey, string> = {
      home: `${platformName} — DeltaChat Portal`,
      share: `${t('nav_share')} — ${platformName}`,
      apps: `${t('nav_apps')} — ${platformName}`,
      docs: `${t('nav_docs')} — ${platformName}`,
      community: `${t('nav_community')} — ${platformName}`,
    };
    document.title = routeTitles[currentRoute] || platformName;
  }, [currentRoute, platformName, t]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const faviconHref = getPlatformFavicon(config);
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconHref;
  }, [config]);

  const toggleTheme = () => {
    const next = theme === 'chatchi-dark' ? 'chatchi-light' : 'chatchi-dark';
    setTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('chatchi_theme', next);
      } catch {
        // Ignore local storage errors
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content bg-delta-pattern relative overflow-x-hidden" dir={dir}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>
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
