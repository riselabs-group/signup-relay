import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDcloginUri,
  generateRandomCredentials,
  generateRandomString,
  openDeltaChatUri,
} from '../src/utils/dclogin.js';
import { createQrMatrix, generateQrSvgDataUri } from '../src/utils/qr.js';

test('buildDcloginUri produces valid RFC-compliant dclogin: query parameters', () => {
  const uri = buildDcloginUri({
    email: 'user@chatchi.org',
    password: 'p@ss=word&123',
    imapHost: 'mail.chatchi.org',
    imapPort: 993,
    imapSecurity: 'ssl',
    smtpHost: 'mail.chatchi.org',
    smtpPort: 465,
    smtpSecurity: 'ssl',
  });

  assert.ok(uri.startsWith('dclogin:user@chatchi.org/?'));
  assert.ok(uri.includes('ih=mail.chatchi.org'));
  assert.ok(uri.includes('ip=993'));
  assert.ok(uri.includes('is=ssl'));
  assert.ok(uri.includes('p=p%40ss%3Dword%26123'));
});

test('buildDcloginUri uses default hosts and ports when omitted', () => {
  const uri = buildDcloginUri({
    email: 'test@chatchi.org',
    password: 'secretPassword!',
  });

  assert.ok(uri.startsWith('dclogin:test@chatchi.org/?'));
  assert.ok(uri.includes('ih=mail.chatchi.org'));
  assert.ok(uri.includes('ip=993'));
  assert.ok(uri.includes('is=ssl'));
  assert.ok(uri.includes('sh=mail.chatchi.org'));
  assert.ok(uri.includes('sp=465'));
  assert.ok(uri.includes('ss=ssl'));
  assert.ok(uri.includes('v=1'));
  assert.ok(uri.includes('ic=3'));
});

test('buildDcloginUri throws if email or password is missing', () => {
  assert.throws(() => buildDcloginUri({ email: 'test@chatchi.org' }), /Email and password are required/);
  assert.throws(() => buildDcloginUri({ password: 'pass' }), /Email and password are required/);
  assert.throws(() => buildDcloginUri(), /Email and password are required/);
});

test('generateRandomCredentials generates entropy satisfying constraints', () => {
  const creds = generateRandomCredentials('chatchi.org');
  assert.equal(creds.username.length, 12);
  assert.equal(creds.password.length, 24);
  assert.equal(creds.email, `${creds.username}@chatchi.org`);
  assert.match(creds.username, /^[a-z0-9]{12}$/);
  assert.match(creds.password, /^[a-z0-9]{24}$/);
});

test('generateRandomString produces unique strings with alphanumeric charset', () => {
  const s1 = generateRandomString(16);
  const s2 = generateRandomString(16);
  assert.equal(s1.length, 16);
  assert.equal(s2.length, 16);
  assert.notEqual(s1, s2);
  assert.match(s1, /^[a-z0-9]+$/);
});

test('openDeltaChatUri safely returns no-op cleanup when window is undefined', () => {
  // In Node environment, window is undefined by default
  let cleanup;
  assert.doesNotThrow(() => {
    cleanup = openDeltaChatUri('dclogin:test@chatchi.org/?p=1', () => {});
  });
  assert.equal(typeof cleanup, 'function');
  assert.doesNotThrow(() => cleanup());
});

test('openDeltaChatUri triggers fallback callback if app does not open before timeout', async () => {
  let fallbackCalled = false;
  let listeners = {};
  const mockWindow = {
    location: { href: '' },
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };
  const mockDocument = {
    hidden: false,
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };

  globalThis.window = mockWindow;
  globalThis.document = mockDocument;

  try {
    const cleanup = openDeltaChatUri('dclogin:test@chatchi.org/?p=123', () => {
      fallbackCalled = true;
    }, 50);
    assert.equal(typeof cleanup, 'function');

    assert.equal(mockWindow.location.href, 'dclogin:test@chatchi.org/?p=123');
    assert.equal(fallbackCalled, false);

    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(fallbackCalled, true);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test('openDeltaChatUri cleanup handle cancels timeout and cleans listeners', async () => {
  let fallbackCalled = false;
  let listeners = {};
  const mockWindow = {
    location: { href: '' },
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };
  const mockDocument = {
    hidden: false,
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };

  globalThis.window = mockWindow;
  globalThis.document = mockDocument;

  try {
    const cleanup = openDeltaChatUri('dclogin:test@chatchi.org/?p=123', () => {
      fallbackCalled = true;
    }, 50);

    assert.equal(typeof listeners.blur, 'function');
    assert.equal(typeof listeners.visibilitychange, 'function');

    // Caller unmounts and invokes cleanup before timeout
    cleanup();

    assert.equal(listeners.blur, undefined);
    assert.equal(listeners.visibilitychange, undefined);

    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(fallbackCalled, false);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test('openDeltaChatUri handles visibilitychange transitions', async () => {
  let fallbackCalled = false;
  let listeners = {};
  const mockWindow = {
    location: { href: '' },
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };
  const mockDocument = {
    hidden: false,
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };

  globalThis.window = mockWindow;
  globalThis.document = mockDocument;

  try {
    openDeltaChatUri('dclogin:test@chatchi.org/?p=123', () => {
      fallbackCalled = true;
    }, 50);

    // Initial visibility event where document is not hidden yet
    mockDocument.hidden = false;
    if (listeners.visibilitychange) listeners.visibilitychange();

    // Secondary visibility event where document becomes hidden (e.g. app opened)
    mockDocument.hidden = true;
    if (listeners.visibilitychange) listeners.visibilitychange();

    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(fallbackCalled, false);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test('openDeltaChatUri suppresses fallback when blur event fires', async () => {
  let fallbackCalled = false;
  let listeners = {};
  const mockWindow = {
    location: { href: '' },
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };
  const mockDocument = {
    hidden: false,
    addEventListener: (event, handler) => { listeners[event] = handler; },
    removeEventListener: (event) => { delete listeners[event]; },
  };

  globalThis.window = mockWindow;
  globalThis.document = mockDocument;

  try {
    openDeltaChatUri('dclogin:test@chatchi.org/?p=123', () => {
      fallbackCalled = true;
    }, 50);

    // Simulate browser losing focus as native app opens
    if (listeners.blur) listeners.blur();

    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(fallbackCalled, false);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test('qr utilities generate SVG representation and data URI', () => {
  const qr = createQrMatrix('dclogin:test@chatchi.org/?p=123');
  const svg = qr.getSvgString(200);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('width="200"'));
  assert.ok(svg.includes('height="200"'));
  assert.ok(svg.includes('<path fill="#ffffff"'), 'Must generate background path');
  assert.ok(svg.includes('stroke="#000000"'), 'Must generate dark modules path');
  assert.ok(!svg.includes('QR CODE'), 'Must not use placeholder text');

  const dataUri = generateQrSvgDataUri('dclogin:test@chatchi.org/?p=123', 200);
  assert.ok(dataUri.startsWith('data:image/svg+xml;charset=utf-8,'));
  assert.ok(dataUri.includes('%3Csvg'));
});
