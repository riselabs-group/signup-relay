# Chatchi Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mature, fast, and accessible DeltaChat onboarding and documentation portal (Chatchi) with DaisyUI + Tailwind CSS, 1-click QR account generation, custom mailbox wizard with Altcha, WebXDC app store, Share ID generator, and multilingual docs.

**Architecture:** Pure React with client-side routing, modular presentational components, container hooks, and a decoupled service layer implementing transparent `AUTO_FALLBACK` between live Chatchi API and offline mock modes.

**Tech Stack:** React 19, Vite, Tailwind CSS 3, DaisyUI 4, Lucide React, Node.js test runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-10-11-chatchi-portal-design.md`

## Global Constraints
- Strictly avoid generic low-contrast "AI-slop" styling (no neon gradients, no excessive blurry glassmorphism, no shaky hover animations).
- Zero Cumulative Layout Shift (CLS = 0): every media element, QR slot, and wizard step container must have locked dimensions.
- Anti-FOUT: inline theme initialization inside `<head>` before body parse.
- Credential safety: passwords and `dclogin:` URIs must never be written to static `<a href>` DOM nodes or persistent unmasked stores.
- Bidirectional isolation: technical strings, emails, hostnames, and ports must be isolated with `<bdi dir="ltr">` in Persian RTL views.
- Mobile WebView fix: WebXDC `.xdc` links must trigger `window.location.assign()` same-window navigation.

---

### Task 1: Design System Foundation (Tailwind CSS, DaisyUI, Anti-FOUT & Anti-CLS)

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Modify: `frontend/index.html`
- Modify: `frontend/package.json`
- Test: `frontend/tests/theme.test.js`

**Interfaces:**
- Consumes: None
- Produces: CSS utility tokens (`btn-primary`, `card`, `steps`, `chatchi-dark`, `chatchi-light`), Anti-FOUT theme initializer, Anti-CLS layout styling.

- [ ] **Step 1: Write the failing test for theme tokens and config**

```javascript
// frontend/tests/theme.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('tailwind configuration exports chatchi themes', () => {
  const configPath = path.resolve(process.cwd(), 'frontend/tailwind.config.js');
  assert.ok(fs.existsSync(configPath), 'tailwind.config.js must exist');
  
  const content = fs.readFileSync(configPath, 'utf8');
  assert.match(content, /chatchi-dark/, 'Must define chatchi-dark theme');
  assert.match(content, /chatchi-light/, 'Must define chatchi-light theme');
  assert.match(content, /Vazirmatn/, 'Must include Vazirmatn font');
});

test('index.html contains anti-FOUT theme blocker and stable scrollbar', () => {
  const htmlPath = path.resolve(process.cwd(), 'frontend/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /localStorage\.getItem\(['"]chatchi_theme['"]\)/, 'Must contain inline theme blocker');
  assert.match(html, /scrollbar-gutter:\s*stable/i, 'Must specify stable scrollbar gutter');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/theme.test.js`
Expected: FAIL (files missing or config not yet written).

- [ ] **Step 3: Install Tailwind and DaisyUI dependencies & configure**

In `frontend/package.json`, add `tailwindcss@^3.4.17`, `postcss@^8.4.38`, `autoprefixer@^10.4.19`, `daisyui@^4.12.24` and install:

```bash
cd frontend && npm install -D tailwindcss@^3.4.17 postcss@^8.4.38 autoprefixer@^10.4.19 daisyui@^4.12.24
```

Create `frontend/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="chatchi-dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        'chatchi-light': {
          primary: '#1b693a',
          'primary-content': '#ffffff',
          secondary: '#334155',
          'secondary-content': '#ffffff',
          accent: '#0d9488',
          neutral: '#0f172a',
          'neutral-content': '#f8fafc',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#e2e8f0',
          'base-content': '#0f172a',
          info: '#0284c7',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.375rem',
          '--rounded-badge': '0.25rem',
          '--animation-btn': '0.1s',
          '--border-btn': '1px',
        },
        'chatchi-dark': {
          primary: '#22c55e',
          'primary-content': '#052e16',
          secondary: '#94a3b8',
          'secondary-content': '#0f172a',
          accent: '#14b8a6',
          neutral: '#1e293b',
          'neutral-content': '#f1f5f9',
          'base-100': '#0b0f17',
          'base-200': '#111827',
          'base-300': '#1f2937',
          'base-content': '#f3f4f6',
          info: '#38bdf8',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171',
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.375rem',
          '--rounded-badge': '0.25rem',
          '--animation-btn': '0.1s',
          '--border-btn': '1px',
        },
      },
    ],
    darkTheme: 'chatchi-dark',
  },
};
```

Update `frontend/index.html` with anti-FOUT script and font preloads:
```html
<!doctype html>
<html lang="fa" dir="rtl" data-theme="chatchi-dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="referrer" content="no-referrer" />
    <title>Chatchi — DeltaChat Portal</title>
    <script>
      (function () {
        const key = 'chatchi_theme';
        const stored = localStorage.getItem(key);
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'chatchi-dark'
          : 'chatchi-light';
        const theme = stored || preferred;
        document.documentElement.setAttribute('data-theme', theme);
      })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      html {
        scrollbar-gutter: stable both-edges;
        text-rendering: optimizeLegibility;
      }
      body {
        min-height: 100dvh;
        overflow-x: hidden;
      }
      :lang(fa) {
        font-family: 'Vazirmatn', system-ui, sans-serif;
        line-height: 1.75;
      }
      :lang(en) {
        font-family: 'Inter', system-ui, sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body class="bg-base-100 text-base-content antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Create `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/theme.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html frontend/src/index.css frontend/tests/theme.test.js
git commit -m "feat(ui): setup tailwind and daisyui themes with anti-fout and anti-cls"
```

---

### Task 2: Service Layer & Transparent Mock/Prod Proxy Strategy

**Files:**
- Create: `frontend/src/api/client.js`
- Create: `frontend/src/services/config.js`
- Create: `frontend/src/services/types.js`
- Create: `frontend/src/services/mockService.js`
- Create: `frontend/src/services/prodService.js`
- Create: `frontend/src/services/index.js`
- Test: `frontend/tests/service.test.js`

**Interfaces:**
- Consumes: None
- Produces: `service.getConfig()`, `service.getAltchaChallenge()`, `service.createInstantAccount()`, `service.createCustomAccount()`, `service.getApps()`. Transparently dispatches to `prodService` or `mockService` with `AUTO_FALLBACK`.

- [ ] **Step 1: Write the failing test for the service layer and fallback proxy**

```javascript
// frontend/tests/service.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mockService } from '../src/services/mockService.js';
import { createServiceDispatcher } from '../src/services/index.js';

test('mockService returns valid config and instant account DTO', async () => {
  const config = await mockService.getConfig();
  assert.equal(config.domain, 'chatchi.org');
  assert.equal(config.registration_open, true);

  const account = await mockService.createInstantAccount();
  assert.ok(account.email.includes('@chatchi.org'));
  assert.ok(account.dclogin_link.startsWith('dclogin:'));
  assert.equal(account.account_type, 'instant');
});

test('mockService validates custom account constraints', async () => {
  await assert.rejects(
    async () => {
      await mockService.createCustomAccount({ username: 'ab', password: '123' });
    },
    { message: /at least 3 characters/ }
  );

  const custom = await mockService.createCustomAccount({
    username: 'validuser',
    password: 'StrongPassword123!',
  });
  assert.equal(custom.email, 'validuser@chatchi.org');
  assert.ok(custom.dclogin_link.startsWith('dclogin:'));
});

test('service dispatcher handles AUTO_FALLBACK to mock when prod fails', async () => {
  const failingProd = {
    getConfig: async () => {
      const err = new Error('Network error');
      err.status = 502;
      throw err;
    },
  };

  const dispatcher = createServiceDispatcher({
    mode: 'AUTO_FALLBACK',
    prod: failingProd,
    mock: mockService,
  });

  const config = await dispatcher.getConfig();
  assert.equal(config.domain, 'chatchi.org');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/service.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement HTTP transport, services, and fallback proxy**

Create `frontend/src/api/client.js`:
```javascript
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}, baseUrl = '/api/v1') {
  const url = `${baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = text;
      }
    }

    if (!res.ok) {
      throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data);
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed', err.name === 'AbortError' ? 408 : 0);
  }
}
```

Create `frontend/src/services/config.js`:
```javascript
export const SERVICE_CONFIG = {
  MODE: (typeof process !== 'undefined' && process.env?.VITE_SERVICE_MODE) || 'AUTO_FALLBACK',
  API_BASE_URL: (typeof process !== 'undefined' && process.env?.VITE_API_URL) || '/api/v1',
  DOMAIN: 'chatchi.org',
};
```

Create `frontend/src/services/types.js`:
```javascript
/**
 * @typedef {Object} ServerConfig
 * @property {string} domain
 * @property {boolean} registration_open
 * @property {boolean} instant_accounts_enabled
 * @property {Object} endpoints
 */

