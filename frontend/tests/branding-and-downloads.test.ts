import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPlatformName,
  getLocalizedTitle,
  getPlatformLogo,
  getPlatformFavicon,
  sortDownloadLinks,
  DEFAULT_DOWNLOAD_LINKS,
} from '../src/utils/branding.ts';
import {
  sanitizeWebUrl,
  sanitizeContactUrl,
  sanitizeCryptoUri,
  sanitizeImageUrl,
  sanitizeCryptoAddress,
  stripBidi,
} from '../src/utils/security.ts';
import { getRouteFromPath, getPathForRoute } from '../src/utils/router.ts';
import type { ServerConfig, DownloadLinkItem } from '../src/services/types.ts';

test('branding helpers resolve localized platform name with fallback', () => {
  const customConfig: ServerConfig = {
    domain: 'example.com',
    registration_open: true,
    password_hash_algorithm: 'argon2id',
    certificate_checks: '1',
    endpoints: {
      imap: { host: 'mail.example.com', port: 993, security: 'ssl' },
      smtp: { host: 'mail.example.com', port: 465, security: 'ssl' },
    },
    platform_name: {
      en: 'CustomRelay',
      fa: 'ریلی سفارشی',
    },
    platform_image_url: 'https://cdn.example.com/logo.png',
    platform_icon: 'https://cdn.example.com/icon.png',
  };

  assert.equal(getPlatformName(customConfig, 'fa'), 'ریلی سفارشی');
  assert.equal(getPlatformName(customConfig, 'en'), 'CustomRelay');

  // Fallback when config is null
  assert.equal(getPlatformName(null, 'fa'), 'میلیم');
  assert.equal(getPlatformName(null, 'en'), 'MailiaM');

  // Logo and favicon resolution
  assert.equal(getPlatformLogo(customConfig), 'https://cdn.example.com/logo.png');
  assert.equal(getPlatformFavicon(customConfig), 'https://cdn.example.com/icon.png');

  // Fallback to ./logo.svg
  assert.equal(getPlatformLogo(null), './logo.svg');
  assert.equal(getPlatformFavicon(null), './logo.svg');
});

test('getLocalizedTitle respects Persian title_fa and falls back to title', () => {
  const item = {
    title: 'Download APK',
    title_fa: 'دانلود فایل APK',
  };

  assert.equal(getLocalizedTitle(item, 'fa'), 'دانلود فایل APK');
  assert.equal(getLocalizedTitle(item, 'en'), 'Download APK');

  const itemNoFa = {
    title: 'Only English',
  };
  assert.equal(getLocalizedTitle(itemNoFa, 'fa'), 'Only English');
  assert.equal(getLocalizedTitle(itemNoFa, 'en'), 'Only English');
});

test('sortDownloadLinks prioritizes is_direct and APK for Persian locale', () => {
  const links: DownloadLinkItem[] = [
    { title: 'Google Play', link: 'https://play.google.com/store/apps/details?id=chat.delta', is_direct: false },
    { title: 'Direct APK', link: 'https://download.delta.chat/android/deltachat.apk', is_direct: true },
    { title: 'F-Droid', link: 'https://f-droid.org/packages/chat.delta/', is_direct: false },
    { title: 'Server Direct Mirror', link: 'https://relay.com/mirror', is_direct: true },
  ];

  const sortedFa = sortDownloadLinks(links, 'fa');
  // Direct APK has is_direct (2) + APK (1) = score 3, must be first
  assert.equal(sortedFa[0].title, 'Direct APK');
  // Server Direct Mirror has is_direct (2) = score 2, must be second
  assert.equal(sortedFa[1].title, 'Server Direct Mirror');

  // In English locale, original array order is preserved
  const sortedEn = sortDownloadLinks(links, 'en');
  assert.equal(sortedEn[0].title, 'Google Play');
  assert.equal(sortedEn[1].title, 'Direct APK');
});

test('security sanitizer rejects malicious protocols and XSS payloads', () => {
  // Reject javascript:, data:, vbscript:
  assert.equal(sanitizeWebUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeWebUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(sanitizeWebUrl('vbscript:msgbox(1)'), null);
  assert.equal(sanitizeWebUrl('//evil.com/phish'), null);

  // Accept valid https & relative URLs
  assert.equal(sanitizeWebUrl('https://delta.chat/download'), 'https://delta.chat/download');
  assert.equal(sanitizeWebUrl('/downloads/app.apk'), '/downloads/app.apk');
  assert.equal(sanitizeWebUrl('./logo.svg'), './logo.svg');

  // Contact URLs support mailto and matrix
  assert.equal(sanitizeContactUrl('mailto:admin@domain.com'), 'mailto:admin@domain.com');
  assert.equal(sanitizeContactUrl('matrix:u/alice:matrix.org'), 'matrix:u/alice:matrix.org');
  assert.equal(sanitizeContactUrl('javascript:steal()'), null);

  // Image sanitization
  assert.equal(sanitizeImageUrl('https://cdn.domain.com/pic.png'), 'https://cdn.domain.com/pic.png');
  assert.equal(sanitizeImageUrl('data:image/svg+xml;base64,...'), null);
  assert.equal(sanitizeImageUrl('javascript:bad()'), null);
});

test('crypto address sanitizer strips bidi override characters and control chars', () => {
  // Bidi Trojan Source character injection test (U+202E Right-to-Left Override)
  const maliciousBtc = 'bc1q‮xyz123‭safe';
  const cleaned = sanitizeCryptoAddress(maliciousBtc);
  assert.equal(cleaned, 'bc1qxyz123safe');
  assert.equal(maliciousBtc.length, 16);
  assert.equal(cleaned.length, 14);

  // Whitespace and newline control chars stripped
  assert.equal(sanitizeCryptoAddress('  bc1qtest123\n\t  '), 'bc1qtest123');
});

test('router supports community route and path mapping', () => {
  assert.equal(getRouteFromPath('/community'), 'community');
  assert.equal(getRouteFromPath('/community.html'), 'community');
  assert.equal(getRouteFromPath('/something', '#/community'), 'community');
  assert.equal(getPathForRoute('community'), '/community');
});
