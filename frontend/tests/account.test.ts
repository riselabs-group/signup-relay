import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/api/client.ts';
import {
  altchaRequired,
  apiErrorKey,
  canSignup,
  createAccountWithQr,
  endpointsConfigured,
  signupErrorKey,
  validateCustomPassword,
  validateCustomUsername,
} from '../src/utils/account.ts';
import { generateInstantUsername } from '../src/utils/dclogin.ts';
import type { ServerConfig } from '../src/services/types.ts';

function cfg(over: Partial<ServerConfig> = {}): ServerConfig {
  return {
    domain: 'example.org',
    registration_open: true,
    instant_accounts_enabled: true,
    password_hash_algorithm: 'argon2id',
    certificate_checks: '1',
    endpoints: {
      imap: { host: 'imap.example.org', port: 993, security: 'ssl' },
      smtp: { host: 'smtp.example.org', port: 465, security: 'ssl' },
    },
    altcha: { required: false, max_number: 10000 },
    ...over,
  };
}

test('generateInstantUsername is dc_ plus 12 hex by default and honors prefix config', () => {
  const u = generateInstantUsername();
  assert.match(u, /^dc_[0-9a-f]{12}$/);
  assert.equal(u.length, 15);

  const customPref = generateInstantUsername({ instant_prefix_enabled: true, instant_prefix: 'ch_' });
  assert.match(customPref, /^ch_[0-9a-f]{12}$/);
  assert.equal(customPref.length, 15);

  const noPref = generateInstantUsername({ instant_prefix_enabled: false });
  assert.match(noPref, /^[0-9a-f]{12}$/);
  assert.equal(noPref.length, 12);
});

test('validateCustomUsername accepts 3-32 [a-z0-9._-] without dc_ or reserved', () => {
  assert.equal(validateCustomUsername('abc'), 'ok');
  assert.equal(validateCustomUsername('user.name-1_x'), 'ok');
  assert.equal(validateCustomUsername('a'.repeat(32)), 'ok');
});

test('validateCustomUsername respects dynamic instant and custom prefix policies', () => {
  // Disabling instant prefix allows dc_ in custom username
  assert.equal(validateCustomUsername('dc_alice', { instant_prefix_enabled: false }), 'ok');

  // Custom instant prefix is forbidden
  assert.equal(validateCustomUsername('bot_alice', { instant_prefix: 'bot_' }), 'dc_prefix');

  // When custom prefix is enabled, instant prefix check is bypassed
  assert.equal(validateCustomUsername('usr_dc_alice', { custom_prefix_enabled: true, custom_prefix: 'usr_' }), 'ok');
});

test('validateCustomPassword requires 12 chars, mixed case, digit, and -_.', () => {
  assert.equal(validateCustomPassword('Abcdefgh1-xy'), 'ok');
  assert.equal(validateCustomPassword('Abcdefghij1.'), 'ok');
  assert.equal(validateCustomPassword('Abcdefghij1_'), 'ok');
  assert.equal(validateCustomPassword('Abcdefg1-x'), 'length');
  assert.equal(validateCustomPassword('abcdefgh1-xy'), 'upper');
  assert.equal(validateCustomPassword('ABCDEFGH1-XY'), 'lower');
  assert.equal(validateCustomPassword('Abcdefghij-x'), 'digit');
  assert.equal(validateCustomPassword('Abcdefghij12'), 'symbol');
  assert.equal(validateCustomPassword('Abcdefgh1-x!'), 'chars');
  assert.equal(validateCustomPassword('Abcdefgh1-xy', 'abcdefgh1-xy'), 'username');
});

test('createAccountWithQr hashes a given custom password', async () => {
  let posted: Record<string, unknown> | null = null;
  const result = await createAccountWithQr({
    config: cfg(),
    username: 'alice',
    password: 'Abcdefgh1-xy',
    create: async (payload) => {
      posted = payload as unknown as Record<string, unknown>;
      return { email: 'alice@example.org', account_type: 'custom' as const };
    },
  });
  assert.ok(String(posted?.password_hash).startsWith('$argon2id$'));
  assert.equal(posted?.password, undefined);
  assert.ok(result.dclogin_link.includes('p=Abcdefgh1-xy'));
});

