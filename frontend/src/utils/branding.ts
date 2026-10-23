import type { ServerConfig, LinkItem, DownloadLinkItem } from '../services/types.ts';
import { sanitizeImageUrl } from './security.ts';

// ponytail: fallback constants for MailiaM platform branding; upgrade to tenant config map if multi-tenant hosting introduced
export function getPlatformName(cfg?: ServerConfig | null, lang: string = 'fa'): string {
  if (lang === 'fa') {
    return cfg?.platform_name?.fa?.trim() || 'میلیم';
  }
  return cfg?.platform_name?.en?.trim() || 'MailiaM';
}

export function getLocalizedTitle(item: Pick<LinkItem, 'title' | 'title_fa'>, lang: string = 'fa'): string {
  if (lang === 'fa' && item.title_fa?.trim()) {
    return item.title_fa.trim();
  }
  return item.title.trim();
}

export function getPlatformLogo(cfg?: ServerConfig | null): string {
  const safeImg = sanitizeImageUrl(cfg?.platform_image_url);
  if (safeImg) return safeImg;
  const safeIcon = sanitizeImageUrl(cfg?.platform_icon);
  if (safeIcon) return safeIcon;
  return './logo.svg';
}

export function getPlatformFavicon(cfg?: ServerConfig | null): string {
  const safeIcon = sanitizeImageUrl(cfg?.platform_icon);
  if (safeIcon) return safeIcon;
  const safeImg = sanitizeImageUrl(cfg?.platform_image_url);
  if (safeImg) return safeImg;
  return './logo.svg';
}

export const DEFAULT_DOWNLOAD_LINKS: DownloadLinkItem[] = [
  {
    id: 'dl_direct_apk',
    title: 'Android Direct APK',
    title_fa: 'دانلود مستقیم APK اندروید',
    link: 'https://download.delta.chat/android/deltachat-gplay-release.apk',
    is_direct: true,
    icon: 'android',
  },
  {
    id: 'dl_google_play',
    title: 'Google Play Store',
    title_fa: 'گوگل پلی استور',
    link: 'https://play.google.com/store/apps/details?id=chat.delta',
    is_direct: false,
    icon: 'google-play',
  },
  {
    id: 'dl_fdroid',
    title: 'F-Droid',
    title_fa: 'اف-دروید',
    link: 'https://f-droid.org/packages/chat.delta/',
    is_direct: false,
    icon: 'f-droid',
  },
  {
    id: 'dl_apple',
    title: 'Apple App Store',
    title_fa: 'اپ استور اپل',
    link: 'https://apps.apple.com/app/delta-chat/id1459523234',
    is_direct: false,
    icon: 'apple',
  },
  {
    id: 'dl_desktop',
    title: 'Desktop (Win/Mac/Linux)',
    title_fa: 'نسخه دسکتاپ',
    link: 'https://delta.chat/download',
    is_direct: true,
    icon: 'desktop',
  },
];

export function sortDownloadLinks(links: DownloadLinkItem[], lang: string): DownloadLinkItem[] {
  if (lang !== 'fa') return [...links];
  return [...links].sort((a, b) => {
    const aIsDirect = a.is_direct ? 2 : 0;
    const bIsDirect = b.is_direct ? 2 : 0;
    const aIsApk = /apk/i.test((a.link || '') + ' ' + (a.title || '')) ? 1 : 0;
    const bIsApk = /apk/i.test((b.link || '') + ' ' + (b.title || '')) ? 1 : 0;
    const aScore = aIsDirect + aIsApk;
    const bScore = bIsDirect + bIsApk;
    return bScore - aScore;
  });
}
