import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useI18n } from '../../i18n/index.tsx';
import { copyToClipboard } from '../../utils/clipboard.ts';

export interface ManualInstructionsProps {
  dcloginLink?: string;
}

// ponytail: copyable code box with dedicated copy button, foolproof numbered steps, and dedicated iOS guide; upgrade to interactive stepper if onboarding telemetry requested
export function ManualInstructions({ dcloginLink }: ManualInstructionsProps) {
  const { t } = useI18n();
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = () => {
    if (!dcloginLink) return;
    copyToClipboard(dcloginLink).then((ok) => {
      if (ok) {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      }
    });
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(dcloginLink).catch(() => {});
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-base-300">
      {dcloginLink && (
        <div className="space-y-2 text-start">
          <div className="flex items-center justify-between text-xs font-semibold text-base-content/85">
            <span>{t('index_manual_code_label')}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`btn btn-xs gap-1.5 font-bold ${codeCopied ? 'btn-success text-white' : 'btn-primary'}`}
            >
              {codeCopied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{t('index_manual_copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{t('index_manual_copy_btn')}</span>
                </>
              )}
            </button>
          </div>
          <div
            className="p-3 text-xs font-mono bg-base-100 rounded-lg border border-base-300 break-all select-all cursor-text shadow-inner hover:border-primary/50 transition-colors"
            dir="ltr"
            title={t('index_manual_select_hint')}
          >
            <bdi dir="ltr">{dcloginLink}</bdi>
          </div>
        </div>
      )}

      {/* General Manual Instructions */}
      <div className="card bg-base-300/40 border border-base-300 p-4 rounded-lg text-start space-y-2.5">
        <h4 className="text-xs font-bold text-base-content leading-snug">{t('index_manual_title')}</h4>
        <ol className="text-xs text-base-content/85 list-decimal list-inside space-y-1.5 leading-relaxed">
          <li>
            <span>{t('index_manual_step1')} </span>
            <a
              href="https://delta.chat/download"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary inline-flex items-center gap-0.5 font-semibold"
            >
              <span>delta.chat</span>
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          </li>
          <li>{t('index_manual_step2')}</li>
          <li>{t('index_manual_step3')}</li>
          <li>{t('index_manual_step4')}</li>
          <li>{t('index_manual_step5')}</li>
        </ol>
      </div>

      {/* Dedicated iOS (iPhone) Instructions */}
      <div className="card bg-base-300/40 border border-base-300 p-4 rounded-lg text-start space-y-2.5">
        <h4 className="text-xs font-bold text-base-content">{t('index_ios_title')}</h4>
        <p className="text-xs text-base-content/80 leading-relaxed">{t('index_ios_desc')}</p>
        <ol className="text-xs text-base-content/85 list-decimal list-inside space-y-1.5 leading-relaxed">
          <li>{t('index_ios_step1')}</li>
          <li>{t('index_ios_step2')}</li>
          <li>{t('index_ios_step3')}</li>
          <li>{t('index_ios_step4')}</li>
          <li>{t('index_ios_step5')}</li>
        </ol>
        <p className="text-xs font-mono bg-base-100 p-2 rounded border border-base-300 select-all text-start" dir="ltr">
          <bdi dir="ltr">{t('index_ios_path')}</bdi>
        </p>
      </div>
    </div>
  );
}