test('validateCustomUsername rejects format, dc_ prefix, and reserved names', () => {
  assert.equal(validateCustomUsername('ab'), 'length');
  assert.equal(validateCustomUsername('a'.repeat(33)), 'length');
  assert.equal(validateCustomUsername('.abc'), 'dots');
  assert.equal(validateCustomUsername('abc.'), 'dots');
  assert.equal(validateCustomUsername('a..b'), 'dots');
  assert.equal(validateCustomUsername('dc_abcdef012345'), 'dc_prefix');
  assert.equal(validateCustomUsername('admin'), 'reserved');
  assert.equal(validateCustomUsername('postmaster'), 'reserved');
});

test('canSignup is false for unsupported algorithm or empty mail hosts', () => {
  assert.equal(canSignup(cfg()), true);
  assert.equal(canSignup(cfg({ password_hash_algorithm: 'md5' })), false);
  assert.equal(canSignup(cfg({ registration_open: false })), false);
  assert.equal(
    endpointsConfigured(cfg({ endpoints: { imap: { host: '', port: 993, security: 'ssl' }, smtp: { host: 'smtp.example.org', port: 465, security: 'ssl' } } })),
    false
  );
  assert.equal(signupErrorKey(cfg({ password_hash_algorithm: 'md5' })), 'error_unsupported_hash');
  assert.equal(signupErrorKey(cfg({ registration_open: false })), 'error_registration_closed');
  assert.equal(signupErrorKey(cfg(), false), 'error_instant_accounts_disabled');
  assert.equal(signupErrorKey(cfg({ custom_accounts_enabled: false }), false, 'custom'), 'error_custom_accounts_disabled');
});

test('altchaRequired follows config.altcha.required', () => {
  assert.equal(altchaRequired(cfg({ altcha: { required: true, max_number: 1 } })), true);
  assert.equal(altchaRequired(cfg({ altcha: { required: false, max_number: 1 } })), false);
  assert.equal(altchaRequired(cfg({ altcha: undefined })), false);
});

test('createAccountWithQr POSTs hash only and builds QR from response email', async () => {
  let posted: Record<string, unknown> | null = null;
  const result = await createAccountWithQr({
    config: cfg(),
    username: 'dc_0123456789ab',
    altchaPayload: 'should-not-send',
    create: async (payload) => {
      posted = payload as unknown as Record<string, unknown>;
      return { email: 'dc_0123456789ab@example.org', account_type: 'instant' as const };
    },
  });

  assert.ok(posted);
  assert.equal(posted.username, 'dc_0123456789ab');
  assert.ok(String(posted.password_hash).startsWith('$argon2id$'));
  assert.equal(posted.password, undefined);
  assert.equal(posted.altcha_payload, undefined);
  assert.equal(result.email, 'dc_0123456789ab@example.org');
  assert.ok(result.dclogin_link.startsWith('dclogin:dc_0123456789ab@example.org/?'));
  assert.ok(result.dclogin_link.includes('ih=imap.example.org'));
  assert.ok(result.dclogin_link.includes('ic=1'));
  assert.ok(!result.dclogin_link.includes('localhost'));
});

test('createAccountWithQr sends altcha_payload only when required', async () => {
  let posted: Record<string, unknown> | null = null;
  await createAccountWithQr({
    config: cfg({ altcha: { required: true, max_number: 1 } }),
    username: 'alice',
    altchaPayload: 'proof',
    create: async (payload) => {
      posted = payload as unknown as Record<string, unknown>;
      return { email: 'alice@example.org', account_type: 'custom' as const };
    },
  });
  assert.equal(posted?.altcha_payload, 'proof');
});

