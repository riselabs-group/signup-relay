import { Smartphone } from 'lucide-react';
import { sendXdcToChat } from '../../utils/webxdc.ts';
import { useI18n } from '../../i18n/index.tsx';
import type { WebxdcApp } from '../../services/types.ts';

export interface AppCardProps {
  app: WebxdcApp;
  onSelect: (app: WebxdcApp) => void;
}

export function AppCard({ app, onSelect }: AppCardProps) {
  const { t } = useI18n();

  return (
    <div className="card bg-base-200 border border-base-300 hover:border-primary/50 transition-colors p-4 flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-base-300 flex-shrink-0 flex items-center justify-center font-bold text-sm text-base-content/80">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-semibold truncate">{app.name}</h4>
            <span className="badge badge-xs badge-outline">{app.version}</span>
          </div>
          <p className="text-xs text-base-content/70 line-clamp-2 mt-1">{app.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between text-xs">
        <button onClick={() => onSelect(app)} className="btn btn-ghost btn-xs">
          {t('app_details')}
        </button>
        <button
          onClick={(e) => sendXdcToChat(e, app.download_url)}
          className="btn btn-primary btn-xs"
        >
          {t('app_add_to_chat')}
        </button>
      </div>
    </div>
  );
}
