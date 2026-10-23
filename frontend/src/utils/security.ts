// ponytail: regex-based protocol allowlist and bidi stripping; upgrade to DOMPurify if arbitrary rich-text HTML rendering added
const BIDI_REGEX = /[​-‏‪-‮⁦-⁩﻿­؜⁠]/g;
const CONTROL_CHAR_REGEX = /[\x00-\x1F\x7F-\x9F]/g;

const DEFAULT_WEB_PROTOCOLS = Object.freeze(['https:', 'http:']);
const CONTACT_PROTOCOLS = Object.freeze(['https:', 'http:', 'mailto:', 'xmpp:', 'matrix:', 'dclogin:']);
const CRYPTO_PROTOCOLS = Object.freeze(['bitcoin:', 'ethereum:', 'monero:']);

export function stripBidi(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(BIDI_REGEX, '').trim();
}

export function sanitizeWebUrl(
  raw: unknown,
  allowedProtocols: readonly string[] = DEFAULT_WEB_PROTOCOLS
): string | null {
  if (typeof raw !== 'string') return null;
  const clean = raw.trim().replace(CONTROL_CHAR_REGEX, '');
  if (!clean) return null;

  // Relative path safety: keep path clean, reject protocol-relative (//, /\) and backslash paths
  if (clean.startsWith('\\')) return null;
  if (clean.startsWith('/') || clean.startsWith('./') || clean.startsWith('#')) {
    if (clean.replace(/\\/g, '/').startsWith('//')) return null;
    return clean;
  }

  try {
    const parsed = new URL(clean);
    if (!allowedProtocols.includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function sanitizeContactUrl(raw: unknown): string | null {
  return sanitizeWebUrl(raw, CONTACT_PROTOCOLS);
}

export function sanitizeCryptoUri(raw: unknown): string | null {
  return sanitizeWebUrl(raw, CRYPTO_PROTOCOLS);
}

export function sanitizeImageUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const clean = raw.trim().replace(CONTROL_CHAR_REGEX, '');
  if (!clean) return null;

  // Reject inline data:, blob:, javascript:
  if (clean.startsWith('\\')) return null;
  if (clean.startsWith('/') || clean.startsWith('./')) {
    if (clean.replace(/\\/g, '/').startsWith('//')) return null;
    return clean;
  }

  try {
    const parsed = new URL(clean);
    if (!DEFAULT_WEB_PROTOCOLS.includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function sanitizeCryptoAddress(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(CONTROL_CHAR_REGEX, '').replace(BIDI_REGEX, '');
}
