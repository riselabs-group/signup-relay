import { SERVICE_CONFIG } from './config.ts';
import type {
  IService,
  ServerConfig,
  AltchaChallenge,
  InstantAccountPayload,
  InstantAccountResult,
  CustomAccountPayload,
  CustomAccountResult,
  WebxdcCatalog,
} from './types.ts';

export const mockService: IService = {
  async getConfig(): Promise<ServerConfig> {
    return {
      domain: SERVICE_CONFIG.DOMAIN,
      registration_open: true,
      instant_accounts_enabled: true,
      custom_accounts_enabled: true,
      instant_prefix_enabled: true,
      instant_prefix: 'dc_',
      custom_prefix_enabled: false,
      custom_prefix: '',
      password_hash_algorithm: 'argon2id',
      certificate_checks: '1',
      endpoints: {
        imap: { host: `mail.${SERVICE_CONFIG.DOMAIN}`, port: 993, security: 'ssl' },
        smtp: { host: `mail.${SERVICE_CONFIG.DOMAIN}`, port: 465, security: 'ssl' },
      },
      altcha: { required: true, max_number: 10000 },
      platform_name: {
        en: 'MailiaM',
        fa: 'میلیم',
      },
      platform_icon: './logo.svg',
      platform_image_url: './logo.svg',
      admin_contacts: [
        {
          id: 'contact_tg',
          title: 'Telegram Channel',
          title_fa: 'کانال تلگرام',
          link: 'https://t.me/mailiam_relay',
          icon: 'telegram',
        },
        {
          id: 'contact_matrix',
          title: 'Matrix Room',
          title_fa: 'اتاق ماتریکس',
          link: 'https://matrix.to/#/#mailiam:matrix.org',
          icon: 'matrix',
        },
        {
          id: 'contact_support_email',
          title: 'Support Email',
          title_fa: 'ایمیل پشتیبانی',
          link: `mailto:support@${SERVICE_CONFIG.DOMAIN}`,
          icon: 'mail',
        },
      ],
      donation_links: [
        {
          id: 'donate_btc',
          title: 'Bitcoin (BTC)',
          title_fa: 'بیت‌کوین (BTC)',
          link: 'bc1q9x3d8y2vgjhf6k684lcmj24v64a27mepm66s74',
          icon: 'bitcoin',
        },
        {
          id: 'donate_xmr',
          title: 'Monero (XMR)',
          title_fa: 'مونرو (XMR)',
          link: '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkFxbANsAnJYPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H',
          icon: 'monero',
        },
        {
          id: 'donate_usdt',
          title: 'Tether (USDT-TRC20)',
          title_fa: 'تتر (TRC20)',
          link: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          icon: 'dollar',
        },
      ],
      download_links: [
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
          id: 'dl_apple_appstore',
          title: 'Apple App Store',
          title_fa: 'اپ استور اپل',
          link: 'https://apps.apple.com/app/delta-chat/id1459523234',
          is_direct: false,
          icon: 'apple',
        },
        {
          id: 'dl_desktop_direct',
          title: 'Desktop (Win/Mac/Linux)',
          title_fa: 'نسخه دسکتاپ (مستقیم)',
          link: 'https://delta.chat/download',
          is_direct: true,
          icon: 'desktop',
        },
      ],
    };
  },

  async getAltchaChallenge(): Promise<AltchaChallenge> {
    return {
      algorithm: 'SHA-256',
      challenge: 'mock_challenge_' + Math.random().toString(36).substring(2),
      salt: Date.now() + ':mock_salt',
      signature: 'mock_signature',
      max_number: 10000,
    };
  },

  async createInstantAccount(payload: InstantAccountPayload): Promise<InstantAccountResult> {
    const username = payload?.username;
    const email = `${username}@${SERVICE_CONFIG.DOMAIN}`;
    return {
      account_id: `mock_inst_${username}`,
      email,
      account_type: 'instant',
    };
  },

  async createCustomAccount(payload: CustomAccountPayload): Promise<CustomAccountResult> {
    const { username } = payload;
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    return {
      account_id: `mock_cust_${username}`,
      email: `${username}@${SERVICE_CONFIG.DOMAIN}`,
      account_type: 'custom',
    };
  },

  async getApps(): Promise<WebxdcCatalog> {
    return {
      apps: [
        {
          app_id: 'chat.delta.webxdc.chess',
          name: 'Chess WebXDC',
          version: '1.4.2',
          description: 'Play chess with your contacts directly inside DeltaChat.',
          size: 420000,
          download_url: '/apps/xdcstore/packages/chess.xdc',
          icon_url: '/apps/xdcstore/icons/chess.png',
        },
      ],
    };
  },
};
