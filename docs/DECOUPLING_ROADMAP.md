# Frontend Decoupling & Central API Migration Roadmap

## Overview & Goal
The objective is to isolate and decouple the frontend (`/frontend`) from the local Django backend (`/backend`), enabling it to communicate with an external Central API while:
1. Retaining the complete `/backend` codebase as a living reference and business-logic specification.
2. Providing a clean, pluggable, type-safe / schema-aligned API client layer in the frontend.
3. Enabling zero-dependency frontend local development through integrated mock/fallback modes.

---

## Skills & Principles Applied (skills.sh Index)
- **`mattpocock/skills/codebase-design` & `design-an-interface`**: Interface segregation and explicit contracts between UI components and network transport.
- **`mattpocock/skills/implement-spec`**: Clear request/response contract matching between client and central API.
- **`vercel-labs/agent-skills/vercel-react-best-practices`**: Resilient data fetching, abort controllers, declarative error boundaries, and environment isolation.

---

## 4-Phase Implementation Roadmap

```
+-------------------------------------------------------------------------------+
| PHASE 1: API Specification & Contract Definition                             |
|  - Define Central API endpoint schemas and payload shapes                    |
|  - Define unified error models and idempotency contracts                      |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| PHASE 2: Frontend API Client Layer (Decoupling)                               |
|  - Create frontend/src/api/ adapter module                                    |
|  - Standardize error parsing, headers, and request timeouts                   |
|  - Implement client-side fallback/mock mode for standalone frontend dev       |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| PHASE 3: Frontend UI Refactor & Integration                                   |
|  - Replace inline fetch calls in main.jsx with API client service methods     |
|  - Add dynamic environment configuration (VITE_CENTRAL_API_URL)               |
|  - Verify RTL/LTR localization, dark theme, and form validation flows         |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| PHASE 4: Verification & Standalone Build Check                                |
|  - Validate production bundle builds (`npm run build`)                        |
|  - Run self-checks on API client mocking & response parsing                   |
+-------------------------------------------------------------------------------+
```

---

## Step-by-Step Specification

### Step 1: Central API Contract Specification (`docs/CENTRAL_API_SPEC.md`)
- **Endpoints**:
  - `GET /config`: Returns `{ domain: string, registration_open: boolean }`
  - `GET /blog`: Returns list of published blog articles `{ results: BlogPost[] }`
  - `POST /signup`: Provisions mailbox `{ username, password, password_confirmation, accept_terms }`
- **Headers**:
  - `Content-Type: application/json`
  - `Idempotency-Key: <UUID>`

### Step 2: Frontend API Adapter Architecture (`frontend/src/api/`)
- Directory structure:
  - `frontend/src/api/config.js` -> Environment URL resolution & timeout settings.
  - `frontend/src/api/client.js` -> Core HTTP transport wrapper with error normalization.
  - `frontend/src/api/services.js` -> Domain service methods (`fetchConfig`, `fetchBlogPosts`, `registerAccount`).
  - `frontend/src/api/mock.js` -> Seamless offline / development mock data fallback.

### Step 3: Frontend UI Integration
- Cleanly connect `frontend/src/main.jsx` to `frontend/src/api/services.js`.
- Remove hardcoded URLs and inline `fetch` logic from React view components.

### Step 4: Verification
- Execute Vite build to guarantee zero broken imports or build regressions.
