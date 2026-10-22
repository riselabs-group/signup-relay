import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '../../i18n/index.tsx';
import { service } from '../../services/index.ts';
import { SERVICE_CONFIG } from '../../services/config.ts';
import type { ServerConfig } from '../../services/types.ts';
import { generateQrSvgDataUri } from '../../utils/qr.ts';
import { openDeltaChatUri } from '../../utils/dclogin.ts';
import { copyToClipboard } from '../../utils/clipboard.ts';
import { altchaRequired, apiErrorKey, canSignup, createAccountWithQr, signupErrorKey, validateCustomPassword, validateCustomUsername } from '../../utils/account.ts';
import { ManualInstructions } from './ManualInstructions.tsx';
import { AltchaWidget } from './AltchaWidget.tsx';

type CustomAccountState = {
  email: string;
  dclogin_link: string;
  account_type: 'custom';
};

function blockMsg(config: ServerConfig | null, t: (k: string) => string): string | null {
  if (!config) return null;
  const key = signupErrorKey(config, config.custom_accounts_enabled !== false, 'custom');
  return key ? t(key) : null;
}

function usernameErrorKey(code: ReturnType<typeof validateCustomUsername>): string | null {
  if (code === 'ok') return null;
  if (code === 'dc_prefix') return 'validation_username_dc_prefix';
  if (code === 'reserved') return 'validation_username_reserved';
  if (code === 'length') return 'validation_username_length';
  if (code === 'dots') return 'validation_username_dots';
  return 'validation_username_chars';
}

function passwordErrorKey(code: ReturnType<typeof validateCustomPassword>): string | null {
  if (code === 'ok') return null;
  return `validation_password_${code}`;
}

// ponytail: 2-step custom onboarding (personalize -> activate) with client Altcha PoW; upgrade to multi-factor if email recovery requested
export function CustomWizard({ config }: { config: ServerConfig | null }) {
  const { t } = useI18n();
  const [step, setStep] = useState<number>(1);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<CustomAccountState | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [notInstalled, setNotInstalled] = useState<boolean>(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const ready = !!config && canSignup(config) && config.custom_accounts_enabled !== false;
  const needAltcha = !!config && altchaRequired(config);
  const domain = config?.domain || SERVICE_CONFIG.DOMAIN;
  const hasCustomPrefix = Boolean(config?.custom_prefix_enabled && config.custom_prefix);
  const customPrefix = hasCustomPrefix ? (config?.custom_prefix ?? '') : '';
  const shownError = error || blockMsg(config, t);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!config || !ready) return;

    const cleanSuffix = username.trim();
    if (!cleanSuffix) return setError(t('validation_username_length'));
    const fullUsername = `${customPrefix}${cleanSuffix}`;
    const usernameErr = usernameErrorKey(validateCustomUsername(fullUsername, config));
    if (usernameErr) return setError(t(usernameErr));
    if (password) {
      const pwErr = passwordErrorKey(validateCustomPassword(password, fullUsername));
      if (pwErr) return setError(t(pwErr));
    }
    if (needAltcha && !altchaPayload) return setError(t('altcha_verifying'));

    setError(null);
    setLoading(true);

    try {
      const data = await createAccountWithQr({
        config,
        username: fullUsername,
        password: password || undefined,
        altchaPayload,
        create: (payload) => service.createCustomAccount(payload),
      });
      setAccount({ email: data.email, dclogin_link: data.dclogin_link, account_type: 'custom' });
      setStep(2);
    } catch (err: unknown) {
      setError(t(apiErrorKey(err)));
    } finally {
      setLoading(false);
    }
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

  const handleReset = () => {
    setStep(1);
    setAccount(null);
    setUsername('');
    setPassword('');
    setShowPassword(false);
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

      {shownError && <div className="alert alert-error text-xs py-2 rounded">{shownError}</div>}

      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control gap-1.5 text-start">
              <label className="label py-1 text-xs font-semibold text-base-content/80">
                <span>{t('wizard_username_label')}</span>
              </label>
              <div className="join w-full" dir="ltr">
                {hasCustomPrefix && (
                  <span className="join-item px-2.5 sm:px-3 text-xs bg-base-300/60 text-base-content/70 border border-base-300 flex items-center justify-center shrink-0 select-none">
                    <bdi dir="ltr">{customPrefix}</bdi>
                  </span>
                )}
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._+-]/g, ''));
                    if (error && ready) setError(null);
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

            <div className="form-control gap-1.5 text-start">
              <label className="label py-1 text-xs font-semibold text-base-content/80">
                <span>{t('wizard_password_label')}</span>
              </label>
              <div className="join w-full" dir="ltr">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error && ready) setError(null);
                  }}
                  placeholder={t('wizard_password_optional')}
                  className="input input-bordered input-sm join-item flex-1 min-w-0 bg-base-100 text-start text-xs sm:text-sm"
                  dir="ltr"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-sm join-item btn-square"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('wizard_password_hide') : t('wizard_password_show')}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {needAltcha && (
              <div className="space-y-1 text-start">
                <AltchaWidget
                  onVerified={(payload) => {
                    setAltchaPayload(payload);
                    if (error && ready) setError(null);
                  }}
                  autoVerify={true}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !ready || (needAltcha && !altchaPayload)}
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

        {step === 2 && account && (
          <div className="text-center space-y-4 py-2">
            <div className="badge badge-success text-white py-3 px-4 text-xs font-semibold">
              {t('wizard_success_badge')}
            </div>

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
    </div>
  );
}
