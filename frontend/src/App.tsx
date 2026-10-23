import { useState, useEffect, useCallback } from 'react';
import { I18nProvider } from './i18n/index.tsx';
import { ConfigProvider } from './services/ConfigContext.tsx';
import { Shell } from './components/layout/Shell.tsx';
import type { RouteKey } from './components/layout/Navbar.tsx';
import { OnboardingRoute } from './routes/OnboardingRoute.tsx';
import { ShareRoute } from './routes/ShareRoute.tsx';
import { AppsRoute } from './routes/AppsRoute.tsx';
import { DocsRoute } from './routes/DocsRoute.tsx';
import { CommunityRoute } from './routes/CommunityRoute.tsx';
import { getRouteFromPath, getPathForRoute } from './utils/router.ts';

export { getRouteFromPath, getPathForRoute };

export interface AppProps {
  initialRoute?: RouteKey;
}

export function AppContent({ initialRoute }: AppProps) {
  const [route, setRoute] = useState<RouteKey>(() => {
    if (initialRoute) return initialRoute;
    if (typeof window !== 'undefined') {
      return getRouteFromPath(window.location.pathname, window.location.hash);
    }
    return 'home';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const current = getRouteFromPath(window.location.pathname, window.location.hash);
      setRoute(current);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleNavigate = useCallback((newRoute: RouteKey) => {
    setRoute(newRoute);
    if (typeof window !== 'undefined') {
      const targetPath = getPathForRoute(newRoute);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ route: newRoute }, '', targetPath);
      }
    }
  }, []);

  return (
    <Shell currentRoute={route} onNavigate={handleNavigate}>
      {route === 'home' && <OnboardingRoute />}
      {route === 'share' && <ShareRoute />}
      {route === 'apps' && <AppsRoute />}
      {route === 'community' && <CommunityRoute />}
      {route === 'docs' && <DocsRoute />}
    </Shell>
  );
}

export default function App(props: AppProps) {
  return (
    <I18nProvider>
      <ConfigProvider>
        <AppContent {...props} />
      </ConfigProvider>
    </I18nProvider>
  );
}
