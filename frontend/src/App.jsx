import React, { useState } from 'react';
import { I18nProvider } from './i18n/index.jsx';
import { Shell } from './components/layout/Shell.jsx';
import { OnboardingRoute } from './routes/OnboardingRoute.jsx';
import { ShareRoute } from './routes/ShareRoute.jsx';
import { AppsRoute } from './routes/AppsRoute.jsx';
import { DocsRoute } from './routes/DocsRoute.jsx';

export function AppContent() {
  const [route, setRoute] = useState('home');

  return (
    <Shell currentRoute={route} onNavigate={setRoute}>
      {route === 'home' && <OnboardingRoute />}
      {route === 'share' && <ShareRoute />}
      {route === 'apps' && <AppsRoute />}
      {route === 'docs' && <DocsRoute />}
    </Shell>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
