# Chatchi Backend API Specification

This document details the RESTful HTTP API expected from the custom Stalwart mail server fork ("Chatchi") to power the Chatchi DeltaChat onboarding portal and client applications.

## Base URL & Transport
- **Base URL:** `/api/v1`
- **Transport:** HTTPS strictly required with TLS 1.3 preferred.
- **Content-Type:** `application/json; charset=utf-8`
- **Encoding:** UTF-8

---

## 1. System Health & Configuration

### 1.1 Health Check
- **Endpoint:** `GET /health`
- **Authentication:** None
- **Response 200 OK:**
```json
{
  "status": "healthy",
  "version": "1.0.0-chatchi",
  "uptime_seconds": 348120
}
```

### 1.2 Public Configuration Discovery
- **Endpoint:** `GET /config`
- **Authentication:** None
- **Description:** Returns server capabilities, supported domains, connection parameters, and bot protection rules.
- **Response 200 OK:**
```json
{
  "domain": "chatchi.org",
  "allowed_domains": ["chatchi.org", "delta.chatchi.org"],
  "registration_open": true,
  "instant_accounts_enabled": true,
  "custom_accounts_enabled": true,
  "endpoints": {
    "imap": {
      "host": "mail.chatchi.org",
      "port": 993,
      "security": "ssl"
    },
    "smtp": {
      "host": "mail.chatchi.org",
      "port": 465,
      "security": "ssl"
    }
  },
  "altcha": {
    "required": true,
    "max_number": 500000
  }
}
```

---

## 2. Bot Protection (Altcha Challenge)

### 2.1 Issue Proof-of-Work Challenge
- **Endpoint:** `GET /altcha/challenge`
- **Authentication:** None
- **Description:** Issues a cryptographic SHA-256 proof-of-work challenge.
- **Response 200 OK:**
```json
{
  "algorithm": "SHA-256",
  "challenge": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "salt": "1760130000:7a8b9c0d1e2f3a4b",
  "signature": "8f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a",
  "max_number": 500000
}
```
- **Security Invariants:**
  - `salt` must prefix the Unix timestamp: `<timestamp>:<random_hex>`.
  - Timestamp must be rejected if older than 120 seconds.
  - Replayed challenge hashes must be checked against an atomic cache with 120s TTL.

---

## 3. Account Provisioning

### 3.1 Instant DeltaChat Account
- **Endpoint:** `POST /accounts/instant`
- **Authentication:** None
- **Headers:**
  - `Content-Type: application/json`
  - `Idempotency-Key: <UUIDv4>` (recommended)
- **Request Body:** `{}` (empty object or optional Altcha payload)
- **Response 201 Created:**
```json
{
  "account_id": "acc_01hxyz1234567890",
  "email": "dc_a8f9b2c3d4e5@chatchi.org",
  "password": "GeneratedSecretPassword24Chars!",
  "dclogin_link": "dclogin:dc_a8f9b2c3d4e5@chatchi.org/?p=GeneratedSecretPassword24Chars%21&v=1&ih=mail.chatchi.org&ip=993&is=ssl&sh=mail.chatchi.org&sp=465&ss=ssl&ic=3",
  "account_type": "instant",
  "expires_at": "2026-11-10T23:59:59Z",
  "quota_mb": 50
}
```
- **Rate Limit:** 2 requests per 15 minutes per `/24` subnet.

### 3.2 Custom Mailbox Account
- **Endpoint:** `POST /accounts/custom`
- **Authentication:** None
- **Headers:**
  - `Content-Type: application/json`
  - `Idempotency-Key: <UUIDv4>`
- **Request Body:**
```json
{
  "username": "rezishon",
  "domain": "chatchi.org",
  "password": "MySecurePassword123#",
  "altcha_payload": "eyJhbGdvcml0aG0iOiJTSEEtMjU2IiwiY2hhbGxlbmdlIjoiLi4uIiwibnVtYmVyIjoxMjM0NSwic2FsdCI6Ii4uLiIsInNpZ25hdHVyZSI6Ii4uLiJ9"
}
```
- **Response 201 Created:**
```json
{
  "account_id": "acc_01hxyz9876543210",
  "email": "rezishon@chatchi.org",
  "dclogin_link": "dclogin:rezishon@chatchi.org/?p=MySecurePassword123%23&v=1&ih=mail.chatchi.org&ip=993&is=ssl&sh=mail.chatchi.org&sp=465&ss=ssl&ic=3",
  "account_type": "custom"
}
```
- **Error Responses:**
  - `400 Bad Request`:
    ```json
    { "error": "invalid_request", "message": "Password must be at least 12 characters with mixed characters" }
    ```
  - `400 Bad Request` (Altcha failure):
    ```json
    { "error": "invalid_altcha", "message": "Proof-of-work challenge invalid, expired, or replayed" }
    ```
  - `409 Conflict`:
    ```json
    { "error": "username_taken", "message": "The username 'rezishon' is already in use" }
    ```
  - `429 Too Many Requests`:
    ```json
    { "error": "rate_limited", "message": "Too many requests. Try again later.", "retry_after": 60 }
    ```

---

## 4. WebXDC App Store

### 4.1 App Catalog List
- **Endpoint:** `GET /apps`
- **Authentication:** None
- **Response 200 OK:**
```json
{
  "version": "1.0",
  "apps": [
    {
      "app_id": "chat.delta.webxdc.chess",
      "name": "Chess",
      "version": "1.4.2",
      "tag_name": "v1.4.2",
      "date": "2026-08-01T12:00:00Z",
      "description": "Play chess with contacts in DeltaChat.\nClassic turn-based board game directly inside messages.",
      "author": "DeltaChat Community",
      "size": 420000,
      "icon_url": "/apps/xdcstore/icons/chess.png",
      "download_url": "/apps/xdcstore/packages/chess.xdc",
      "source_code_url": "https://github.com/webxdc/chess"
    }
  ]
}
```
- **Asset Delivery:**
  - `.xdc` packages must be served with:
    ```http
    Content-Type: application/octet-stream
    Content-Disposition: attachment; filename="app.xdc"
    X-Content-Type-Options: nosniff
    ```
