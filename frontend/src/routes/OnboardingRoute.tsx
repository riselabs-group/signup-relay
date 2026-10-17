import { useState, useEffect } from 'react';
import { ShieldCheck, Globe, Zap, Sparkles, UserPlus, Video, HardDrive, Layers } from 'lucide-react';
import { useI18n } from '../i18n/index.tsx';
import { service } from '../services/index.ts';
import type { ServerConfig } from '../services/types.ts';
import { InstantQrCard } from '../components/onboarding/InstantQrCard.tsx';
import { CustomWizard } from '../components/onboarding/CustomWizard.tsx';

export type OnboardingTab = 'instant' | 'custom';

// ponytail: single landing route composing hero with cta, feature cards, and bottom account setup; upgrade to nested routes if deeplinking to tabs needed
export function OnboardingRoute() {
  const { t } = useI18n();
  const [tab, setTab] = useState<OnboardingTab>('instant');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [config, setConfig] = useState<ServerConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    service.getConfig()
      .then((cfg) => {
        if (!mounted) return;
        setConfig(cfg);
        setIsOnline(Boolean(cfg?.registration_open));
      })
      .catch(() => {
        if (!mounted) return;
        setIsOnline(false);
      });
    return () => { mounted = false; };
  }, []);

  const scrollToSetup = () => {
    const el = document.getElementById('account-setup');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. Hero Section */}
      <section className="hero min-h-[380px] sm:min-h-[420px] w-full max-w-5xl rounded-box border border-base-300 bg-base-200/50 shadow-sm my-4 sm:my-6">
        <div className="hero-content text-center py-10 px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm mb-4">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{t('app_title')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-base-content mb-4">
              {t('hero_headline')}
            </h1>

            <p className="text-sm sm:text-base text-base-content/75 max-w-xl mx-auto leading-relaxed mb-6">
              {t('hero_subheadline')}
            </p>

            {/* Hero Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-xs text-base-content/85 font-medium">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-200/90 border border-base-300 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>{t('hero_tag_e2e')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-200/90 border border-base-300 backdrop-blur-sm">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <span>{t('hero_tag_notracking')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-200/90 border border-base-300 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span>{t('hero_tag_federated')}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={scrollToSetup}
                className="btn btn-primary btn-md gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('hero_cta_create_account')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Feature Cards (Icon, Title, Description) */}
      <section className="w-full max-w-5xl mx-auto my-6 sm:my-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-base-200/60 backdrop-blur-md border border-base-300/60 p-5 rounded-box shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-base-content mb-1.5">{t('card_calls_title')}</h3>
            <p className="text-xs text-base-content/70 leading-relaxed">{t('card_calls_desc')}</p>
          </div>

          <div className="card bg-base-200/60 backdrop-blur-md border border-base-300/60 p-5 rounded-box shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-base-content mb-1.5">{t('card_storage_title')}</h3>
            <p className="text-xs text-base-content/70 leading-relaxed">{t('card_storage_desc')}</p>
          </div>

          <div className="card bg-base-200/60 backdrop-blur-md border border-base-300/60 p-5 rounded-box shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-base-content mb-1.5">{t('card_security_title')}</h3>
            <p className="text-xs text-base-content/70 leading-relaxed">{t('card_security_desc')}</p>
          </div>

          <div className="card bg-base-200/60 backdrop-blur-md border border-base-300/60 p-5 rounded-box shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-base-content mb-1.5">{t('card_focus_title')}</h3>
            <p className="text-xs text-base-content/70 leading-relaxed">{t('card_focus_desc')}</p>
          </div>
        </div>
      </section>

      {/* 3. Account Creation Setup Card (At Bottom of Main Page) */}
      <section id="account-setup" className="w-full max-w-md mx-auto my-8 sm:my-10 px-4 scroll-mt-20">
        <div className="card bg-base-200/90 backdrop-blur-md border border-base-300 shadow-xl rounded-box">
          <div className="card-body p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-base-300">
              <div>
                <h2 className="card-title text-base font-bold">{t('index_title')}</h2>
                <p className="text-xs text-base-content/70">{t('index_subtitle')}</p>
              </div>
              {isOnline ? (
                <span className="badge badge-success badge-sm gap-1.5 font-medium text-white shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{t('status_online')}</span>
                </span>
              ) : (
                <span className="badge badge-error badge-sm gap-1.5 font-medium text-white shadow-sm">
                  <span>{t('status_offline')}</span>
                </span>
              )}
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
              {tab === 'instant' ? <InstantQrCard config={config} /> : <CustomWizard config={config} />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
