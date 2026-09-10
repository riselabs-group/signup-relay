# API contract

`GET /api/config/` → `{brand, relay_name, domain, description, registration_open, terms_url, privacy_url}`

`GET /api/username/{value}/` → `{available: boolean}` (برای UX؛ تصمیم نهایی هنگام POST گرفته می‌شود)

`POST /api/signup/` body: `{username,password,password_confirmation,accept_terms}`. پاسخ 201: `{email,imap_host,imap_port,smtp_host,smtp_port,security}`. پاسخ‌های 400 validation، 409 conflict، 423 closed، 502 upstream failure.

Provisioning در production مستقیماً با JMAP Management روی `/api` انجام می‌شود: `x:Account/set` با capability `urn:stalwart:jmap` و credential نوع `Password`؛ CLI استفاده نمی‌شود. این همان سطح API است که WebUI و CLI Stalwart نیز روی آن کار می‌کنند. برای ساخت، token باید permissionهای `sysAccountCreate` داشته باشد.
