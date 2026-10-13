import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/index.tsx';
import { service } from '../../services/index.ts';
import { SERVICE_CONFIG } from '../../services/config.ts';
import { generateQrSvgDataUri } from '../../utils/qr.ts';
import { generateRandomString, openDeltaChatUri } from '../../utils/dclogin.ts';
import { ManualInstructions } from './ManualInstructions.tsx';
import { AltchaWidget } from './AltchaWidget.tsx';
import type { CustomAccountResult } from '../../services/types.ts';

// ponytail: 2-step custom onboarding (personalize -> activate) with client Altcha PoW; upgrade to multi-factor if email recovery requested
export function CustomWizard() {
  const { t } = useI18n();
  const [step, setStep] = useState<number>(1);
  const [username, setUsername] = useState<string>('');
  const [domain, setDomain] = useState<string>(SERVICE_CONFIG.DOMAIN);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CustomAccountResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [notInstalled, setNotInstalled] = useState<boolean>(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;
    service.getConfig()
      .then((cfg) => {
        if (mounted && cfg?.domain) {
          setDomain(cfg.domain);
        }
      })
      .catch(() => {});

    return () => {
      cleanupRef.current?.();
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    const usernameRegex = /^[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$/i;
    const cleanUsername = username.trim();
    if (!usernameRegex.test(cleanUsername)) {
      return setError(t('validation_username_format'));
    }
    if (!altchaPayload) {
      return setError(t('altcha_verifying'));
    }

    setError(null);
    setLoading(true);

    try {
      const generatedPassword = generateRandomString(24);
      const data = await service.createCustomAccount({
        username: cleanUsername,
        password: generatedPassword,
        altcha_payload: altchaPayload,
      });
      setResult(data);
      setStep(2);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || t('error_create_account'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result || !result.dclogin_link) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(result.dclogin_link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenApp = () => {
    if (!result || !result.dclogin_link) return;
    cleanupRef.current?.();
    cleanupRef.current = openDeltaChatUri(result.dclogin_link, () => setNotInstalled(true));
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setUsername('');
    setAltchaPayload(null);
    setError(null);
    setCopied(false);
    setNotInstalled(false);
  };

  return (
    <div className="min-h-[360px] flex flex-col justify-between space-y-4">
      {/* 2-Step DaisyUI Steps Indicator */}
      <ul className="steps steps-horizontal w-full text-xs">
        <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>{t('step_1_personalize')}</li>
        <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>{t('step_2_activate')}</li>
      </ul>

      {error && <div className="alert alert-error text-xs py-2 rounded">{error}</div>}

      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control gap-1.5 text-start">
              <label className="label py-1 text-xs font-semibold text-base-content/80">
                <span>{t('wizard_username_label')}</span>
              </label>
              <div className="join w-full">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
                    if (error) setError(null);
                  }}
                  placeholder="yourname"
                  className="input input-bordered input-sm join-item flex-1 min-w-0 bg-base-100 text-start text-xs sm:text-sm"
                  dir="ltr"
                  required
                  autoComplete="off"
                />
                <span className="join-item px-2.5 sm:px-3 text-xs bg-base-300/60 text-base-content/70 border border-base-300 flex items-center justify-center shrink-0 select-none">
                  <bdi dir="ltr">@{domain}</bdi>
                </span>
              </div>
            </div>

            {/* Altcha Bot Protection */}
            <div className="space-y-1 text-start">
              <AltchaWidget
                onVerified={(payload) => {
                  setAltchaPayload(payload);
                  if (error) setError(null);
                }}
                autoVerify={true}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim() || !altchaPayload}
              className="btn btn-primary btn-sm w-full gap-2 shadow-sm"
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <span>{t('btn_submit')}</span>
              )}
            </button>
          </form>
        )}

        {step === 2 && result && (
          <div className="text-center space-y-4 py-2">
            <div className="badge badge-success text-white py-3 px-4 text-xs font-semibold">
              {t('wizard_success_badge')}
            </div>

            {result.dclogin_link && (
              <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl border border-base-300 flex items-center justify-center shadow-inner">
                <img
                  src={generateQrSvgDataUri(result.dclogin_link, 200)}
                  alt="DeltaChat Login QR"
                  width="200"
                  height="200"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <p className="text-xs text-base-content/70">
              <span className="font-semibold"><bdi dir="ltr">{result.email}</bdi></span>
            </p>

            {result.dclogin_link && (
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
            )}

            {notInstalled && (
              <div className="alert alert-warning text-xs py-2 rounded">
                <span>{t('index_dc_not_installed')}</span>
              </div>
            )}

            {result.dclogin_link && <ManualInstructions dcloginLink={result.dclogin_link} />}

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
    </div>
  );
}
