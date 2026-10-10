# Architecture & Technical Design Specification: Chatchi (DeltaChat & Stalwart Onboarding Portal)

- **Date:** 2026-10-11
- **Status:** Approved for Implementation
- **Target Subsystem:** `frontend/` (React + Tailwind CSS + DaisyUI), `docs/`, and Backend API Specification for Stalwart Fork ("Chatchi")
- **Reference Codebases:** `../dc.tabarestangnu.ir` & `../delta.sudoshz.ir`

---

## 1. Executive Summary & Objectives

The goal is to transform `signup-relay` into **Chatchi**, a mature, production-grade onboarding and documentation portal for the DeltaChat ecosystem backed by a custom Stalwart mail server fork ("Chatchi").

### Key Principles
1. **Mature Real-World Design:** Built on Tailwind CSS + DaisyUI with restrained, high-contrast themes (`chatchi-dark` and `chatchi-light`). Strictly rejects low-contrast "AI-slop" (excessive neon glows, chaotic glassmorphism, jittery hover effects).
2. **Instant "Fast-to-Account" Onboarding:** A pure 1-click client-side account generator providing instant DeltaChat connection via `dclogin:` QR code and deep-link schemes, complemented by a tabbed Custom Account wizard (username/password, Altcha Proof-of-Work, and step-by-step progress tracking).
3. **Decoupled Service Strategy (Mock vs. Production):** Pluggable service layer driven by `AUTO_FALLBACK`, `FORCE_MOCK`, and `FORCE_PROD` modes that operate identically in both development and production environments.
4. **Zero Layout Shifts (CLS = 0) & Anti-FOUT:** Strictly dimensioned media slots, locked multi-step wizard heights, CSS logical properties, and inline pre-DOM theme initializers to guarantee zero visual jumps.
5. **Full WebXDC Store & Docs Hub:** Integrating mobile WebView deep-link navigation fixes from `dc.tabarestangnu.ir`, an interactive `/share` card generator, and a comprehensive multilingual (FA/EN) documentation suite covering Chatchi deployment, security, privacy, and free software philosophy.

---

## 2. System Architecture & Directory Hierarchy

```text
signup-relay/
├── docs/
│   ├── superpowers/specs/
│   │   └── 2026-10-11-chatchi-portal-design.md    # This specification
│   ├── CHATCHI_BACKEND_API_SPEC.md                 # Stalwart fork API contract
│   ├── DEPLOY_CHATCHI.md                           # Stalwart deployment guide
│   ├── PRIVACY.md                                  # Privacy disclosure
│   ├── SECURITY.md                                 # Security policy
│   └── PHILOSOPHY.md                               # Free software principles (نرم‌افزار آزاد)
└── frontend/
    ├── index.html                                  # Anti-FOUT & Anti-CLS baseline
    ├── tailwind.config.js                          # DaisyUI theme definition
    └── src/
        ├── api/
        │   ├── client.js                           # Fetch transport, timeout, Idempotency-Key
        │   └── endpoints.js                        # API URL constants
        ├── services/
        │   ├── types.js                            # Unified service contract (TypeScript / JSDoc)
        │   ├── config.js                           # SERVICE_MODE & API_BASE_URL resolution
        │   ├── prodService.js                      # HTTP calls against Chatchi API
        │   ├── mockService.js                      # Deterministic offline mock implementation
        │   └── index.js                            # Transparent Proxy with AUTO_FALLBACK
        ├── hooks/
        │   ├── useOnboarding.js                    # Wizard state & credential validation
        │   ├── useAltcha.js                        # Altcha challenge fetching & worker PoW
        │   ├── useWebxdcStore.js                   # Store querying, search & WebView installation
        │   └── useClipboard.js                     # Async clipboard copy with toast notifications
        ├── components/
        │   ├── layout/
        │   │   ├── Shell.jsx                       # Responsive container, header, footer, bidi
        │   │   ├── Navbar.jsx                      # Navigation, language & theme toggles
        │   │   └── Footer.jsx                      # Community links, licenses, AGPL notice
        │   ├── onboarding/
        │   │   ├── InstantQrCard.jsx               # 1-Click QR generator & deep-link buttons
        │   │   ├── CustomWizard.jsx                # Step-by-step progress & custom form
        │   │   ├── StepProgress.jsx                # DaisyUI steps component
        │   │   ├── AltchaWidget.jsx                # Challenge verification box
        │   │   └── ManualInstructions.jsx          # Android / iOS manual setup guides
        │   ├── share/
        │   │   └── ShareCard.jsx                   # Contact card preview, slug & invite QR
        │   ├── apps/
        │   │   ├── AppGrid.jsx                     # WebXDC app catalog
        │   │   ├── AppCard.jsx                     # Single app card with metadata & size
        │   │   └── AppModal.jsx                    # Modal dialog with absolute-link install
        │   └── docs/
        │       ├── DocsSidebar.jsx                 # Zero-shift sticky navigation
        │       └── DocViewer.jsx                   # DaisyUI prose content renderer
        ├── routes/
        │   ├── OnboardingRoute.jsx                 # Route: /
        │   ├── ShareRoute.jsx                      # Route: /share
        │   ├── AppsRoute.jsx                       # Route: /apps
        │   └── DocsRoute.jsx                       # Route: /docs and /docs/:slug
        ├── i18n/
        │   ├── en.js                               # English translations & LTR config
        │   ├── fa.js                               # Persian translations & RTL config
        │   └── index.jsx                           # Lightweight translation context
        ├── App.jsx                                 # Router mount & shell integration
        └── main.jsx                                # Application entry point
```

