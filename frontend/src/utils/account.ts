import type { InstantAccountPayload, ServerConfig } from '../services/types.ts';
import { buildDcloginUri, generateRandomString } from './dclogin.ts';
import { hashPassword, isSupportedHashAlgorithm } from './password-hash.ts';

const RESERVED_NAMES = new Set([
  'admin',
  'administrator',
  'root',
  'postmaster',
  'hostmaster',
  'webmaster',
  'abuse',
  'mailer-daemon',
  'nobody',
  'support',
  'security',
  'noc',
  'dmarc',
  'dkim',
  'sales',
  'info',
  'daemon',
  'help',
]);

export type CustomUsernameError = 'ok' | 'format' | 'dc_prefix' | 'reserved';

export function validateCustomUsername(username: string): CustomUsernameError {
  const u = username.trim().toLowerCase();
  if (u.length < 3 || u.length > 32) return 'format';
  if (u.startsWith('dc_')) return 'dc_prefix';
  if (RESERVED_NAMES.has(u)) return 'reserved';
  if (u.startsWith('.') || u.endsWith('.') || u.includes('..')) return 'format';
  if (![...u].every((c) => /[a-z0-9._-]/.test(c))) return 'format';
  return 'ok';
}

export function endpointsConfigured(config: ServerConfig): boolean {
  return Boolean(config.endpoints?.imap?.host && config.endpoints?.smtp?.host);
}

export function canSignup(config: ServerConfig): boolean {
  return (
    config.registration_open &&
    isSupportedHashAlgorithm(config.password_hash_algorithm) &&
    endpointsConfigured(config)
  );
}

export function signupErrorKey(config: ServerConfig, kindEnabled = true): string | null {
  if (!isSupportedHashAlgorithm(config.password_hash_algorithm)) return 'error_unsupported_hash';
  if (!endpointsConfigured(config)) return 'error_endpoints_not_configured';
  if (!config.registration_open || !kindEnabled) return 'error_create_account';
  return null;
}

export function altchaRequired(config: ServerConfig): boolean {
  return config.altcha?.required === true;
}

export interface CreateAccountWithQrOptions {
  config: ServerConfig;
  username: string;
  altchaPayload?: string | null;
  create: (payload: InstantAccountPayload) => Promise<{ email: string }>;
}

export async function createAccountWithQr({
  config,
  username,
  altchaPayload,
  create,
}: CreateAccountWithQrOptions): Promise<{ email: string; dclogin_link: string }> {
  const algo = config.password_hash_algorithm;
  if (!isSupportedHashAlgorithm(algo)) {
    throw new Error('Unsupported hash algorithm');
  }
  if (!endpointsConfigured(config)) {
    throw new Error('Mail endpoints are not configured');
  }

  const password = generateRandomString(24);
  const password_hash = await hashPassword(algo, password);
  const payload: InstantAccountPayload = { username, password_hash };
  if (altchaRequired(config)) {
    if (!altchaPayload) throw new Error('altcha required');
    payload.altcha_payload = altchaPayload;
  }

  const data = await create(payload);
  return {
    email: data.email,
    dclogin_link: buildDcloginUri({
      email: data.email,
      password,
      imapHost: config.endpoints.imap.host,
      imapPort: config.endpoints.imap.port,
      imapSecurity: config.endpoints.imap.security,
      smtpHost: config.endpoints.smtp.host,
      smtpPort: config.endpoints.smtp.port,
      smtpSecurity: config.endpoints.smtp.security,
      certificateChecks: config.certificate_checks,
    }),
  };
}
