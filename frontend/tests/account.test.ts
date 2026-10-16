import test from 'node:test';
import assert from 'node:assert/strict';
import {
  altchaRequired,
  canSignup,
  createAccountWithQr,
  endpointsConfigured,
  signupErrorKey,
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

test('generateInstantUsername is dc_ plus 12 hex', () => {
  const u = generateInstantUsername();
  assert.match(u, /^dc_[0-9a-f]{12}$/);
  assert.equal(u.length, 15);
});

test('validateCustomUsername accepts 3-32 [a-z0-9._-] without dc_ or reserved', () => {
  assert.equal(validateCustomUsername('abc'), 'ok');
  assert.equal(validateCustomUsername('user.name-1_x'), 'ok');
  assert.equal(validateCustomUsername('a'.repeat(32)), 'ok');
});

test('validateCustomUsername rejects format, dc_ prefix, and reserved names', () => {
  assert.equal(validateCustomUsername('ab'), 'format');
  assert.equal(validateCustomUsername('a'.repeat(33)), 'format');
  assert.equal(validateCustomUsername('.abc'), 'format');
  assert.equal(validateCustomUsername('abc.'), 'format');
  assert.equal(validateCustomUsername('a..b'), 'format');
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
  assert.equal(signupErrorKey(cfg(), false), 'error_create_account');
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