---

## 3. Account Provisioning & Onboarding Specifications

### 3.1 Flow Comparison & Tabbed Container
The root route (`/`) presents a unified tabbed card:
- **Tab 1: Instant Setup (سریع)** — Default view. Zero network roundtrip. Generates high-entropy credentials locally and renders the DeltaChat QR code within milliseconds.
- **Tab 2: Custom Account (شخصی‌سازی)** — For users wanting a specific username, password, Altcha proof-of-work validation, and step-by-step progress feedback.

### 3.2 The `dclogin:` Generation Algorithm
Implemented in `src/services/accountService.js`:
1. **Random Credentials:**
   - Username: 12 alphanumeric characters generated via `window.crypto.getRandomValues()`.
   - Password: 24 alphanumeric characters generated via `window.crypto.getRandomValues()`.
   - Domain: Injected from `config.DOMAIN` (e.g., `chatchi.org`).
2. **URI Construction:**
   ```javascript
   const dcloginUrl = `dclogin:${email}/?p=${encodeURIComponent(password)}&v=1&ih=${imapHost}&ip=${imapPort}&is=${imapSecurity}&sh=${smtpHost}&sp=${smtpPort}&ss=${smtpSecurity}&ic=3`;
   ```
   - Default ports: IMAP `993` (`ssl`), SMTP `465` (`ssl`).
   - Fallback ports: IMAP `143` (`starttls`), SMTP `587` (`starttls`).

### 3.3 Native App Launch & Deep-Link Fallback Detection
DeltaChat opens via `window.location.href = dcloginUrl`. Because browsers do not expose synchronous protocol handler registries:
```javascript
export function openDeltaChatApp(dcloginUrl, onNotInstalled) {
  let appOpened = false;
  const timeoutMs = 2000;

  const handleBlur = () => { appOpened = true; cleanup(); };
  const handleVisibility = () => { if (document.hidden) { appOpened = true; cleanup(); } };

  function cleanup() {
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('visibilitychange', handleVisibility);
  }

  window.addEventListener('blur', handleBlur, { once: true });
  document.addEventListener('visibilitychange', handleVisibility, { once: true });

  window.location.href = dcloginUrl;

  setTimeout(() => {
    cleanup();
    if (!appOpened) {
      onNotInstalled(); // Reveals inline banner with direct download links
    }
  }, timeoutMs);
}
```