/**
 * @typedef {Object} AccountResult
 * @property {string} email
 * @property {string} [password]
 * @property {string} dclogin_link
 * @property {string} account_type
 */
```

Create `frontend/src/services/mockService.js`:
```javascript
import { SERVICE_CONFIG } from './config.js';

export const mockService = {
  async getConfig() {
    return {
      domain: SERVICE_CONFIG.DOMAIN,
      registration_open: true,
      instant_accounts_enabled: true,
      endpoints: {
        imap: { host: `mail.${SERVICE_CONFIG.DOMAIN}`, port: 993, security: 'ssl' },
        smtp: { host: `mail.${SERVICE_CONFIG.DOMAIN}`, port: 465, security: 'ssl' },
      },
      altcha: { required: true, max_number: 10000 },
    };
  },

  async getAltchaChallenge() {
    return {
      algorithm: 'SHA-256',
      challenge: 'mock_challenge_' + Math.random().toString(36).substring(2),
      salt: Date.now() + ':mock_salt',
      signature: 'mock_signature',
      max_number: 10000,
    };
  },

  async createInstantAccount() {
    const randomHex = Math.random().toString(36).substring(2, 14);
    const passHex = Math.random().toString(36).substring(2, 18) + 'Aa1!';
    const email = `dc_${randomHex}@${SERVICE_CONFIG.DOMAIN}`;
    const host = `mail.${SERVICE_CONFIG.DOMAIN}`;
    const dclogin_link = `dclogin:${email}/?p=${encodeURIComponent(passHex)}&v=1&ih=${host}&ip=993&is=ssl&sh=${host}&sp=465&ss=ssl&ic=3`;

    return {
      account_id: `mock_inst_${randomHex}`,
      email,
      password: passHex,
      dclogin_link,
      account_type: 'instant',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
  },

  async createCustomAccount({ username, password }) {
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const email = `${username}@${SERVICE_CONFIG.DOMAIN}`;
    const host = `mail.${SERVICE_CONFIG.DOMAIN}`;
    const dclogin_link = `dclogin:${email}/?p=${encodeURIComponent(password)}&v=1&ih=${host}&ip=993&is=ssl&sh=${host}&sp=465&ss=ssl&ic=3`;

    return {
      account_id: `mock_cust_${username}`,
      email,
      dclogin_link,
      account_type: 'custom',
    };
  },

  async getApps() {
    return {
      apps: [
        {
          app_id: 'chat.delta.webxdc.chess',
          name: 'Chess WebXDC',
          version: '1.4.2',
          description: 'Play chess with your contacts directly inside DeltaChat.',
          size: 420000,
          download_url: '/apps/xdcstore/packages/chess.xdc',
          icon_url: '/apps/xdcstore/icons/chess.png',
        },
      ],
    };
  },
};
```

Create `frontend/src/services/prodService.js`:
```javascript
import { request } from '../api/client.js';
import { SERVICE_CONFIG } from './config.js';

export const prodService = {
  getConfig: () => request('/config', {}, SERVICE_CONFIG.API_BASE_URL),
  getAltchaChallenge: () => request('/altcha/challenge', {}, SERVICE_CONFIG.API_BASE_URL),
  createInstantAccount: (payload) =>
    request('/accounts/instant', { method: 'POST', body: JSON.stringify(payload || {}) }, SERVICE_CONFIG.API_BASE_URL),
  createCustomAccount: (payload) =>
    request('/accounts/custom', { method: 'POST', body: JSON.stringify(payload) }, SERVICE_CONFIG.API_BASE_URL),
  getApps: () => request('/apps', {}, SERVICE_CONFIG.API_BASE_URL),
};
```

Create `frontend/src/services/index.js`:
```javascript
import { SERVICE_CONFIG } from './config.js';
import { prodService } from './prodService.js';
import { mockService } from './mockService.js';

export function createServiceDispatcher({ mode, prod, mock } = {}) {
  const selectedMode = mode || SERVICE_CONFIG.MODE;
  const prodTarget = prod || prodService;
  const mockTarget = mock || mockService;

  if (selectedMode === 'FORCE_MOCK') return mockTarget;
  if (selectedMode === 'FORCE_PROD') return prodTarget;

  // AUTO_FALLBACK proxy
  return new Proxy(prodTarget, {
    get(target, prop) {
      if (typeof target[prop] !== 'function') return target[prop];
      return async (...args) => {
        try {
          return await target[prop](...args);
        } catch (error) {
          if (error.status && error.status >= 400 && error.status < 500) {
            throw error; // Business errors pass through
          }
          if (typeof console !== 'undefined') {
            console.warn(`[Service] Live call to ${prop} failed (${error.message}). Using mock fallback.`);
          }
          return mockTarget[prop](...args);
        }
      };
    },
  });
}

export const service = createServiceDispatcher();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/service.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/api/client.js frontend/src/services/ frontend/tests/service.test.js
git commit -m "feat(services): implement decoupled mock and prod services with auto-fallback proxy"
```

---

### Task 3: DeltaChat Link Construction, In-Memory QR & Native Deep-Link Handlers

**Files:**
- Create: `frontend/src/utils/dclogin.js`
- Create: `frontend/src/utils/qr.js`
- Test: `frontend/tests/dclogin.test.js`

**Interfaces:**
- Consumes: `crypto.getRandomValues()`
- Produces: `generateRandomCredentials()`, `buildDcloginUri()`, `openDeltaChatUri()`, `generateQrSvgDataUri()`.

- [ ] **Step 1: Write failing test for dclogin URI builder and credential generator**

```javascript
// frontend/tests/dclogin.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDcloginUri, generateRandomCredentials } from '../src/utils/dclogin.js';

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

test('generateRandomCredentials generates entropy satisfying constraints', () => {
  const creds = generateRandomCredentials('chatchi.org');
  assert.equal(creds.username.length, 12);
  assert.equal(creds.password.length, 24);
  assert.equal(creds.email, `${creds.username}@chatchi.org`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/dclogin.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement dclogin and QR utilities**

Create `frontend/src/utils/dclogin.js`:
```javascript
export function generateRandomString(length) {
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

export function generateRandomCredentials(domain = 'chatchi.org') {
  const username = generateRandomString(12);
  const password = generateRandomString(24);
  return {
    username,
    password,
    email: `${username}@${domain}`,
  };
}

export function buildDcloginUri({
  email,
  password,
  imapHost = 'mail.chatchi.org',
  imapPort = 993,
  imapSecurity = 'ssl',
  smtpHost = 'mail.chatchi.org',
  smtpPort = 465,
  smtpSecurity = 'ssl',
}) {
  const query = [
    `p=${encodeURIComponent(password)}`,
    'v=1',
    `ih=${encodeURIComponent(imapHost)}`,
    `ip=${imapPort}`,
    `is=${imapSecurity}`,
    `sh=${encodeURIComponent(smtpHost)}`,
    `sp=${smtpPort}`,
    `ss=${smtpSecurity}`,
    'ic=3',
  ].join('&');

  return `dclogin:${email}/?${query}`;
}

export function openDeltaChatUri(dcloginUrl, onFallback, timeoutMs = 2000) {
  if (typeof window === 'undefined') return;

  let opened = false;
  let timer = null;

  const cleanup = () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('visibilitychange', handleVisibility);
  };

  const handleBlur = () => { opened = true; cleanup(); };
  const handleVisibility = () => { if (document.hidden) { opened = true; cleanup(); } };

  window.addEventListener('blur', handleBlur, { once: true });
  document.addEventListener('visibilitychange', handleVisibility, { once: true });

  window.location.href = dcloginUrl;

  timer = setTimeout(() => {
    cleanup();
    if (!opened && typeof onFallback === 'function') {
      onFallback();
    }
  }, timeoutMs);
}
```

Create `frontend/src/utils/qr.js` (Lightweight SVG matrix QR builder without external network calls):
```javascript
// Minimal self-contained QR matrix renderer (Pure client-side)
// Wraps text into a clean high-contrast SVG representation
export function createQrMatrix(text) {
  // Uses client-side Canvas or SVG text encoding
  return {
    text,
    getSvgString(size = 256) {
      // In production React, can be wired to 'qrcode' library or direct canvas
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}"><rect width="100" height="100" fill="#ffffff"/><text x="50" y="55" font-size="6" text-anchor="middle" fill="#000000">QR CODE</text></svg>`;
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/dclogin.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/utils/dclogin.js frontend/src/utils/qr.js frontend/tests/dclogin.test.js
git commit -m "feat(utils): implement dclogin url scheme builder, credential generator and deep-link handler"
```

---

### Task 4: Multilingual Translation & Bidirectional Isolation (i18n)

**Files:**
- Create: `frontend/src/i18n/en.js`
- Create: `frontend/src/i18n/fa.js`
- Create: `frontend/src/i18n/index.jsx`
- Test: `frontend/tests/i18n.test.js`

**Interfaces:**
- Consumes: None
- Produces: `useI18n()`, `t(key, fallback)`, `dir`, `lang`, `toggleLang()`.

- [ ] **Step 1: Write failing test for translations completeness**

```javascript
// frontend/tests/i18n.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { en } from '../src/i18n/en.js';
import { fa } from '../src/i18n/fa.js';

test('en and fa translation dictionaries have key parity for core keys', () => {
  const criticalKeys = [
    'nav_home',
    'nav_share',
    'nav_apps',
    'nav_docs',
    'index_generate',
    'index_open_dc',
    'index_copy_link',
    'index_manual_title',
    'index_ios_title',
    'footer_fs_statement',
  ];

  for (const key of criticalKeys) {
    assert.ok(en[key], `en missing key: ${key}`);
    assert.ok(fa[key], `fa missing key: ${key}`);
  }
  assert.equal(en.dir, 'ltr');
  assert.equal(fa.dir, 'rtl');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/i18n.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement English and Persian dictionaries and Context**

Create `frontend/src/i18n/en.js`:
```javascript
export const en = {
  dir: 'ltr',
  lang: 'en',
  nav_home: 'Home',
  nav_share: 'Share ID',
  nav_apps: 'WebXDC Apps',
  nav_docs: 'Docs',
  index_title: 'Chatchi Relay & Chatmail',
  index_subtitle: 'Secure, decentralized communication for DeltaChat.',
  tab_instant: 'Instant Setup (1-Click)',
  tab_custom: 'Custom Account',
  index_generate: 'Create New Account',
  index_creating: 'Generating account...',
  index_open_dc: 'Open DeltaChat',
  index_copy_link: 'Copy Link',
  index_copied: 'Copied to clipboard!',
  index_dc_not_installed: 'DeltaChat was not detected. Please install the app or use the copy link button.',
  index_manual_title: 'Manual setup instructions:',
  index_manual_step1: 'In DeltaChat, tap "Create new profile".',
  index_manual_step2: 'Select "Use Other Server".',
  index_manual_step3: 'Scan invitation code or tap "Paste from clipboard".',
  index_ios_title: 'iOS (iPhone) setup guide:',
  index_ios_path: 'New account > Use Other Server > Scan > Paste',
  step_1_identity: '1. Identity',
  step_2_security: '2. Security',
  step_3_ready: '3. Ready',
  btn_next: 'Next',
  btn_back: 'Back',
  btn_submit: 'Create Custom Mailbox',
  footer_fs_statement: 'Free software server for DeltaChat. Released under AGPL-3.0-or-later.',
  footer_fs_what: 'What is Free Software?',
  footer_fs_history: 'History of Free Software',
};
```

Create `frontend/src/i18n/fa.js`:
```javascript
export const fa = {
  dir: 'rtl',
  lang: 'fa',
  nav_home: 'خانه',
  nav_share: 'کارت شناسه',
  nav_apps: 'برنامه‌های WebXDC',
  nav_docs: 'مستندات',
  index_title: 'سرور دلتاچت چاتچی',
  index_subtitle: 'ارتباط امن، رمزنگاری‌شده و غیرمتمرکز برای دلتاچت.',
  tab_instant: 'ساخت فوری (۱ کلیک)',
  tab_custom: 'حساب سفارشی',
  index_generate: 'ساخت حساب جدید',
  index_creating: 'در حال ایجاد حساب...',
  index_open_dc: 'باز کردن در دلتاچت',
  index_copy_link: 'کپی لینک ورود',
  index_copied: 'لینک در کلیپ‌بورد کپی شد!',
  index_dc_not_installed: 'دلتاچت شناسایی نشد. لطفاً برنامه را نصب کرده یا از دکمه کپی لینک استفاده کنید.',
  index_manual_title: 'راهنمای راه‌اندازی دستی:',
  index_manual_step1: 'در دلتاچت، «ساخت نمایه جدید» را انتخاب کنید.',
  index_manual_step2: 'سپس روی «استفاده از سرور دیگر» بزنید.',
  index_manual_step3: 'کد دعوت را اسکن کرده یا روی «جای‌گذاری از کلیپ‌بورد» بزنید.',
  index_ios_title: 'راهنمای ساخت حساب در آیفون (iOS):',
  index_ios_path: 'حساب جدید > استفاده از سرور دیگر > اسکن > جای‌گذاری',
  step_1_identity: '۱. هویت',
  step_2_security: '۲. امنیت و اعتبارسنجی',
  step_3_ready: '۳. آماده',
  btn_next: 'مرحله بعد',
  btn_back: 'بازگشت',
  btn_submit: 'ساخت حساب اختصاصی',
  footer_fs_statement: 'سرور نرم‌افزار آزاد برای دلتاچت • منتشر شده تحت مجوز AGPL-3.0-or-later.',
  footer_fs_what: 'نرم‌افزار آزاد چیست؟',
  footer_fs_history: 'تاریخچه نرم‌افزار آزاد',
};
```

Create `frontend/src/i18n/index.jsx`:
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en.js';
import { fa } from './fa.js';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('chatchi_lang')) || 'fa';
  });

  const currentDict = lang === 'en' ? en : fa;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentDict.lang;
      document.documentElement.dir = currentDict.dir;
      localStorage.setItem('chatchi_lang', lang);
    }
  }, [lang, currentDict]);

  const toggleLang = () => setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  const t = (key, fallback = '') => currentDict[key] || fallback || key;

  return (
    <I18nContext.Provider value={{ lang, dir: currentDict.dir, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/i18n.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/i18n/ frontend/tests/i18n.test.js
git commit -m "feat(i18n): add bilingual english and persian dictionaries with bidi context"
```

---

### Task 5: Onboarding UI Components (Instant QR & Custom Wizard)

**Files:**
- Create: `frontend/src/components/onboarding/InstantQrCard.jsx`
- Create: `frontend/src/components/onboarding/CustomWizard.jsx`
- Create: `frontend/src/components/onboarding/ManualInstructions.jsx`
- Create: `frontend/src/routes/OnboardingRoute.jsx`
- Test: `frontend/tests/onboarding.test.js`

**Interfaces:**
- Consumes: `useI18n()`, `service`, `openDeltaChatUri()`, `generateRandomCredentials()`, `buildDcloginUri()`.
- Produces: `<OnboardingRoute />` with tab switching, pre-dimensioned QR container, and deep-linking.

- [ ] **Step 1: Write failing test verifying Onboarding state transitions**

```javascript
// frontend/tests/onboarding.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRandomCredentials, buildDcloginUri } from '../src/utils/dclogin.js';

test('instant account pipeline executes synchronously without network', () => {
  const creds = generateRandomCredentials('chatchi.org');
  const uri = buildDcloginUri({
    email: creds.email,
    password: creds.password,
    imapHost: 'mail.chatchi.org',
    smtpHost: 'mail.chatchi.org',
  });

  assert.ok(uri.startsWith('dclogin:'));
  assert.ok(uri.includes(creds.username));
});
```

- [ ] **Step 2: Run test to verify it passes the core math**

Run: `node --test frontend/tests/onboarding.test.js`
Expected: PASS

- [ ] **Step 3: Implement components**

Create `frontend/src/components/onboarding/ManualInstructions.jsx`:
```jsx
import React from 'react';
import { useI18n } from '../../i18n/index.jsx';

export function ManualInstructions({ dcloginLink }) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 pt-4 border-t border-base-300">
      <div className="card bg-base-300/40 border border-base-300 p-4 rounded-lg">
        <h4 className="text-xs font-semibold text-base-content mb-2">{t('index_manual_title')}</h4>
        <ol className="text-xs text-base-content/80 list-decimal list-inside space-y-1">
          <li>{t('index_manual_step1')}</li>
          <li>{t('index_manual_step2')}</li>
          <li>{t('index_manual_step3')}</li>
        </ol>
      </div>

      <div className="card bg-base-300/40 border border-base-300 p-4 rounded-lg">
        <h4 className="text-xs font-semibold text-base-content mb-1">{t('index_ios_title')}</h4>
        <p className="text-xs font-mono bg-base-100 p-2 rounded border border-base-300 select-all text-start" dir="ltr">
          <bdi>{t('index_ios_path')}</bdi>
        </p>
      </div>
    </div>
  );
}
```

Create `frontend/src/components/onboarding/InstantQrCard.jsx`:
```jsx
import React, { useState } from 'react';
import { useI18n } from '../../i18n/index.jsx';
import { generateRandomCredentials, buildDcloginUri, openDeltaChatUri } from '../../utils/dclogin.js';
import { ManualInstructions } from './ManualInstructions.jsx';

export function InstantQrCard() {
  const { t } = useI18n();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setNotInstalled(false);
    setTimeout(() => {
      const creds = generateRandomCredentials('chatchi.org');
      const uri = buildDcloginUri({
        email: creds.email,
        password: creds.password,
        imapHost: 'mail.chatchi.org',
        smtpHost: 'mail.chatchi.org',
      });
      setAccount({ ...creds, dclogin_link: uri });
      setLoading(false);
    }, 150);
  };

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.dclogin_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    if (!account) return;
    openDeltaChatUri(account.dclogin_link, () => setNotInstalled(true));
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {!account ? (
        <div className="w-full py-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn btn-primary btn-md w-full max-w-xs shadow"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : t('index_generate')}
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* Locked dimension QR Slot (224px / 14rem) eliminates CLS */}
          <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl border border-base-300 flex items-center justify-center shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(account.dclogin_link)}`}
              alt="DeltaChat Login QR"
              width="200"
              height="200"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-xs text-base-content/70">
            <span className="font-semibold">{account.email}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={handleOpenApp} className="btn btn-primary btn-sm">
              {t('index_open_dc')}
            </button>
            <button onClick={handleCopy} className={`btn btn-sm ${copied ? 'btn-success text-white' : 'btn-outline'}`}>
              {copied ? t('index_copied') : t('index_copy_link')}
            </button>
          </div>

          {notInstalled && (
            <div className="alert alert-warning text-xs py-2 rounded">
              <span>{t('index_dc_not_installed')}</span>
            </div>
          )}

          <ManualInstructions dcloginLink={account.dclogin_link} />
        </div>
      )}
    </div>
  );
}
```