test('apiErrorKey maps each Stalwart code; username/domain suffixes split', () => {
  const api = (code: string, message: string, status = 400) =>
    new ApiError(message, status, { error: code, message });

  assert.equal(apiErrorKey(api('deltachat_disabled', 'DeltaChat module is disabled', 404)), 'error_deltachat_disabled');
  assert.equal(apiErrorKey(api('not_found', 'Not found: Endpoint not found', 404)), 'error_not_found');
  assert.equal(apiErrorKey(api('method_not_allowed', 'Method not allowed', 405)), 'error_method_not_allowed');
  assert.equal(apiErrorKey(api('registration_closed', 'Account registration is currently closed', 403)), 'error_registration_closed');
  assert.equal(apiErrorKey(api('instant_accounts_disabled', 'Instant account creation is disabled', 403)), 'error_instant_accounts_disabled');
  assert.equal(apiErrorKey(api('custom_accounts_disabled', 'Custom account creation is disabled', 403)), 'error_custom_accounts_disabled');
  assert.equal(apiErrorKey(api('invalid_password', 'Invalid password: Plaintext password is not accepted')), 'error_invalid_password');
  assert.equal(apiErrorKey(api('invalid_password_hash', 'Password hash does not match the configured algorithm')), 'error_invalid_password_hash');
  assert.equal(apiErrorKey(api('endpoints_not_configured', 'IMAP/SMTP endpoints are not configured')), 'error_endpoints_not_configured');
  assert.equal(apiErrorKey(api('altcha_required', 'Altcha proof-of-work solution is required')), 'error_altcha_required');
  assert.equal(apiErrorKey(api('altcha_invalid', 'Invalid Altcha challenge solution')), 'error_altcha_invalid');
  assert.equal(apiErrorKey(api('altcha_replay', 'Altcha challenge solution has already been used')), 'error_altcha_replay');
  assert.equal(apiErrorKey(api('account_already_exists', 'An account with this email already exists', 409)), 'error_account_exists');
  assert.equal(apiErrorKey(api('internal_error', 'Internal server error: db fail', 500)), 'error_internal');
  assert.equal(apiErrorKey(api('bad_request', 'Bad request: Missing request body')), 'error_bad_request_body');
  assert.equal(apiErrorKey(api('bad_request', 'Bad request: expected ident at line 1')), 'error_bad_request');

  assert.equal(apiErrorKey(api('invalid_username', 'Invalid username: Instant username must match dc_ + 12 hex chars')), 'validation_username_instant');
  assert.equal(apiErrorKey(api('invalid_username', 'Invalid username: Username must be between 3 and 32 characters')), 'validation_username_length');
  assert.equal(apiErrorKey(api('invalid_username', "Invalid username: Username prefix 'dc_' is reserved for instant accounts")), 'validation_username_dc_prefix');
  assert.equal(apiErrorKey(api('invalid_username', "Invalid username: Username prefix 'bot_' is reserved for instant accounts")), 'validation_username_dc_prefix');
  assert.equal(apiErrorKey(api('invalid_username', 'Invalid username: Username is reserved')), 'validation_username_reserved');
  assert.equal(apiErrorKey(api('invalid_username', 'Invalid username: Username cannot start/end with dot or contain consecutive dots')), 'validation_username_dots');
  assert.equal(apiErrorKey(api('invalid_username', 'Invalid username: Username contains invalid characters')), 'validation_username_chars');
  assert.equal(apiErrorKey(api('invalid_username', 'Invalid username: other')), 'validation_username_format');

  assert.equal(apiErrorKey(api('invalid_domain', 'Invalid domain: Primary domain is not configured')), 'error_invalid_domain_not_configured');
  assert.equal(apiErrorKey(api('invalid_domain', 'Invalid domain: Primary domain not found')), 'error_invalid_domain_not_found');
  assert.equal(apiErrorKey(api('invalid_domain', 'Invalid domain: Domain has no name')), 'error_invalid_domain_no_name');
  assert.equal(apiErrorKey(api('invalid_domain', 'Invalid domain: other')), 'error_invalid_domain');

  assert.equal(apiErrorKey(api('nope', 'whatever')), 'error_create_account');
  assert.equal(apiErrorKey(new Error('Mail endpoints are not configured')), 'error_create_account');
});

test('createAccountWithQr refuses when altcha is required and payload missing', async () => {
  await assert.rejects(
    () =>
      createAccountWithQr({
        config: cfg({ altcha: { required: true, max_number: 1 } }),
        username: 'alice',
        create: async () => ({ email: 'alice@example.org' }),
      }),
    /altcha/
  );
});