### 3.4 Manual & iOS Instructions
- **Android / Desktop:**
  1. Open DeltaChat &rarr; *Add Account* &rarr; *Use Other Server*.
  2. Tap *Scan Invitation Code* &rarr; *Paste from clipboard*.
- **iOS Specialization:**
  - Dedicated copy button with instruction badge: `New Account > Use Other Server > Scan > Paste`.
  - Explains iOS system sandbox constraints clearly without technical jargon.

---

## 4. WebXDC App Store (`/apps`) & Native WebView Fix

### 4.1 Root Cause & The Same-Window Fix
In DeltaChat for Android and iOS, in-app browser WebViews lack window-opener managers. Clicking `<a href="..." target="_blank">` or `<a download>` fails silently.
- **Solution (derived from `dc.tabarestangnu.ir`):**
  Top-level, same-window navigation using `window.location.assign(absoluteHttpsUrl)`. This triggers the host application's `shouldOverrideUrlLoading` (Android) and `WKNavigationDelegate` (iOS) to intercept the `.xdc` MIME package and attach it directly to the active chat.

```javascript
export function installWebxdcApp(event, appRelPath) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const absoluteUrl = new URL(appRelPath, window.location.origin).href;
  window.location.assign(absoluteUrl);
}
```

### 4.2 Security Notice Banner
Prominently features the free software warning from the reference portals:
- Code execution warning (sandboxed on-device execution).
- Network access notice (potential IP exposure for network-enabled apps).
- Unknown sender caution (never open `.xdc` files from untrusted sources).

---

## 5. Share ID Generator (`/share`)

Replicates and enhances `delta.sudoshz.ir/share.html`:
- **Input Controls:** Display name, username, and email/DeltaChat address.
- **Live Vector Card:** Responsive 400×250 card displaying the user avatar, name, and generated QR code representing their DeltaChat invite URI (`https://i.delta.chat/#...` or `OPENPGP4FPR:...`).
- **Export Actions:**
  - Copy invite link to clipboard with feedback toast.
  - Native Web Share API (`navigator.share`) trigger on supported mobile devices.
  - Export card badge as PNG/SVG.

---

## 6. Service Layer & Dual Mock/Production Strategy

### 6.1 Configuration Constants (`src/services/config.js`)
```javascript
export const SERVICE_CONFIG = {
  MODE: import.meta.env.VITE_SERVICE_MODE || 'AUTO_FALLBACK', // 'FORCE_MOCK' | 'FORCE_PROD' | 'AUTO_FALLBACK'
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://delta.chatchi.org/api/v1',
  TIMEOUT_MS: 10000,
};
```

### 6.2 Proxy Strategy with Non-Intrusive Failover (`src/services/index.js`)
```javascript
import { SERVICE_CONFIG } from './config.js';
import { prodService } from './prodService.js';
import { mockService } from './mockService.js';

function createServiceDispatcher() {
  if (SERVICE_CONFIG.MODE === 'FORCE_MOCK') return mockService;
  if (SERVICE_CONFIG.MODE === 'FORCE_PROD') return prodService;

  // AUTO_FALLBACK: Attempts production API; falls back to mock upon network failure or 5xx outage
  return new Proxy(prodService, {
    get(target, prop) {
      if (typeof target[prop] !== 'function') return target[prop];
      return async (...args) => {
        try {
          return await target[prop](...args);
        } catch (error) {
          // Pass 4xx validation and conflict errors through to UI
          if (error.status && error.status >= 400 && error.status < 500) {
            throw error;
          }
          console.warn(`[Chatchi Service] Live API unavailable (${error.message}). Dispatching to Mock Service.`);
          return mockService[prop](...args);
        }
      };
    },
  });
}

export const service = createServiceDispatcher();
```

---

