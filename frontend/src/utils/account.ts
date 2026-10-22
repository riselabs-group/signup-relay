import { ApiError } from '../api/client.ts';
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

export type CustomUsernameError = 'ok' | 'length' | 'dc_prefix' | 'reserved' | 'dots' | 'chars';

/** ponytail: `-_.` only — skip `$&|;<>\`'"#?@:*~` which break shell/SQL/URI/nginx/IMAP if pasted. Expand if a password manager needs more. */
export const PASSWORD_SAFE_SYMBOLS = '-_.';

export type CustomPasswordError = 'ok' | 'length' | 'upper' | 'lower' | 'digit' | 'symbol' | 'chars' | 'username';

export function validateCustomPassword(password: string, username = ''): CustomPasswordError {
  if (password.length < 12) return 'length';
  if (![...password].every((c) => /[A-Za-z0-9._-]/.test(c))) return 'chars';
  if (!/[A-Z]/.test(password)) return 'upper';
  if (!/[a-z]/.test(password)) return 'lower';
  if (!/[0-9]/.test(password)) return 'digit';
  if (![...password].some((c) => PASSWORD_SAFE_SYMBOLS.includes(c))) return 'symbol';
  if (username && password.toLowerCase() === username.trim().toLowerCase()) return 'username';
  return 'ok';
}

export function validateCustomUsername(
  username: string,
  config?: Partial<ServerConfig> | null
): CustomUsernameError {
  const u = username.trim().toLowerCase();
  if (u.length < 3 || u.length > 32) return 'length';
  if (!config?.custom_prefix_enabled) {
    const instantEnabled = config ? config.instant_prefix_enabled !== false : true;
    const instantPrefix = (config?.instant_prefix ?? 'dc_').toLowerCase();
    if (instantEnabled && instantPrefix && u.startsWith(instantPrefix)) return 'dc_prefix';
  }
  if (RESERVED_NAMES.has(u)) return 'reserved';
  if (u.startsWith('.') || u.endsWith('.') || u.includes('..')) return 'dots';
  if (![...u].every((c) => /[a-z0-9._+-]/.test(c))) return 'chars';
  return 'ok';
}

export function isRawIpOrLocal(host: string): boolean {
  if (!host) return false;
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':') || host === 'localhost' || host === '127.0.0.1';
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

export function signupErrorKey(
  config: ServerConfig,
  kindEnabled = true,
  kind: 'instant' | 'custom' = 'instant'
): string | null {
  if (!isSupportedHashAlgorithm(config.password_hash_algorithm)) return 'error_unsupported_hash';
  if (!endpointsConfigured(config)) return 'error_endpoints_not_configured';
  if (!config.registration_open) return 'error_registration_closed';
  if (!kindEnabled) return kind === 'custom' ? 'error_custom_accounts_disabled' : 'error_instant_accounts_disabled';
  return null;
}

export function altchaRequired(config: ServerConfig): boolean {
  return config.altcha?.required === true;
}

const CODE_KEY: Record<string, string> = {
  deltachat_disabled: 'error_deltachat_disabled',
  not_found: 'error_not_found',
  method_not_allowed: 'error_method_not_allowed',
  registration_closed: 'error_registration_closed',
  instant_accounts_disabled: 'error_instant_accounts_disabled',
  custom_accounts_disabled: 'error_custom_accounts_disabled',
  invalid_password: 'error_invalid_password',
  invalid_password_hash: 'error_invalid_password_hash',
  endpoints_not_configured: 'error_endpoints_not_configured',
  altcha_required: 'error_altcha_required',
  altcha_invalid: 'error_altcha_invalid',
  altcha_replay: 'error_altcha_replay',
  account_already_exists: 'error_account_exists',
  internal_error: 'error_internal',
};

const USERNAME_SUFFIX: Record<string, string> = {
  'Instant username must match dc_ + 12 hex chars': 'validation_username_instant',
  'Username must be between 3 and 32 characters': 'validation_username_length',
  "Username prefix 'dc_' is reserved for instant accounts": 'validation_username_dc_prefix',
  'Username is reserved': 'validation_username_reserved',
  'Username cannot start/end with dot or contain consecutive dots': 'validation_username_dots',
  'Username contains invalid characters': 'validation_username_chars',
};

const DOMAIN_SUFFIX: Record<string, string> = {
  'Primary domain is not configured': 'error_invalid_domain_not_configured',
  'Primary domain not found': 'error_invalid_domain_not_found',
  'Domain has no name': 'error_invalid_domain_no_name',
};

function suffixAfter(message: string, prefix: string): string {
  return message.startsWith(prefix) ? message.slice(prefix.length) : message;
}

export function apiErrorKey(err: unknown): string {
  if (!(err instanceof ApiError) || !err.data || typeof err.data !== 'object') {
    return 'error_create_account';
  }
  const obj = err.data as { error?: unknown; message?: unknown };
  const code = obj.error;
  const message = typeof obj.message === 'string' ? obj.message : '';
  if (code === 'invalid_username') {
    const rawSuffix = suffixAfter(message, 'Invalid username: ');
    if (rawSuffix.startsWith("Username prefix '") && rawSuffix.endsWith("' is reserved for instant accounts")) {
      return 'validation_username_dc_prefix';
    }
    return USERNAME_SUFFIX[rawSuffix] ?? 'validation_username_format';
  }
  if (code === 'invalid_domain') {
    return DOMAIN_SUFFIX[suffixAfter(message, 'Invalid domain: ')] ?? 'error_invalid_domain';
  }
  if (code === 'bad_request') {
    return suffixAfter(message, 'Bad request: ') === 'Missing request body'
      ? 'error_bad_request_body'
      : 'error_bad_request';
  }
  if (typeof code === 'string' && CODE_KEY[code]) return CODE_KEY[code];
  return 'error_create_account';
}

export interface CreateAccountWithQrOptions {
  config: ServerConfig;
  username: string;
  password?: string;
  altchaPayload?: string | null;
  create: (payload: InstantAccountPayload) => Promise<{ email: string }>;
}

export async function createAccountWithQr({
  config,
  username,
  password: givenPassword,
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

  const password = givenPassword || generateRandomString(24);
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
      certificateChecks:
        config.certificate_checks !== undefined && config.certificate_checks !== null && config.certificate_checks !== ''
          ? config.certificate_checks
          : (isRawIpOrLocal(config.endpoints.imap.host) ? '0' : '1'),
    }),
  };
}
