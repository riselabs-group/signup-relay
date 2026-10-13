import { API_DOMAIN } from '../api/registry.ts';

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
  return domainOrUrl.replace(/^https?:\/\//, '').split(':')[0].split('/')[0] || 'chatchi.org';
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
  imapHost?: string;
  imapPort?: number;
  imapSecurity?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecurity?: string;
}

export function buildDcloginUri(options: DcloginUriOptions = {} as DcloginUriOptions): string {
  const emailDomain = options?.email?.split('@')[1] || getDomainName(API_DOMAIN);
  const {
    email,
    password,
    imapHost = `mail.${emailDomain}`,
    imapPort = 993,
    imapSecurity = 'ssl',
    smtpHost = `mail.${emailDomain}`,
    smtpPort = 465,
    smtpSecurity = 'ssl',
  } = options || ({} as DcloginUriOptions);

  if (!email || !password) {
    throw new Error('Email and password are required to build dclogin URI');
  }

  if (email.includes('#') || email.includes('?')) {
    throw new Error('Email contains invalid URI characters');
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
    'ic=3',
  ].join('&');

  return `dclogin:${email}/?${query}`;
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