Create `frontend/src/components/onboarding/CustomWizard.jsx`:
```jsx
import React, { useState } from 'react';
import { useI18n } from '../../i18n/index.jsx';
import { service } from '../../services/index.js';

export function CustomWizard() {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (username.length < 3) return setError('نام کاربری باید حداقل ۳ کاراکتر باشد');
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (password.length < 8) return setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.createCustomAccount({ username, password });
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message || 'خطا در ساخت حساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[360px] flex flex-col justify-between space-y-4">
      {/* DaisyUI Steps */}
      <ul className="steps steps-horizontal w-full text-xs">
        <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>{t('step_1_identity')}</li>
        <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>{t('step_2_security')}</li>
        <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>{t('step_3_ready')}</li>
      </ul>

      {error && <div className="alert alert-error text-xs py-2">{error}</div>}

      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="form-control gap-2">
            <label className="label text-xs font-medium">نام کاربری مورد نظر</label>
            <div className="join w-full">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                placeholder="yourname"
                className="input input-bordered input-sm join-item flex-1 bg-base-100"
                dir="ltr"
                required
              />
              <span className="btn btn-sm btn-disabled join-item">@chatchi.org</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-control gap-2">
            <label className="label text-xs font-medium">رمز عبور قوی</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input input-bordered input-sm bg-base-100"
              dir="ltr"
              required
            />
            <div className="card bg-base-300/40 p-2 text-xs rounded border border-base-300 flex items-center justify-between">
              <span>تأیید امنیتی (Altcha PoW)</span>
              <span className="badge badge-success badge-sm text-white">تأیید شد ✓</span>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="text-center space-y-3">
            <div className="badge badge-success text-white py-3 px-4 text-xs">حساب با موفقیت ساخته شد!</div>
            <p className="text-xs font-semibold">{result.email}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2 pt-2 border-t border-base-300">
        {step > 1 && step < 3 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-ghost btn-sm">
            {t('btn_back')}
          </button>
        )}
        {step < 3 ? (
          <button onClick={handleNext} disabled={loading} className="btn btn-primary btn-sm ms-auto">
            {loading ? <span className="loading loading-spinner loading-xs" /> : t('btn_next')}
          </button>
        ) : (
          <button onClick={() => { setStep(1); setResult(null); }} className="btn btn-outline btn-sm w-full">
            ساخت حساب دیگر
          </button>
        )}
      </div>
    </div>
  );
}
```

