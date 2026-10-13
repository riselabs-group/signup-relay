import { sendXdcToChat } from '../../utils/webxdc.ts';
import { useI18n } from '../../i18n/index.tsx';
import type { WebxdcApp } from '../../services/types.ts';

export interface AppModalProps {
  app: WebxdcApp | null;
  onClose: () => void;
}

// ponytail: native daisyui modal; upgrade to accessible dialog polyfill if legacy browsers needed
export function AppModal({ app, onClose }: AppModalProps) {
  const { t } = useI18n();
  if (!app) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-sm">
          {app.name} ({app.version})
        </h3>
        <p className="py-4 text-xs text-base-content/80 whitespace-pre-line">{app.description}</p>
        <div className="modal-action">
          <button
            onClick={(e) => sendXdcToChat(e, app.download_url)}
            className="btn btn-primary btn-sm"
          >
            {t('app_add_to_chat')}
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            {t('app_close')}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
