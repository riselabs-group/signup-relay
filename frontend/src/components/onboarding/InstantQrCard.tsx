import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/index.tsx';
import { service } from '../../services/index.ts';
import type { ServerConfig } from '../../services/types.ts';
import { generateInstantUsername, openDeltaChatUri } from '../../utils/dclogin.ts';
import { altchaRequired, apiErrorKey, canSignup, createAccountWithQr, signupErrorKey } from '../../utils/account.ts';
import { copyToClipboard } from '../../utils/clipboard.ts';
import { generateQrSvgDataUri } from '../../utils/qr.ts';
import { ManualInstructions } from './ManualInstructions.tsx';
import { AltchaWidget } from './AltchaWidget.tsx';

type InstantAccountState = {
  email: string;
  dclogin_link: string;
  account_type: 'instant';
};

function blockMsg(config: ServerConfig | null, t: (k: string) => string): string | null {
  if (!config) return null;
  const key = signupErrorKey(config, config.instant_accounts_enabled !== false);
  return key ? t(key) : null;
}

// ponytail: in-memory state for ephemeral QR; upgrade to persistent local storage if tab-recovery needed
export function InstantQrCard({ config }: { config: ServerConfig | null }) {
  const { t } = useI18n();
  const [account, setAccount] = useState<InstantAccountState | null>(null);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [notInstalled, setNotInstalled] = useState<boolean>(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const ready = !!config && canSignup(config) && config.instant_accounts_enabled !== false;
  const needAltcha = !!config && altchaRequired(config);
  const shownError = error || blockMsg(config, t);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const handleGenerate = async () => {
    if (!config || !ready) return;
    if (needAltcha && !altchaPayload) return;
    setLoading(true);
    setError(null);
    setNotInstalled(false);
    try {
      const data = await createAccountWithQr({
        config,
        username: generateInstantUsername(config),
        altchaPayload,
        create: (payload) => service.createInstantAccount(payload),
      });
      setAccount({ email: data.email, dclogin_link: data.dclogin_link, account_type: 'instant' });
    } catch (err: unknown) {
      setError(t(apiErrorKey(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAccount(null);
    setAltchaPayload(null);
    setError(null);
    setCopied(false);
    setNotInstalled(false);
  };

  const handleCopy = () => {
    if (!account) return;
    copyToClipboard(account.dclogin_link).then((ok) => {
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(account.dclogin_link).catch(() => {});
    }
  };

  const handleOpenApp = () => {
    if (!account) return;
    cleanupRef.current?.();
    cleanupRef.current = openDeltaChatUri(account.dclogin_link, () => setNotInstalled(true));
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {!account ? (
        <div className="w-full max-w-xs space-y-3 py-6">
          {shownError && <div className="alert alert-error text-xs py-2 rounded text-start">{shownError}</div>}

          {needAltcha && (
            <AltchaWidget
              onVerified={(payload) => {
                setAltchaPayload(payload);
                if (error && ready) setError(null);
              }}
              autoVerify={true}
            />
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !ready || (needAltcha && !altchaPayload)}
            className="btn btn-primary btn-md w-full shadow"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : t('index_generate')}
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* Locked dimension QR Slot (224px / 14rem) eliminates CLS */}
          <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl border border-base-300 flex items-center justify-center shadow-inner">
            <img
              src={generateQrSvgDataUri(account.dclogin_link, 200)}
              alt="DeltaChat Login QR"
              width="200"
              height="200"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-xs text-base-content/70">
            <span className="font-semibold"><bdi dir="ltr">{account.email}</bdi></span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={handleOpenApp} className="btn btn-primary btn-sm">
              {t('index_open_dc')}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`btn btn-sm ${copied ? 'btn-success text-white' : 'btn-outline'}`}
            >
              {copied ? t('index_copied') : t('index_copy_link')}
            </button>
          </div>

          {notInstalled && (
            <div className="alert alert-warning text-xs py-2 rounded">
              <span>{t('index_dc_not_installed')}</span>
            </div>
          )}

          <ManualInstructions dcloginLink={account.dclogin_link} />

          <div className="pt-2 border-t border-base-300">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline btn-sm w-full"
            >
              {t('wizard_reset_btn')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
