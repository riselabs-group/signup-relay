import React, { useState, useEffect } from 'react';
import { service } from '../services/index.js';
import { AppCard } from '../components/apps/AppCard.jsx';
import { AppModal } from '../components/apps/AppModal.jsx';

// ponytail: client-side search filtering; upgrade to paginated server-side query if app catalog grows beyond 100
export function AppsRoute() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    service.getApps().then((data) => {
      setApps(data?.apps || []);
      setLoading(false);
    }).catch(() => {
      setApps([]);
      setLoading(false);
    });
  }, []);

  const filtered = apps.filter(
    (a) =>
      (a.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Security Advisory Box */}
      <div className="alert alert-warning text-xs rounded-lg border border-warning/30 p-4">
        <div>
          <h4 className="font-bold mb-1">⚠️ نکات امنیتی برنامه‌های WebXDC</h4>
          <p>
            فایل‌های WebXDC کدهای نرم‌افزاری هستند که در محیط امن درون دستگاه اجرا می‌شوند.
            فقط برنامه‌های منابع معتبر را باز کنید و هرگز فایل‌های ناشناس را در چت اجرا نکنید.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <h2 className="text-lg font-bold">فروشگاه برنامه‌های WebXDC</h2>
          <p className="text-xs text-base-content/70">مینی‌اپ‌های مستقل برای اجرا درون گفتگوهای دلتاچت</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی برنامه..."
          className="input input-bordered input-sm bg-base-100 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 w-full rounded-lg" />
          ))}
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
