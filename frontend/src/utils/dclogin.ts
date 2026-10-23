import { API_DOMAIN } from '../api/registry.ts';
import type { ServerConfig } from '../services/types.ts';

export interface RandomCredentials {
  username: string;
  password: string;
  email: string;
}

export function generateRandomString(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(bytes[i] % charset.length);
  }
  return result;
}

export function getDomainName(domainOrUrl: string = API_DOMAIN): string {
  if (domainOrUrl) {
    const extracted = domainOrUrl.replace(/^https?:\/\//, '').split(':')[0].split('/')[0];
    if (extracted) return extracted;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }
  return 'chatchi.org';
}

export function generateRandomCredentials(domain: string = getDomainName(API_DOMAIN)): RandomCredentials {
  const username = generateRandomString(12);
  const password = generateRandomString(24);
  return {
    username,
    password,
    email: `${username}@${domain}`,
  };
}

export interface DcloginUriOptions {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: string;
  certificateChecks?: string | number | boolean;
}

export function buildDcloginUri(options: Partial<DcloginUriOptions> = {}): string {
  const {
    email,
    password,
    imapHost,
    imapPort,
    imapSecurity,
    smtpHost,
    smtpPort,
    smtpSecurity,
    certificateChecks,
  } = options;

  if (!email || !password) {
    throw new Error('Email and password are required to build dclogin URI');
  }

  if (email.includes('#') || email.includes('?')) {
    throw new Error('Email contains invalid URI characters');
  }

  // ponytail: support numeric 0 / string '0' for self-signed or raw-IP environments where TLS verification must be skipped
  if (
    !imapHost ||
    imapPort === undefined ||
    !imapSecurity ||
    !smtpHost ||
    smtpPort === undefined ||
    !smtpSecurity ||
    certificateChecks === undefined ||
    certificateChecks === null ||
    certificateChecks === ''
  ) {
    throw new Error('DCLogin endpoints are required');
  }

  let normalizedIc = String(certificateChecks);
  if (certificateChecks === false || certificateChecks === 'false' || certificateChecks === 0 || certificateChecks === '0') {
    normalizedIc = '0';
  } else if (certificateChecks === true || certificateChecks === 'true' || certificateChecks === 1 || certificateChecks === '1') {
    normalizedIc = '1';
  }

  const query = [
    `p=${encodeURIComponent(password)}`,
    'v=1',
    `ih=${encodeURIComponent(imapHost)}`,
    `ip=${imapPort}`,
    `is=${encodeURIComponent(imapSecurity)}`,
    `sh=${encodeURIComponent(smtpHost)}`,
    `sp=${smtpPort}`,
    `ss=${encodeURIComponent(smtpSecurity)}`,
    `ic=${encodeURIComponent(normalizedIc)}`,
  ].join('&');

  const atIdx = email.lastIndexOf('@');
  const encodedEmail = atIdx > 0
    ? `${encodeURIComponent(email.slice(0, atIdx))}@${email.slice(atIdx + 1)}`
    : encodeURIComponent(email);

  return `dclogin:${encodedEmail}/?${query}`;
}

export function generateInstantUsername(config?: Partial<ServerConfig> | null): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  const prefix = config?.instant_prefix_enabled === false ? '' : (config?.instant_prefix ?? 'dc_');
  return `${prefix}${hex}`;
}

export function openDeltaChatUri(
  dcloginUrl: string,
  onFallback?: () => void,
  timeoutMs: number = 2000
): () => void {
  if (typeof window === 'undefined') return () => {};

  let opened = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const handleBlur = () => {
    opened = true;
    cleanup();
  };
  const handleVisibility = () => {
    if (document.hidden) {
      opened = true;
      cleanup();
    }
  };

  const cleanup = () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('visibilitychange', handleVisibility);
  };

  window.addEventListener('blur', handleBlur, { once: true });
  document.addEventListener('visibilitychange', handleVisibility);

  window.location.href = dcloginUrl;

  timer = setTimeout(() => {
    cleanup();
    if (!opened && typeof onFallback === 'function') {
      onFallback();
    }
  }, timeoutMs);

  return cleanup;
}
