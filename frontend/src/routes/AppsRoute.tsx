import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useI18n } from '../i18n/index.tsx';
import { service } from '../services/index.ts';
import { AppCard } from '../components/apps/AppCard.tsx';
import { AppModal } from '../components/apps/AppModal.tsx';
import type { WebxdcApp } from '../services/types.ts';

// ponytail: client-side search filtering; upgrade to paginated server-side query if app catalog grows beyond 100
export function AppsRoute() {
  const { t } = useI18n();
  const [apps, setApps] = useState<WebxdcApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<WebxdcApp | null>(null);

  useEffect(() => {
    let mounted = true;
    service
      .getApps()
      .then((data) => {
        if (!mounted) return;
        setApps(data?.apps || []);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setApps([]);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = apps.filter(
    (a) =>
      (a.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Security Advisory Box */}
      <div className="alert alert-warning text-xs rounded-lg border border-warning/30 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-warning" />
        <div>
          <h4 className="font-bold mb-1">{t('apps_security_title')}</h4>
          <p>{t('apps_security_desc')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <h2 className="text-lg font-bold">{t('apps_title')}</h2>
          <p className="text-xs text-base-content/70">{t('apps_subtitle')}</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('apps_search_placeholder')}
          className="input input-bordered input-sm bg-base-100 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 text-sm">
          <p>{t('apps_no_results')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <AppCard key={app.app_id} app={app} onSelect={setSelectedApp} />
          ))}
        </div>
      )}

      <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />
    </div>
  );
}
