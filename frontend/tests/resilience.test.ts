import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex, solveAltcha } from '../src/utils/altcha.ts';
import { buildDcloginUri, generateInstantUsername, getDomainName } from '../src/utils/dclogin.ts';
import { copyToClipboard } from '../src/utils/clipboard.ts';
import { isRawIpOrLocal, createAccountWithQr } from '../src/utils/account.ts';
import { hashPassword } from '../src/utils/password-hash.ts';
import { resolveFallbackDomain } from '../src/services/config.ts';
import { getAbsoluteXdcUrl } from '../src/utils/webxdc.ts';

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

test('solveAltcha throws cleanly when difficulty limit is exceeded without hanging', async () => {
  const salt = 'unsolvable_salt_';
  const targetNumber = 999;
  const challenge = await sha256Hex(`${salt}${targetNumber}`);

  await assert.rejects(
    () => solveAltcha({
      algorithm: 'SHA-256',
      challenge,
      salt,
      signature: 'sig',
      max_number: 10, // Limit is 10, target is 999
    }),
    /Could not solve Altcha proof-of-work within limit/
  );
});

test('hashPassword and generateInstantUsername work when global crypto is completely undefined', async () => {
  const originalCrypto = globalThis.crypto;
  try {
    // Simulate legacy browser / restricted webview without Web Crypto API
    delete (globalThis as any).crypto;

    const username = generateInstantUsername({ instant_prefix: 'dc_' });
    assert.match(username, /^dc_[a-f0-9]{12}$/);

    const hash = await hashPassword('argon2id', 'fallback-pass-123');
    assert.ok(hash.startsWith('$argon2id$v=19$'));
  } finally {
    globalThis.crypto = originalCrypto;
  }
});

test('buildDcloginUri supports all truthy/falsy representations of certificateChecks', () => {
  const base = {
    email: 'user@188.121.125.60',
    password: 'p',
    imapHost: '188.121.125.60',
    imapPort: 993,
    imapSecurity: 'ssl',
    smtpHost: '188.121.125.60',
    smtpPort: 465,
    smtpSecurity: 'ssl',
  };

  assert.ok(buildDcloginUri({ ...base, certificateChecks: 0 }).includes('ic=0'));
  assert.ok(buildDcloginUri({ ...base, certificateChecks: '0' }).includes('ic=0'));
  assert.ok(buildDcloginUri({ ...base, certificateChecks: false }).includes('ic=0'));
  assert.ok(buildDcloginUri({ ...base, certificateChecks: 'false' }).includes('ic=0'));

  assert.ok(buildDcloginUri({ ...base, certificateChecks: 1 }).includes('ic=1'));
  assert.ok(buildDcloginUri({ ...base, certificateChecks: '1' }).includes('ic=1'));
  assert.ok(buildDcloginUri({ ...base, certificateChecks: true }).includes('ic=1'));
  assert.ok(buildDcloginUri({ ...base, certificateChecks: 'true' }).includes('ic=1'));
});

test('buildDcloginUri safely encodes and preserves complex passwords and Unicode characters', () => {
  const complexPassword = 'P@ss wörd & #?= +%123 فارسی';
  const uri = buildDcloginUri({
    email: 'user@example.org',
    password: complexPassword,
    imapHost: 'mail.example.org',
    imapPort: 993,
    imapSecurity: 'ssl',
    smtpHost: 'mail.example.org',
    smtpPort: 465,
    smtpSecurity: 'ssl',
    certificateChecks: '1',
  });

  const parsedUrl = new URL(uri.replace('dclogin:', 'https://'));
  const extractedPassword = parsedUrl.searchParams.get('p');
  assert.equal(extractedPassword, complexPassword, 'Decoded password parameter must perfectly match original password');
});

test('isRawIpOrLocal identifies IPv4, IPv6 with/without brackets, and localhost', () => {
  assert.equal(isRawIpOrLocal('188.121.125.60'), true);
  assert.equal(isRawIpOrLocal('127.0.0.1'), true);
  assert.equal(isRawIpOrLocal('localhost'), true);
  assert.equal(isRawIpOrLocal('[::1]'), true);
  assert.equal(isRawIpOrLocal('::1'), true);
  assert.equal(isRawIpOrLocal('2001:db8::1'), true);
  assert.equal(isRawIpOrLocal('[2001:db8::1]'), true);
  assert.equal(isRawIpOrLocal('fe80::1'), true);

  assert.equal(isRawIpOrLocal('mail.example.org'), false);
  assert.equal(isRawIpOrLocal('chatchi.org'), false);
  assert.equal(isRawIpOrLocal('relay.internal.net'), false);
});

