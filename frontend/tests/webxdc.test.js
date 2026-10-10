import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAbsoluteXdcUrl, sendXdcToChat } from '../src/utils/webxdc.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');

test('getAbsoluteXdcUrl resolves relative package paths to absolute URLs', () => {
  const origin = 'https://chatchi.org';
  const url = getAbsoluteXdcUrl('/apps/xdcstore/packages/app.xdc', origin);
  assert.equal(url, 'https://chatchi.org/apps/xdcstore/packages/app.xdc');
});

test('getAbsoluteXdcUrl preserves absolute URLs regardless of origin', () => {
  const origin = 'https://chatchi.org';
  const external = 'https://cdn.example.org/downloads/game.xdc';
  const url = getAbsoluteXdcUrl(external, origin);
  assert.equal(url, external);
});

test('getAbsoluteXdcUrl defaults to chatchi.org in non-browser environment', () => {
  const url = getAbsoluteXdcUrl('/apps/test.xdc');
  assert.equal(url, 'https://chatchi.org/apps/test.xdc');
});

test('sendXdcToChat stops event propagation and invokes window.location.assign', () => {
  let defaultPrevented = false;
  let propagationStopped = false;
  let assignedUrl = null;

  const mockEvent = {
    preventDefault: () => { defaultPrevented = true; },
    stopPropagation: () => { propagationStopped = true; },
  };

  // Mock window.location
  const originalWindow = globalThis.window;
  globalThis.window = {
    location: {
      origin: 'https://chatchi.org',
      assign: (target) => {
        assignedUrl = target;
      },
    },
  };

  try {
    sendXdcToChat(mockEvent, '/apps/xdcstore/packages/calc.xdc');
    assert.equal(defaultPrevented, true, 'Must prevent default event');
    assert.equal(propagationStopped, true, 'Must stop event propagation');
    assert.equal(assignedUrl, 'https://chatchi.org/apps/xdcstore/packages/calc.xdc', 'Must invoke window.location.assign with absolute URL');
  } finally {
    globalThis.window = originalWindow;
  }
});

test('sendXdcToChat handles null event safely without error', () => {
  let assignedUrl = null;
  const originalWindow = globalThis.window;
  globalThis.window = {
    location: {
      origin: 'https://chatchi.org',
      assign: (target) => {
        assignedUrl = target;
      },
    },
  };

  try {
    assert.doesNotThrow(() => {
      sendXdcToChat(null, '/apps/package.xdc');
    });
    assert.equal(assignedUrl, 'https://chatchi.org/apps/package.xdc');
  } finally {
    globalThis.window = originalWindow;
  }
});

test('AppCard component file exists and satisfies mobile WebView navigation and UI specs', () => {
  const filePath = path.resolve(frontendDir, 'src/components/apps/AppCard.jsx');
  assert.ok(fs.existsSync(filePath), 'AppCard.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function AppCard/, 'Must export AppCard component');
  assert.match(content, /sendXdcToChat/, 'Must import and use sendXdcToChat helper');
  assert.match(content, /app\.download_url/, 'Must pass app.download_url to sendXdcToChat');
  assert.match(content, /onSelect\(app\)/, 'Must call onSelect(app) when details button clicked');
  assert.match(content, /badge/, 'Must render version badge');
});

test('AppModal component file exists and renders dialog with sendXdcToChat install trigger', () => {
  const filePath = path.resolve(frontendDir, 'src/components/apps/AppModal.jsx');
  assert.ok(fs.existsSync(filePath), 'AppModal.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function AppModal/, 'Must export AppModal component');
  assert.match(content, /sendXdcToChat/, 'Must import and use sendXdcToChat helper');
  assert.match(content, /<dialog[^>]*modal/, 'Must render DaisyUI modal dialog');
  assert.match(content, /onClose/, 'Must support onClose callback');
});

test('AppsRoute component file exists and integrates catalog, search, advisory box and skeleton', () => {
  const filePath = path.resolve(frontendDir, 'src/routes/AppsRoute.jsx');
  assert.ok(fs.existsSync(filePath), 'AppsRoute.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function AppsRoute/, 'Must export AppsRoute component');
  assert.match(content, /service\s*\.\s*getApps\s*\(\)/, 'Must fetch apps via service.getApps()');
  assert.match(content, /AppCard/, 'Must render AppCard component');
  assert.match(content, /alert-warning/, 'Must render security advisory alert box');
  assert.match(content, /skeleton/, 'Must render loading skeletons');
  assert.match(content, /input-search|type=["']search["']/, 'Must render search filter input');
});
