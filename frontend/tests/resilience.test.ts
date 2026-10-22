import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex, solveAltcha } from '../src/utils/altcha.ts';
import { buildDcloginUri, generateInstantUsername, getDomainName } from '../src/utils/dclogin.ts';
import { copyToClipboard } from '../src/utils/clipboard.ts';
import { isRawIpOrLocal, createAccountWithQr } from '../src/utils/account.ts';
import { resolveFallbackDomain } from '../src/services/config.ts';

test('sha256Hex and solveAltcha work seamlessly in Insecure Contexts (crypto.subtle undefined)', async () => {
  const originalSubtle = globalThis.crypto?.subtle;
  try {
    // Simulate plain HTTP / raw IP insecure context where crypto.subtle is undefined
    Object.defineProperty(globalThis.crypto, 'subtle', { value: undefined, configurable: true });

    const hash = await sha256Hex('test-insecure-data');
    assert.equal(hash, '4365e1f33216ed75c567afa8edbe2ae99c6dbdc511a35751f9e5159a0076d14b');

    const salt = 'insecure_salt_';
    const targetNumber = 17;
    const challenge = await sha256Hex(`${salt}${targetNumber}`);
    const result = await solveAltcha({
      algorithm: 'SHA-256',
      challenge,
      salt,
      signature: 'sig',
      max_number: 50,
    });
    assert.ok(result);
    const decoded = JSON.parse(Buffer.from(result, 'base64').toString('utf8'));
    assert.equal(decoded.number, targetNumber);
  } finally {
    if (originalSubtle) {
      Object.defineProperty(globalThis.crypto, 'subtle', { value: originalSubtle, configurable: true });
    }
  }
});

test('buildDcloginUri supports certificateChecks=0 for raw IP and self-signed TLS', () => {
  const uri = buildDcloginUri({
    email: 'user@188.121.125.60',
    password: 'securepassword123',
    imapHost: '188.121.125.60',
    imapPort: 993,
    imapSecurity: 'ssl',
    smtpHost: '188.121.125.60',
    smtpPort: 465,
    smtpSecurity: 'ssl',
    certificateChecks: 0,
  });

  assert.ok(uri.includes('ic=0'), 'Must include ic=0 parameter');
  assert.ok(uri.includes('ih=188.121.125.60'));
});

test('isRawIpOrLocal identifies IPv4, IPv6, and localhost', () => {
  assert.equal(isRawIpOrLocal('188.121.125.60'), true);
  assert.equal(isRawIpOrLocal('127.0.0.1'), true);
  assert.equal(isRawIpOrLocal('localhost'), true);
  assert.equal(isRawIpOrLocal('mail.example.org'), false);
  assert.equal(isRawIpOrLocal('chatchi.org'), false);
});

test('createAccountWithQr automatically sets ic=0 when imap host is raw IP', async () => {
  const config = {
    domain: '188.121.125.60',
    registration_open: true,
    password_hash_algorithm: 'argon2id',
    endpoints: {
      imap: { host: '188.121.125.60', port: 993, security: 'ssl' },
      smtp: { host: '188.121.125.60', port: 465, security: 'ssl' },
    },
    // certificate_checks omitted by server
  } as any;

  const result = await createAccountWithQr({
    config,
    username: 'dc_1234567890ab',
    create: async () => ({ email: 'dc_1234567890ab@188.121.125.60' }),
  });

  assert.ok(result.dclogin_link.includes('ic=0'), 'Must default to ic=0 for raw IP mail host');
});

test('copyToClipboard safely executes without throwing in non-browser or insecure environments', async () => {
  const result = await copyToClipboard('test copy');
  assert.equal(typeof result, 'boolean');
});

test('resolveFallbackDomain uses window.location.hostname for IP or custom web origins', () => {
  // Test with mock window
  (globalThis as any).window = {
    location: { hostname: '37.152.191.28' },
  };
  try {
    const domain = resolveFallbackDomain(undefined, undefined);
    assert.equal(domain, '37.152.191.28');
  } finally {
    delete (globalThis as any).window;
  }
});
