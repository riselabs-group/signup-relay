# MailiaM Portal

Decoupled, zero-dependency Delta Chat onboarding portal, share card generator, and WebXDC app catalog powered by React, Vite, TypeScript, and Tailwind CSS.

---

## Highlights

- **Instant Onboarding:** Client-side account provisioning with real-time `dclogin:` URI scheme and QR code generation for Delta Chat.
- **Client-Side Cryptography:** Password hashing executed in-browser using WebAssembly (Argon2id / SHA-256 via `hash-wasm`); plain text passwords never traverse the network or appear in server access logs.
- **Bot Mitigation:** Non-intrusive Altcha Proof-of-Work (`ALTCHA`) widget for bot defense without third-party tracking.
- **Delta Chat Share Cards (`/share.html`):** Dynamic contact cards, custom invite QR codes, deep links (`deltachat://contact/...`), and vCard downloads.
- **WebXDC App Catalog (`/apps.html`):** Integrated micro-app store for Delta Chat with one-click installation triggers.
- **Embedded Client Documentation (`/docs.html`):** Built-in guides for Free Software Philosophy, Server Deployment, Security Policy, and Privacy.
- **Dual-Mode Operation:** Built-in `mockService` provides full offline local development without running an external mail server.
- **Bilingual & Responsive:** Symmetric English (LTR) and Persian (RTL) localization with self-hosted variable typography (`Vazirmatn`, `InterVariable`, `JetBrainsMono`).

---

## Architecture Overview

```text
Browser / Client (React 19 + TypeScript + WASM)
  ├─ Argon2id / SHA-256 client password hashing
  ├─ Altcha PoW verification
  ├─ Delta Chat dclogin: QR code builder
  └─ Multi-route static entrypoints (index, share, apps, docs)
         │
         ├── [Default: AUTO_FALLBACK] ──> Mock Service (Offline / Zero Setup)
         │
         └── [Live Backend] ── HTTP /api/v1 ──> MailiaM Stalwart Fork (:8080)
                                                   ├─ /config
                                                   ├─ /altcha/challenge
                                                   ├─ /accounts/instant
                                                   ├─ /accounts/custom
                                                   └─ /apps
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm run install:frontend
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The frontend runs with `AUTO_FALLBACK` enabled by default, falling back smoothly to mock data when no backend is listening on port 8080.

### 3. Run Test Suite
```bash
npm test
npm run typecheck
```

### 4. Build for Production
```bash
npm run build
```
Build output is generated into `frontend/dist/` with four distinct HTML entrypoints:
- `index.html` — Main onboarding flow
- `share.html` — Delta Chat invite card generator
- `apps.html` — WebXDC application directory
- `docs.html` — Interactive markdown documentation viewer

---

## Environment Configuration

Configure frontend behavior using `.env` or Vite environment variables in `frontend/`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_SERVICE_MODE` | API dispatch mode (`AUTO_FALLBACK`, `FORCE_MOCK`, `FORCE_PROD`) | `AUTO_FALLBACK` |
| `VITE_API_BASE_URL` | Base URL of the live MailiaM / Stalwart HTTP API | Proxied to `http://localhost:8080/api/v1` |
| `VITE_DOMAIN` | Fallback mail domain when backend is unavailable | `chatchi.org` |

---

## Project Structure

```text
├── frontend/
│   ├── index.html            # Main onboarding landing page
│   ├── share.html            # Delta Chat share card entrypoint
│   ├── apps.html             # WebXDC app catalog entrypoint
│   ├── docs.html             # Documentation entrypoint
│   ├── src/
│   │   ├── api/              # API registry, endpoints, and resilient HTTP client
│   │   ├── components/       # UI components (onboarding, share, apps, layout)
│   │   ├── i18n/             # English and Persian translations
│   │   ├── routes/           # Route views for all four entrypoints
│   │   ├── services/         # Dispatcher, mockService, and prodService
│   │   └── utils/            # QR generation, dclogin URIs, WASM hashing, Altcha
│   ├── tests/                # 76-suite node test runner suite
│   ├── vite.config.ts        # Multi-page Vite configuration with API proxy
│   └── tailwind.config.js    # DaisyUI + custom MailiaM dark/light themes
├── docs/                     # Specifications, deployment guides, and threat model
│   ├── CHATCHI_BACKEND_API_SPEC.md   # MailiaM Stalwart Fork REST contract
│   ├── DEPLOY_CHATCHI.md             # Production Stalwart deployment guide
│   ├── CENTRAL_API_SPEC.md           # Central API specification
│   ├── PHILOSOPHY.md                 # Free software and Delta Chat philosophy
│   ├── SECURITY.md                   # Cryptography and transport security
│   └── PRIVACY.md                    # Privacy policy and data retention
└── package.json              # Monorepo root scripts
```

---

## Reference Documentation

- [MailiaM Backend API Specification](docs/CHATCHI_BACKEND_API_SPEC.md)
- [Stalwart Server Deployment Guide](docs/DEPLOY_CHATCHI.md)
- [Decoupling & Migration Roadmap](docs/DECOUPLING_ROADMAP.md)
- [Central API Specification](docs/CENTRAL_API_SPEC.md)