test('createAccountWithQr automatically sets ic=0 when imap host is raw IPv4 or IPv6', async () => {
  const configIpv4 = {
    domain: '188.121.125.60',
    registration_open: true,
    password_hash_algorithm: 'argon2id',
    endpoints: {
      imap: { host: '188.121.125.60', port: 993, security: 'ssl' },
      smtp: { host: '188.121.125.60', port: 465, security: 'ssl' },
    },
  } as any;

  const resIpv4 = await createAccountWithQr({
    config: configIpv4,
    username: 'dc_1234567890ab',
    create: async () => ({ email: 'dc_1234567890ab@188.121.125.60' }),
  });
  assert.ok(resIpv4.dclogin_link.includes('ic=0'), 'Must default to ic=0 for IPv4 host');

  const configIpv6 = {
    domain: 'test.org',
    registration_open: true,
    password_hash_algorithm: 'argon2id',
    endpoints: {
      imap: { host: '[2001:db8::1]', port: 993, security: 'ssl' },
      smtp: { host: '[2001:db8::1]', port: 465, security: 'ssl' },
    },
  } as any;

  const resIpv6 = await createAccountWithQr({
    config: configIpv6,
    username: 'dc_1234567890ab',
    create: async () => ({ email: 'dc_1234567890ab@test.org' }),
  });
  assert.ok(resIpv6.dclogin_link.includes('ic=0'), 'Must default to ic=0 for IPv6 host');
});

test('copyToClipboard falls back to execCommand when navigator.clipboard.writeText rejects', async () => {
  let execCommandCalled = false;
  let copiedText = '';

  const mockTextarea = {
    value: '',
    style: {},
    setAttribute: () => {},
    focus: () => {},
    select: () => { copiedText = mockTextarea.value; },
  };

  const originalClipboard = (globalThis as any).navigator?.clipboard;
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: {
      writeText: async () => {
        throw new Error('NotAllowedError: Insecure Context');
      },
    },
    configurable: true,
  });

  (globalThis as any).document = {
    createElement: (tag: string) => (tag === 'textarea' ? mockTextarea : {}),
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
    execCommand: (cmd: string) => {
      if (cmd === 'copy') {
        execCommandCalled = true;
        return true;
      }
      return false;
    },
  };

  try {
    const success = await copyToClipboard('test-fallback-payload');
    assert.equal(success, true);
    assert.equal(execCommandCalled, true);
    assert.equal(copiedText, 'test-fallback-payload');
  } finally {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
    delete (globalThis as any).document;
  }
});

test('copyToClipboard returns false safely when both APIs fail without throwing unhandled exceptions', async () => {
  const originalClipboard = (globalThis as any).navigator?.clipboard;
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: {
      writeText: async () => { throw new Error('Blocked'); },
    },
    configurable: true,
  });

  (globalThis as any).document = {
    createElement: () => { throw new Error('DOM failure'); },
  };

  try {
    const success = await copyToClipboard('payload');
    assert.equal(success, false);
  } finally {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
    delete (globalThis as any).document;
  }
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

  // Test with localhost -> should fallback to chatchi.org
  (globalThis as any).window = {
    location: { hostname: '127.0.0.1' },
  };
  try {
    const domain = resolveFallbackDomain(undefined, undefined);
    assert.equal(domain, 'chatchi.org');
  } finally {
    delete (globalThis as any).window;
  }
});

test('getAbsoluteXdcUrl correctly resolves packages on raw IP origins with custom ports', () => {
  const url = getAbsoluteXdcUrl('/apps/chess.xdc', 'http://192.168.1.100:8080');
  assert.equal(url, 'http://192.168.1.100:8080/apps/chess.xdc');

  const externalUrl = getAbsoluteXdcUrl('https://store.example.com/game.xdc', 'http://192.168.1.100:8080');
  assert.equal(externalUrl, 'https://store.example.com/game.xdc');
});
