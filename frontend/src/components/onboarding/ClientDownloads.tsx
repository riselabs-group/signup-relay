import { useMemo } from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  Globe,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '../../i18n/index.tsx';
import { useServerConfig } from '../../services/ConfigContext.tsx';
import {
  getLocalizedTitle,
  sortDownloadLinks,
  DEFAULT_DOWNLOAD_LINKS,
} from '../../utils/branding.ts';
import { sanitizeWebUrl, sanitizeImageUrl } from '../../utils/security.ts';
import type { DownloadLinkItem } from '../../services/types.ts';

export { sortDownloadLinks, DEFAULT_DOWNLOAD_LINKS };
export type { DownloadLinkItem };

function resolveBrandIcon(iconName?: string, link?: string, title?: string) {
  const text = `${iconName || ''} ${link || ''} ${title || ''}`.toLowerCase();
  if (text.includes('apple') || text.includes('ios') || text.includes('mac')) return Apple;
  if (text.includes('desktop') || text.includes('windows') || text.includes('linux')) return Monitor;
  if (text.includes('android') || text.includes('apk') || text.includes('fdroid') || text.includes('play')) {
    return Smartphone;
  }
  if (text.includes('direct') || text.includes('مستقیم')) return Download;
  return Globe;
}

// ponytail: static fallback links if server config omits download_links; upgrade to dynamic release manifest if automated binary versioning needed
export function ClientDownloads() {
  const { lang, t } = useI18n();
  const config = useServerConfig();

  const sortedLinks = useMemo(() => {
    const raw = (config?.download_links && config.download_links.length > 0)
      ? config.download_links
      : DEFAULT_DOWNLOAD_LINKS;
    return sortDownloadLinks(raw, lang);
  }, [config?.download_links, lang]);

  return (
    <section className="w-full max-w-5xl mx-auto my-6 sm:my-8 px-4" aria-label={t('downloads_title')}>
      <div className="text-center mb-5">
        <h3 className="text-base sm:text-lg font-bold text-base-content flex items-center justify-center gap-2">
          <Download className="w-4 h-4 text-primary shrink-0" />
          <span>{t('downloads_title')}</span>
        </h3>
        <p className="text-xs text-base-content/70 mt-1 max-w-xl mx-auto leading-relaxed">
          {t('downloads_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sortedLinks.map((item, idx) => {
          const safeLink = sanitizeWebUrl(item.link);
          const safeImage = sanitizeImageUrl(item.image_url);
          const safeIconUrl = sanitizeImageUrl(item.icon);
          const localizedTitle = getLocalizedTitle(item, lang);
          const FallbackIcon = resolveBrandIcon(item.icon, item.link, item.title);

          if (!safeLink) return null;

          return (
            <a
              key={item.id || item.link || idx}
              href={safeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="card bg-base-200/70 hover:bg-base-200 border border-base-300 p-4 rounded-xl flex flex-col items-center justify-between text-center gap-2.5 group transition-all duration-200 hover:scale-[1.02] shadow-sm relative overflow-hidden"
            >
              {/* Direct Server Download Badge */}
              {item.is_direct && (
                <div className="w-full flex justify-center">
                  <span className="badge badge-success badge-xs py-2 px-2 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t('download_direct_badge')}</span>
                  </span>
                </div>
              )}

              {/* Order: 1. Image on top */}
              {safeImage && (
                <div className="w-12 h-12 max-h-12 flex items-center justify-center rounded-lg bg-base-100 p-1 border border-base-300/60 shadow-inner shrink-0">
                  <img
                    src={safeImage}
                    alt={localizedTitle}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Order: 2. Icon shown */}
              {safeIconUrl ? (
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 p-1">
                  <img
                    src={safeIconUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-content transition-colors shrink-0">
                  <FallbackIcon className="w-4 h-4" />
                </div>
              )}

              {/* Order: 3. Text title shown */}
              <div className="w-full flex items-center justify-center gap-1 mt-auto pt-1">
                <span className="text-xs font-bold text-base-content line-clamp-1">
                  {localizedTitle}
                </span>
                <ExternalLink className="w-3 h-3 text-base-content/40 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