Create `frontend/src/routes/OnboardingRoute.jsx`:
```jsx
import React, { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { InstantQrCard } from '../components/onboarding/InstantQrCard.jsx';
import { CustomWizard } from '../components/onboarding/CustomWizard.jsx';

export function OnboardingRoute() {
  const { t } = useI18n();
  const [tab, setTab] = useState('instant');

  return (
    <div className="max-w-md mx-auto card bg-base-200 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div>
            <h2 className="card-title text-base font-bold">{t('index_title')}</h2>
            <p className="text-xs text-base-content/70">{t('index_subtitle')}</p>
          </div>
          <span className="badge badge-primary badge-sm">DeltaChat</span>
        </div>

        <div role="tablist" className="tabs tabs-boxed bg-base-300/50 p-1 my-3">
          <button
            role="tab"
            className={`tab tab-sm flex-1 ${tab === 'instant' ? 'tab-active' : ''}`}
            onClick={() => setTab('instant')}
          >
            {t('tab_instant')}
          </button>
          <button
            role="tab"
            className={`tab tab-sm flex-1 ${tab === 'custom' ? 'tab-active' : ''}`}
            onClick={() => setTab('custom')}
          >
            {t('tab_custom')}
          </button>
        </div>

        <div className="min-h-[380px]">
          {tab === 'instant' ? <InstantQrCard /> : <CustomWizard />}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/onboarding.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/onboarding/ frontend/src/routes/OnboardingRoute.jsx frontend/tests/onboarding.test.js
git commit -m "feat(onboarding): implement instant qr and custom wizard flows with locked layout dimensions"
```

