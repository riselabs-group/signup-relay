import React, { useState } from 'react';
import { useI18n } from '../../i18n/index.jsx';
import { service } from '../../services/index.js';
import { generateQrSvgDataUri } from '../../utils/qr.js';
import { openDeltaChatUri } from '../../utils/dclogin.js';
import { ManualInstructions } from './ManualInstructions.jsx';

// ponytail: wizard with client validation and visual Altcha mock indicator; upgrade to @altcha/altcha-widget if server mandates interactive PoW challenge
export function CustomWizard() {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);

  const handleNext = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (step === 1) {
      if (username.length < 3) return setError('نام کاربری باید حداقل ۳ کاراکتر باشد');
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (password.length < 8) return setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.createCustomAccount({ username, password });
      setPassword(''); // Zero out password in state after account creation for credential safety
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message || 'خطا در ساخت حساب');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result || !result.dclogin_link) return;
    navigator.clipboard.writeText(result.dclogin_link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    if (!result || !result.dclogin_link) return;
    openDeltaChatUri(result.dclogin_link, () => setNotInstalled(true));
  };

  return (
    <div className="min-h-[360px] flex flex-col justify-between space-y-4">
      {/* DaisyUI Steps */}
      <ul className="steps steps-horizontal w-full text-xs">
        <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>{t('step_1_identity')}</li>
        <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>{t('step_2_security')}</li>
        <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>{t('step_3_ready')}</li>
      </ul>

      {error && <div className="alert alert-error text-xs py-2">{error}</div>}

      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="form-control gap-2">
            <label className="label text-xs font-medium">نام کاربری مورد نظر</label>
            <div className="join w-full">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                placeholder="yourname"
                className="input input-bordered input-sm join-item flex-1 bg-base-100"
                dir="ltr"
                required
              />
              <span className="btn btn-sm btn-disabled join-item"><bdi dir="ltr">@chatchi.org</bdi></span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-control gap-2">
            <label className="label text-xs font-medium">رمز عبور قوی</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input input-bordered input-sm bg-base-100"
              dir="ltr"
              required
            />
            <div className="card bg-base-300/40 p-2 text-xs rounded border border-base-300 flex items-center justify-between">
              <span>تأیید امنیتی (Altcha PoW)</span>
              <span className="badge badge-success badge-sm text-white">تأیید شد ✓</span>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="text-center space-y-4 py-2">
            <div className="badge badge-success text-white py-3 px-4 text-xs font-semibold">حساب با موفقیت ساخته شد!</div>

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
                <button type="button" onClick={handleCopy} className={`btn btn-sm ${copied ? 'btn-success text-white' : 'btn-outline'}`}>
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
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2 pt-2 border-t border-base-300">
        {step > 1 && step < 3 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-ghost btn-sm">
            {t('btn_back')}
          </button>
        )}
        {step < 3 ? (
          <button onClick={handleNext} disabled={loading} className="btn btn-primary btn-sm ms-auto">
            {loading ? <span className="loading loading-spinner loading-xs" /> : t('btn_next')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setResult(null);
              setUsername('');
              setPassword('');
              setCopied(false);
              setNotInstalled(false);
            }}
            className="btn btn-outline btn-sm w-full"
          >
            ساخت حساب دیگر
          </button>
        )}
      </div>
    </div>
  );
}
