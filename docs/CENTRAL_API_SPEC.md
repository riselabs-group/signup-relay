# Central API Specification & Contract

## 1. Overview
This document specifies the HTTP REST contract expected by the `signup-relay` frontend when communicating with the external Central API.

All requests accept `application/json` and return JSON payloads.

---

## 2. Global Headers
- `Content-Type: application/json`
- `Accept: application/json`
- `Idempotency-Key: <UUID>`: Sent on mutating requests (e.g. signup) to guarantee safe retries without duplicate mailbox creation.

---

## 3. Endpoints

### 3.1. System & Domain Configuration
Retrieves public relay configuration and default domain settings.

- **URL**: `/config/` or `/api/v1/config/`
- **Method**: `GET`
- **Authentication**: None (Public)
- **Response `200 OK`**:
```json
{
  "domain": "riseai.com",
  "registration_open": true,
  "supported_domains": ["riseai.com", "relay.rise.org"]
}
```

---

### 3.2. Account Signup / Mailbox Provisioning
Creates a new user identity and provisions the associated mailbox.

- **URL**: `/signup/` or `/api/v1/register/`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "username": "alice",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!",
  "accept_terms": true
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "email": "alice@riseai.com",
  "username": "alice",
  "domain": "riseai.com",
  "imap_host": "mail.riseai.com",
  "smtp_host": "mail.riseai.com",
  "deltachat_qr_url": "deltachat://import/setup_contact_qr?email=alice%40riseai.com&..."
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (username taken, password complexity, terms unaccepted).
  ```json
  {
    "detail": "Username 'alice' is already taken."
  }
  ```
  - `429 Too Many Requests`: Rate limit exceeded.

---

### 3.3. Blog / Journal Articles
Retrieves published journal announcements and updates.

- **URL**: `/blog/` or `/api/v1/blog/`
- **Method**: `GET`
- **Authentication**: None (Public)
- **Response `200 OK`**:
```json
{
  "count": 2,
  "results": [
    {
      "id": "1",
      "slug": "welcome-to-rise",
      "title": "Welcome to R.I.S.E",
      "title_fa": "به R.I.S.E خوش آمدید",
      "title_en": "Welcome to R.I.S.E",
      "excerpt": "Private communication for everyone.",
      "excerpt_fa": "ارتباط خصوصی برای همه.",
      "excerpt_en": "Private communication for everyone.",
      "content": "Full article content in markdown or HTML.",
      "content_fa": "متن کامل مقاله...",
      "content_en": "Full article text...",
      "cover_url": "",
      "published_at": "2026-10-01T12:00:00Z"
    }
  ]
}
```
*(Note: Supports array response `[...]` or paginated object `{ results: [...] }`)*.