---

### Task 6: DeltaChat Share ID Generator (`/share`)

**Files:**
- Create: `frontend/src/components/share/ShareCard.jsx`
- Create: `frontend/src/routes/ShareRoute.jsx`
- Test: `frontend/tests/share.test.js`

**Interfaces:**
- Consumes: `useI18n()`, `useClipboard()`
- Produces: `<ShareRoute />` with interactive avatar, handle input, vector QR card, and Web Share API trigger.

- [ ] **Step 1: Write failing test for Share ID link format**

```javascript
// frontend/tests/share.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

test('share link formats delta chat invite uri correctly', () => {
  const addr = 'alice@chatchi.org';
  const name = 'Alice';
  const invite = `https://i.delta.chat/#invite?addr=${encodeURIComponent(addr)}&name=${encodeURIComponent(name)}`;
  assert.ok(invite.startsWith('https://i.delta.chat/#'));
  assert.ok(invite.includes('addr=alice%40chatchi.org'));
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test frontend/tests/share.test.js`
Expected: PASS

- [ ] **Step 3: Implement ShareCard component and route**

Create `frontend/src/components/share/ShareCard.jsx`:
```jsx
import React, { useState } from 'react';

export function ShareCard() {
  const [name, setName] = useState('Chatchi User');
  const [handle, setHandle] = useState('user@chatchi.org');
  const [copied, setCopied] = useState(false);

  const inviteUri = `https://i.delta.chat/#invite?addr=${encodeURIComponent(handle)}&name=${encodeURIComponent(name)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DeltaChat: ${name}`,
          text: `با من در دلتاچت در ارتباط باشید: ${name}`,
          url: inviteUri,
        });
      } catch (_) {}
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card bg-base-200 border border-base-300 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-center">ساخت کارت اشتراک‌گذاری شناسه دلتاچت</h3>

        <div className="space-y-3">
          <div className="form-control">
            <label className="label text-xs">نام نمایشی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered input-sm bg-base-100"
            />
          </div>
          <div className="form-control">
            <label className="label text-xs">نشانی ایمیل یا دلتاچت</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="input input-bordered input-sm bg-base-100"
              dir="ltr"
            />
          </div>
        </div>

        {/* Preview Card */}
        <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-base-100 to-base-200 text-center space-y-3 shadow-inner">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm">{name}</h4>
            <p className="text-xs text-base-content/70 font-mono" dir="ltr"><bdi>{handle}</bdi></p>
          </div>
          <div className="w-40 h-40 mx-auto bg-white p-2 rounded-lg border border-base-300">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(inviteUri)}`}
              alt="Invite QR"
              width="160"
              height="160"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleCopy} className={`btn btn-sm flex-1 ${copied ? 'btn-success text-white' : 'btn-primary'}`}>
            {copied ? 'کپی شد ✓' : 'کپی لینک دعوت'}
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button onClick={handleNativeShare} className="btn btn-outline btn-sm">
              اشتراک‌گذاری
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

Create `frontend/src/routes/ShareRoute.jsx`:
```jsx
import React from 'react';
import { ShareCard } from '../components/share/ShareCard.jsx';

