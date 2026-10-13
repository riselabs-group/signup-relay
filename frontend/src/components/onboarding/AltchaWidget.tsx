import { useState, useEffect } from 'react';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n/index.tsx';
import { service } from '../../services/index.ts';
import { solveAltcha } from '../../utils/altcha.ts';

export interface AltchaWidgetProps {
  onVerified: (payload: string) => void;
  autoVerify?: boolean;
}

export function AltchaWidget({ onVerified, autoVerify = true }: AltchaWidgetProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startVerification = async () => {
    setStatus('verifying');
    setErrorMessage(null);
    try {
      const challenge = await service.getAltchaChallenge();
      const payload = await solveAltcha(challenge);
      setStatus('verified');
      onVerified(payload);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setStatus('error');
      setErrorMessage(errorObj.message || t('altcha_failed'));
    }
  };

  useEffect(() => {
    if (autoVerify && status === 'idle') {
      const timer = setTimeout(() => {
        startVerification();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [autoVerify, status]);

  return (
    <div className="w-full card bg-base-100 border border-base-300 p-3 rounded-lg shadow-sm">
      <div className="flex items-center justify-between gap-3">
        {/* Verification Check / Action */}
        <div className="flex items-center gap-2.5 min-w-0">
          {status === 'verifying' && (
            <span className="loading loading-spinner loading-xs text-primary shrink-0" />
          )}

          {status === 'verified' && (
            <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}

          {status === 'error' && (
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
          )}

          {status === 'idle' && (
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm shrink-0"
              onChange={startVerification}
              aria-label={t('altcha_click_to_verify')}
            />
          )}

          <span className="text-xs font-medium text-base-content/80 truncate">
            {status === 'verifying' && t('altcha_verifying')}
            {status === 'verified' && t('altcha_verified')}
            {status === 'error' && (errorMessage || t('altcha_failed'))}
            {status === 'idle' && t('altcha_click_to_verify')}
          </span>
        </div>

        {/* Altcha Brand Badge */}
        <div className="flex items-center gap-1.5 shrink-0 text-base-content/50">
          <ShieldCheck className="w-4 h-4 text-primary/70" />
          <span className="text-[10px] font-bold tracking-wider uppercase">ALTCHA</span>
        </div>
      </div>

      {status === 'error' && (
        <div className="mt-2 pt-2 border-t border-base-200 flex justify-end">
          <button
            type="button"
            onClick={startVerification}
            className="btn btn-ghost btn-xs text-primary"
          >
            {t('altcha_failed')}
          </button>
        </div>
      )}
    </div>
  );
}
