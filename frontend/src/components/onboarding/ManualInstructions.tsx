import { useI18n } from '../../i18n/index.tsx';

export interface ManualInstructionsProps {
  dcloginLink?: string;
}

// ponytail: copyable code box and static guidance cards; upgrade to interactive stepper if onboarding telemetry requested
export function ManualInstructions({ dcloginLink }: ManualInstructionsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 pt-4 border-t border-base-300">
      {dcloginLink && (
        <div className="space-y-1.5 text-start">
          <div className="flex items-center justify-between text-xs font-semibold text-base-content/80">
            <span>{t('index_manual_code_label')}</span>
            <span className="text-[10px] text-base-content/60 font-normal">({t('index_manual_select_hint')})</span>
          </div>
          <div
            className="p-3 text-xs font-mono bg-base-100/90 rounded-lg border border-base-300 break-all select-all cursor-text shadow-inner hover:border-primary/50 transition-colors"
            dir="ltr"
          >
            <bdi dir="ltr">{dcloginLink}</bdi>
          </div>
        </div>
      )}

      <div className="card bg-base-300/40 border border-base-300 p-4 rounded-lg text-start">
        <h4 className="text-xs font-semibold text-base-content mb-2">{t('index_manual_title')}</h4>
        <ol className="text-xs text-base-content/80 list-decimal list-inside space-y-1">
          <li>{t('index_manual_step1')}</li>
          <li>{t('index_manual_step2')}</li>
          <li>{t('index_manual_step3')}</li>
        </ol>
      </div>

      <div className="card bg-base-300/40 border border-base-300 p-4 rounded-lg text-start">
        <h4 className="text-xs font-semibold text-base-content mb-1">{t('index_ios_title')}</h4>
        <p className="text-xs font-mono bg-base-100 p-2 rounded border border-base-300 select-all text-start" dir="ltr">
          <bdi dir="ltr">{t('index_ios_path')}</bdi>
        </p>
      </div>
    </div>
  );
}
