# API contract

`GET /api/config/` → `{brand, relay_name, domain, description, registration_open, terms_url, privacy_url}`

`GET /api/username/{value}/` → `{available: boolean}` (برای UX؛ تصمیم نهایی هنگام POST گرفته می‌شود)

`POST /api/signup/` body: `{username,password,password_confirmation,accept_terms}`. پاسخ 201: `{email,imap_host,imap_port,smtp_host,smtp_port,security}`. پاسخ‌های 400 validation، 409 conflict، 423 closed، 502 upstream failure.