## 7. Security Architecture & Threat Mitigations

1. **`dclogin:` Credential Isolation:**
   - Plaintext passwords and `dclogin:` strings are **never** rendered into static `<a href>` DOM nodes where extensions or scrapers can inspect them.
   - QR code generation is performed strictly in-memory using client-side canvas/SVG libraries.
   - Form passwords and confirmation states are explicitly zeroed out in React state immediately upon successful account provisioning.
   - Added `<meta name="referrer" content="no-referrer" />` to `index.html`.
2. **Altcha Proof-of-Work Hardening:**
   - Challenges must be bound to a server-side timestamped salt (`<timestamp>:<random_hex>`) with a maximum 120-second validity window.
   - Backend enforces atomic replay checks (`SET altcha:consumed:<hash> 1 EX 120 NX` in Redis/cache).
   - Altcha computation on the frontend executes inside a dedicated Web Worker to prevent UI thread lockup.
3. **Strict Content Security Policy (CSP):**
   ```http
   Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.chatchi.org; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self';
   ```
4. **Rate Limiting & Tiered Abuse Prevention:**
   - Instant Account endpoint: Max 2 registrations per 15 minutes per `/24` IPv4 subnet.
   - Custom Account endpoint: Max 5 registrations per 15 minutes per `/24` IPv4 subnet.
   - Global cluster circuit breaker: If registrations exceed 60/min, throttle with `429 Too Many Requests` (`Retry-After: 60`).

---

## 8. UX, Accessibility (WCAG 2.1 AA) & Layout Stability (CLS = 0)

1. **Zero Layout Shifts (CLS = 0):**
   - QR code preview slot has an explicit, reserved aspect ratio (`w-56 h-56` / `min-h-[14rem]`).
   - The multi-step wizard card enforces a fixed minimum container height (`min-h-[460px]`) across step transitions.
   - `html { scrollbar-gutter: stable both-edges; }` prevents horizontal shifts upon scrollbar appearance.
2. **Anti-FOUT (Flash of Unstyled Theme):**
   - An inline blocking script inside `<head>` reads `localStorage.getItem('chatchi_theme')` or `prefers-color-scheme` and applies `data-theme` to `<html>` prior to body parsing.
3. **Bilingual RTL/LTR & BiDi Isolation:**
   - Persian text uses `Vazirmatn` with line-height `1.75` (preventing diacritic clipping). English uses `Inter`.
   - Technical literals, ports, email addresses, and `dclogin` strings are isolated with `<bdi dir="ltr">` and `unicode-bidi: isolate` to prevent bidirectional punctuation jumping.
   - Western Arabic digits (`0-9`) are strictly maintained for credentials, protocols, and ports so DeltaChat parsers never choke on Persian numerals.
4. **WCAG 2.1 AA Contrast:**
   - Minimum text contrast ratio of 7:1 against card backgrounds.
   - Primary interactive touch targets meet or exceed 48×48px.
   - QR code includes descriptive `alt` tags and is always paired with primary text copy actions.

---

## 9. DaisyUI Theme Specification (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="chatchi-dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        'chatchi-light': {
          primary: '#1b693a',           // DeltaChat forest green
          'primary-content': '#ffffff',
          secondary: '#334155',         // Slate-700
          'secondary-content': '#ffffff',
          accent: '#0d9488',            // Teal-600
          neutral: '#0f172a',           // Slate-900
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
          primary: '#22c55e',           // Emerald-500
          'primary-content': '#052e16',
          secondary: '#94a3b8',         // Slate-400
          'secondary-content': '#0f172a',
          accent: '#14b8a6',            // Teal-500
          neutral: '#1e293b',           // Slate-800
          'neutral-content': '#f1f5f9',
          'base-100': '#0b0f17',        // Deep Charcoal/Slate
          'base-200': '#111827',        // Gray-900
          'base-300': '#1f2937',        // Gray-800 divider
          'base-content': '#f3f4f6',    // Gray-100
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