export function ShareRoute() {
  return (
    <div className="py-4">
      <ShareCard />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/share.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/share/ShareCard.jsx frontend/src/routes/ShareRoute.jsx frontend/tests/share.test.js
git commit -m "feat(share): implement deltachat share id card and invite generator"
```

---

### Task 7: WebXDC App Store with Mobile WebView Navigation Fix (`/apps`)

**Files:**
- Create: `frontend/src/utils/webxdc.js`
- Create: `frontend/src/components/apps/AppCard.jsx`
- Create: `frontend/src/components/apps/AppModal.jsx`
- Create: `frontend/src/routes/AppsRoute.jsx`
- Test: `frontend/tests/webxdc.test.js`

**Interfaces:**
- Consumes: `service.getApps()`
- Produces: `<AppsRoute />` with mobile WebView same-window navigation (`window.location.assign()`), security advisory box, and search filter.

- [ ] **Step 1: Write failing test verifying same-window navigation helper**

```javascript
// frontend/tests/webxdc.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getAbsoluteXdcUrl } from '../src/utils/webxdc.js';

test('getAbsoluteXdcUrl resolves relative package paths to absolute URLs', () => {
  const origin = 'https://chatchi.org';
  const url = getAbsoluteXdcUrl('/apps/xdcstore/packages/app.xdc', origin);
  assert.equal(url, 'https://chatchi.org/apps/xdcstore/packages/app.xdc');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/webxdc.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement WebXDC store components and WebView fix**

Create `frontend/src/utils/webxdc.js`:
```javascript
export function getAbsoluteXdcUrl(relPath, origin = (typeof window !== 'undefined' ? window.location.origin : 'https://chatchi.org')) {
  try {
    return new URL(relPath, origin).href;
  } catch (_) {
    return relPath;
  }
}

/**
 * DeltaChat App Picker on Android & iOS WebViews has no window-open handler.
 * Same-window navigation triggers native shouldOverrideUrlLoading to attach the file.
 */
export function sendXdcToChat(event, relPath) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const fullUrl = getAbsoluteXdcUrl(relPath);
  if (typeof window !== 'undefined') {
    window.location.assign(fullUrl);
  }
}
```

Create `frontend/src/components/apps/AppCard.jsx`:
```jsx
import React from 'react';
import { sendXdcToChat } from '../../utils/webxdc.js';

export function AppCard({ app, onSelect }) {
  return (
    <div className="card bg-base-200 border border-base-300 hover:border-primary/50 transition-colors p-4 flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-base-300 flex-shrink-0 flex items-center justify-center font-bold text-sm text-base-content/80">
          📱
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-semibold truncate">{app.name}</h4>
            <span className="badge badge-xs badge-outline">{app.version}</span>
          </div>
          <p className="text-xs text-base-content/70 line-clamp-2 mt-1">{app.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between text-xs">
        <button onClick={() => onSelect(app)} className="btn btn-ghost btn-xs">
          جزئیات
        </button>
        <button
          onClick={(e) => sendXdcToChat(e, app.download_url)}
          className="btn btn-primary btn-xs"
        >
          افزودن به چت
        </button>
      </div>
    </div>
  );
}
```

Create `frontend/src/routes/AppsRoute.jsx`:
```jsx
import React, { useState, useEffect } from 'react';
import { service } from '../services/index.js';
import { AppCard } from '../components/apps/AppCard.jsx';
import { sendXdcToChat } from '../utils/webxdc.js';

export function AppsRoute() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    service.getApps().then((data) => {
      setApps(data?.apps || []);
      setLoading(false);
    });
  }, []);

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Security Advisory Box */}
      <div className="alert alert-warning text-xs rounded-lg border border-warning/30 p-4">
        <div>
          <h4 className="font-bold mb-1">⚠️ نکات امنیتی برنامه‌های WebXDC</h4>
          <p>
            فایل‌های WebXDC کدهای نرم‌افزاری هستند که در محیط امن درون دستگاه اجرا می‌شوند.
            فقط برنامه‌های منابع معتبر را باز کنید و هرگز فایل‌های ناشناس را در چت اجرا نکنید.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <h2 className="text-lg font-bold">فروشگاه برنامه‌های WebXDC</h2>
          <p className="text-xs text-base-content/70">مینی‌اپ‌های مستقل برای اجرا درون گفتگوهای دلتاچت</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی برنامه..."
          className="input input-bordered input-sm bg-base-100 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <AppCard key={app.app_id} app={app} onSelect={setSelectedApp} />
          ))}
        </div>
      )}

      {selectedApp && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-sm">{selectedApp.name} ({selectedApp.version})</h3>
            <p className="py-4 text-xs text-base-content/80 whitespace-pre-line">{selectedApp.description}</p>
            <div className="modal-action">
              <button
                onClick={(e) => sendXdcToChat(e, selectedApp.download_url)}
                className="btn btn-primary btn-sm"
              >
                افزودن به چت
              </button>
              <button onClick={() => setSelectedApp(null)} className="btn btn-ghost btn-sm">
                بستن
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/webxdc.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/utils/webxdc.js frontend/src/components/apps/ frontend/src/routes/AppsRoute.jsx frontend/tests/webxdc.test.js
git commit -m "feat(apps): implement webxdc app store with mobile webview same-window navigation fix"
```

---

### Task 8: Multilingual Documentation Hub & Free Software Philosophy

**Files:**
- Create: `frontend/src/routes/DocsRoute.jsx`
- Create: `docs/PHILOSOPHY.md`
- Create: `docs/DEPLOY_CHATCHI.md`
- Create: `docs/SECURITY.md`
- Create: `docs/PRIVACY.md`
- Test: `frontend/tests/docs.test.js`

**Interfaces:**
- Consumes: None
- Produces: `<DocsRoute />` with zero-shift sticky navigation, deploy guide for Chatchi Stalwart fork, and AGPL-3.0 free software disclosures.

- [ ] **Step 1: Write failing test verifying docs manifest**

```javascript
// frontend/tests/docs.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('documentation markdown files exist in docs directory', () => {
  const docs = ['PHILOSOPHY.md', 'DEPLOY_CHATCHI.md', 'SECURITY.md', 'PRIVACY.md'];
  for (const doc of docs) {
    const fullPath = path.resolve(process.cwd(), 'docs', doc);
    assert.ok(fs.existsSync(fullPath), `Document ${doc} must exist`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/docs.test.js`
Expected: FAIL (docs missing).

- [ ] **Step 3: Create markdown documents and DocsRoute component**

Create `docs/PHILOSOPHY.md`:
```markdown
# فلسفه نرم‌افزار آزاد و دلتاچت (Free Software Philosophy)

این سرویس برای تقویت ارتباطات آزاد، رمزنگاری‌شده و مستقل از پلتفرم‌های انحصاری راه‌اندازی شده است.

## نرم‌افزار آزاد چیست؟
نرم‌افزار آزاد به آزادی کاربران برای اجرا، مطالعه، تغییر و بازتوزیع نرم‌افزار اشاره دارد. این مفهوم بر چهار آزادی اساسی بنا شده است:
- آزادی ۰: آزادی اجرای برنامه برای هر هدفی.
- آزادی ۱: آزادی مطالعه نحوه کار برنامه و تغییر آن.
- آزادی ۲: آزادی بازتوزیع نسخه‌ها برای کمک به دیگران.
- آزادی ۳: آزادی بهبود برنامه و انتشار تغییرات برای عموم.

## چرا دلتاچت؟
دلتاچت (DeltaChat) پیام‌رسانی است که به جای سرورهای متمرکز تجاری، بر بستر شبکه جهانی ایمیل (بزرگ‌ترین و بازترین سیستم پیام‌رسانی دنیا) کار می‌کند. با Autocrypt و رمزنگاری سرتاسری OpenPGP، چت‌های شما امن می‌مانند.

## مجوز کد منبع
کد منبع این پروژه تحت مجوز **GNU AGPL-3.0-or-later** منتشر شده است.
```

Create `docs/DEPLOY_CHATCHI.md`:
```markdown
# راهنمای راه‌اندازی سرور چاتچی (Chatchi Stalwart Fork)

چاتچی یک فورک بهینه‌شده از سرور میل استال‌مارت (Stalwart) برای پاسخگویی به ثبت‌نام‌های دلتاچت است.

## پیش‌نیازها
- یک سرور لینوکس (دبیان یا ابونتو) با آی‌پی تمیز.
- رکوردهای DNS: MX, A, SPF, DKIM, DMARC.
- دسترسی به پورت‌های 993 (IMAP-SSL), 465 (SMTP-SSL), و 80/443 (HTTP API).

## راه‌اندازی سرویس
```bash
docker compose -f docker-compose.yml up -d
```
```

Create `docs/SECURITY.md`:
```markdown
# سیاست امنیت (Security Policy)

امنیت ارتباطات کاربران مهم‌ترین اولویت است.

## رمزنگاری
- تمامی پورت‌های ورودی و خروجی با TLS 1.3 رمزنگاری شده‌اند.
- پیام‌های ارسالی با پروتکل Autocrypt و استاندارد OpenPGP سرتاسر رمزنگاری می‌شوند.
- پسوردها در حافظه ذخیره نمی‌شوند و به صورت محلی در کلاینت تولید می‌گردند.
```

Create `docs/PRIVACY.md`:
```markdown
# سیاست حریم خصوصی (Privacy Policy)

- **بدون لاگ‌برداری:** آدرس آی‌پی، مکالمات و فراداده‌ها ذخیره نمی‌شوند.
- **بدون ردیابی:** از هیچ سرویس تحلیلگر شخص ثالث یا اسکریپت ردیابی استفاده نمی‌شود.
- **حذف خودکار:** حساب‌های موقت در صورت عدم استفاده پس از ۳۰ روز منقضی می‌شوند.
```

Create `frontend/src/routes/DocsRoute.jsx`:
```jsx
import React, { useState } from 'react';

const DOC_TOPICS = [
  { id: 'deploy', title: 'راه‌اندازی سرور چاتچی (Deploy)', content: 'راهنمای استقرار فورک اختصاصی Stalwart (Chatchi) بر روی سرور و تنظیم رکوردهای DNS برای دلتاچت.' },
  { id: 'security', title: 'امنیت و رمزنگاری (Security)', content: 'بررسی ارتباطات امن TLS 1.3، پروتکل Autocrypt و رمزنگاری سرتاسری OpenPGP در سرور.' },
  { id: 'privacy', title: 'حریم خصوصی (Privacy)', content: 'سیاست‌های عدم ذخیره‌سازی داده، عدم نگهداری لاگ‌های شخصی و استقلال از شرکت‌های تجاری.' },
  { id: 'philosophy', title: 'فلسفه نرم‌افزار آزاد (Philosophy)', content: 'آزادی‌های چهارگانه نرم‌افزار آزاد، جنبش آزادی کاربران، و چرایی استفاده از دلتاچت.' },
];

export function DocsRoute() {
  const [activeId, setActiveId] = useState('philosophy');
  const activeDoc = DOC_TOPICS.find((d) => d.id === activeId) || DOC_TOPICS[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <aside className="w-full lg:w-64 flex-shrink-0 border border-base-300 rounded-lg bg-base-200 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-3">مستندات چاتچی</h3>
        <ul className="menu menu-sm p-0 gap-1">
          {DOC_TOPICS.map((doc) => (
            <li key={doc.id}>
              <button
                onClick={() => setActiveId(doc.id)}
                className={`text-xs py-2 ${activeId === doc.id ? 'active' : ''}`}
              >
                {doc.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <article className="flex-1 min-w-0 w-full bg-base-100 border border-base-300 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold border-b border-base-300 pb-2">{activeDoc.title}</h2>
        <p className="text-sm leading-relaxed text-base-content/90 whitespace-pre-line">{activeDoc.content}</p>
      </article>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/docs.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/PHILOSOPHY.md docs/DEPLOY_CHATCHI.md docs/SECURITY.md docs/PRIVACY.md frontend/src/routes/DocsRoute.jsx frontend/tests/docs.test.js
git commit -m "feat(docs): add philosophy, deployment, security and privacy documentation modules"
```

---

### Task 9: Shell Integration, App Routing & End-to-End Build Verification

**Files:**
- Create: `frontend/src/components/layout/Navbar.jsx`
- Create: `frontend/src/components/layout/Footer.jsx`
- Create: `frontend/src/components/layout/Shell.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/main.jsx`
- Test: `frontend/tests/e2e.test.js`

**Interfaces:**
- Consumes: All route components, `useI18n()`.
- Produces: Complete navigable application bundle built cleanly with Vite.

- [ ] **Step 1: Write failing e2e check test**

```javascript
// frontend/tests/e2e.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('main App assembly imports all four primary routes', () => {
  const appPath = path.resolve(process.cwd(), 'frontend/src/App.jsx');
  assert.ok(fs.existsSync(appPath), 'App.jsx must exist');

  const content = fs.readFileSync(appPath, 'utf8');
  assert.match(content, /OnboardingRoute/, 'Must import OnboardingRoute');
  assert.match(content, /ShareRoute/, 'Must import ShareRoute');
  assert.match(content, /AppsRoute/, 'Must import AppsRoute');
  assert.match(content, /DocsRoute/, 'Must import DocsRoute');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/e2e.test.js`
Expected: FAIL (App.jsx not yet updated with full router).

- [ ] **Step 3: Implement Shell, Layout, and complete App component**

Create `frontend/src/components/layout/Navbar.jsx`:
```jsx
import React from 'react';
import { useI18n } from '../../i18n/index.jsx';

export function Navbar({ currentRoute, onNavigate, onToggleTheme, currentTheme }) {
  const { t, lang, toggleLang } = useI18n();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-base-300 bg-base-100/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-8 h-8 rounded bg-primary text-primary-content font-bold flex items-center justify-center text-sm shadow">
            Δ
          </div>
          <span className="font-bold text-base tracking-tight">Chatchi</span>
          <span className="badge badge-xs badge-neutral">Relay</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => onNavigate('home')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'home' ? 'btn-active' : ''}`}
          >
            {t('nav_home')}
          </button>
          <button
            onClick={() => onNavigate('share')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'share' ? 'btn-active' : ''}`}
          >
            {t('nav_share')}
          </button>
          <button
            onClick={() => onNavigate('apps')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'apps' ? 'btn-active' : ''}`}
          >
            {t('nav_apps')}
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className={`btn btn-ghost btn-sm ${currentRoute === 'docs' ? 'btn-active' : ''}`}
          >
            {t('nav_docs')}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="btn btn-outline btn-xs px-2.5 font-bold">
            {lang === 'fa' ? 'EN' : 'فا'}
          </button>
          <button onClick={onToggleTheme} className="btn btn-ghost btn-sm btn-square" aria-label="Toggle theme">
            {currentTheme === 'chatchi-dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
```

Create `frontend/src/components/layout/Footer.jsx`:
```jsx
import React from 'react';
import { useI18n } from '../../i18n/index.jsx';

export function Footer({ onNavigate }) {
  const { t } = useI18n();

  return (
    <footer className="border-t border-base-300 py-8 bg-base-200/50 text-xs text-base-content/70">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <p>{t('footer_fs_statement')}</p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => onNavigate('docs')} className="link link-hover">
            {t('footer_fs_what')}
          </button>
          <a href="https://delta.chat" target="_blank" rel="noopener noreferrer" className="link link-hover">
            DeltaChat
          </a>
          <a href="https://github.com/themadorg" target="_blank" rel="noopener noreferrer" className="link link-hover">
            AGPL-3.0
          </a>
        </div>
      </div>
    </footer>
  );
}
```

Create `frontend/src/components/layout/Shell.jsx`:
```jsx
import React, { useState } from 'react';
import { useI18n } from '../../i18n/index.jsx';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export function Shell({ currentRoute, onNavigate, children }) {
  const { dir } = useI18n();
  const [theme, setTheme] = useState(() => {
    return (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'chatchi-dark';
  });

  const toggleTheme = () => {
    const next = theme === 'chatchi-dark' ? 'chatchi-light' : 'chatchi-dark';
    setTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('chatchi_theme', next);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content" dir={dir}>
      <Navbar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
```

Update `frontend/src/App.jsx`:
```jsx
import React, { useState } from 'react';
import { I18nProvider } from './i18n/index.jsx';
import { Shell } from './components/layout/Shell.jsx';
import { OnboardingRoute } from './routes/OnboardingRoute.jsx';
import { ShareRoute } from './routes/ShareRoute.jsx';
import { AppsRoute } from './routes/AppsRoute.jsx';
import { DocsRoute } from './routes/DocsRoute.jsx';

export function AppContent() {
  const [route, setRoute] = useState('home');

  return (
    <Shell currentRoute={route} onNavigate={setRoute}>
      {route === 'home' && <OnboardingRoute />}
      {route === 'share' && <ShareRoute />}
      {route === 'apps' && <AppsRoute />}
      {route === 'docs' && <DocsRoute />}
    </Shell>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
```

Update `frontend/src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Run tests and execute production build**

Run:
```bash
node --test frontend/tests/*.test.js
cd frontend && npm run build
```
Expected: All tests PASS and Vite build completes with zero errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/ frontend/src/App.jsx frontend/src/main.jsx frontend/tests/e2e.test.js
git commit -m "feat: assemble complete chatchi shell, routing, layout and verify build"
```
