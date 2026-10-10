import React, { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { InstantQrCard } from '../components/onboarding/InstantQrCard.jsx';
import { CustomWizard } from '../components/onboarding/CustomWizard.jsx';

// ponytail: two-tab onboarding route with fixed-height container; upgrade to react-router nested routes if URL-based deeplinking to tabs needed
export function OnboardingRoute() {
  const { t } = useI18n();
  const [tab, setTab] = useState('instant');

  return (
    <div className="max-w-md mx-auto card bg-base-200 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div>
            <h2 className="card-title text-base font-bold">{t('index_title')}</h2>
            <p className="text-xs text-base-content/70">{t('index_subtitle')}</p>
          </div>
          <span className="badge badge-primary badge-sm">DeltaChat</span>
        </div>

        <div role="tablist" className="tabs tabs-boxed bg-base-300/50 p-1 my-3">
          <button
            role="tab"
            className={`tab tab-sm flex-1 ${tab === 'instant' ? 'tab-active' : ''}`}
            onClick={() => setTab('instant')}
          >
            {t('tab_instant')}
          </button>
          <button
            role="tab"
            className={`tab tab-sm flex-1 ${tab === 'custom' ? 'tab-active' : ''}`}
            onClick={() => setTab('custom')}
          >
            {t('tab_custom')}
          </button>
        </div>

        <div className="min-h-[380px]">
          {tab === 'instant' ? <InstantQrCard /> : <CustomWizard />}
        </div>
      </div>
    </div>
  );
}