---

## 10. Chatchi Backend API Specification (`docs/CHATCHI_BACKEND_API_SPEC.md`)

The backend for the custom Stalwart fork ("Chatchi") exposes the following RESTful API:

### 10.1 Health & Discovery
- **`GET /api/v1/health`**
  - **Response 200:** `{ "status": "ok", "version": "1.0.0", "uptime": 128400 }`
- **`GET /api/v1/config`**
  - **Response 200:**
    ```json
    {
      "domain": "chatchi.org",
      "registration_open": true,
      "instant_account_allowed": true,
      "imap": { "host": "mail.chatchi.org", "port": 993, "security": "ssl" },
      "smtp": { "host": "mail.chatchi.org", "port": 465, "security": "ssl" },
      "altcha": { "required": true, "max_number": 500000 }
    }
    ```

### 10.2 Bot Protection (Altcha)
- **`GET /api/v1/altcha/challenge`**
  - **Response 200:**
    ```json
    {
      "algorithm": "SHA-256",
      "challenge": "a6b7c8d9e0f...",
      "salt": "1760130000:abc123def456",
      "signature": "3f4a5b6c..."
    }
    ```

### 10.3 Account Provisioning
- **`POST /api/v1/accounts/instant`**
  - **Headers:** `Idempotency-Key: <UUID>`
  - **Body:** `{}` (or optional Altcha payload under high load)
  - **Response 201:**
    ```json
    {
      "email": "user_xyz123@chatchi.org",
      "password": "generated_secret_string",
      "dclogin_link": "dclogin:user_xyz123@chatchi.org/?p=...&v=1&...",
      "account_type": "instant",
      "expires_at": "2026-11-10T00:00:00Z"
    }
    ```
- **`POST /api/v1/accounts/custom`**
  - **Headers:** `Idempotency-Key: <UUID>`
  - **Body:**
    ```json
    {
      "username": "custom_user",
      "password": "StrongPassword123!",
      "altcha_payload": "base64_altcha_solution"
    }
    ```
  - **Response 201:**
    ```json
    {
      "email": "custom_user@chatchi.org",
      "dclogin_link": "dclogin:custom_user@chatchi.org/?p=...&v=1&...",
      "account_type": "custom"
    }
    ```
  - **Error Responses:**
    - `400 Bad Request`: `{ "error": "validation_error", "message": "Password too weak or Altcha challenge invalid" }`
    - `409 Conflict`: `{ "error": "username_taken", "message": "Username already exists" }`
    - `429 Too Many Requests`: `{ "error": "rate_limited", "retry_after": 60 }`

### 10.4 WebXDC Catalog
- **`GET /api/v1/apps`**
  - **Response 200:**
    ```json
    {
      "apps": [
        {
          "app_id": "com.example.chess",
          "name": "Chess WebXDC",
          "version": "1.4.2",
          "description": "Play chess asynchronously in DeltaChat.",
          "size": 450000,
          "icon_url": "/apps/xdcstore/icons/chess.png",
          "download_url": "/apps/xdcstore/packages/chess.xdc",
          "source_url": "https://github.com/webxdc/chess"
        }
      ]
    }
    ```

---

## 11. Verification & Automated Self-Checks

1. **Service Mode Test (`test_service_mode.js`):**
   - Verifies `mockService` returns valid DTO structures matching `types.js`.
   - Verifies `AUTO_FALLBACK` proxy intercepts connection failure and falls back without throwing unhandled exceptions.
2. **`dclogin` URL & QR Validator:**
   - Validates that generated URLs strictly match RFC 3986 encoding and DeltaChat's expected query parameters.
3. **Build & Bundle Check:**
   - `npm run build` succeeds cleanly with zero bundle errors, unresolved imports, or circular dependencies.
4. **CLS & Accessibility Audit:**
   - Verifies that zero image, iframe, or dynamic component mounts without pre-allocated CSS dimensions.
