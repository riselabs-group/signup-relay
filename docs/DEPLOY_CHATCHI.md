# راهنمای راه‌اندازی سرور چاتچی (Chatchi Stalwart Fork)

چاتچی یک فورک بهینه‌شده از سرور میل استال‌مارت (Stalwart) برای پاسخگویی به ثبت‌نام‌های دلتاچت است.

## پیش‌نیازها
- یک سرور لینوکس (دبیان یا ابونتو) با آی‌پی تمیز.
- رکوردهای DNS: MX, A, SPF, DKIM, DMARC.
- دسترسی به پورت‌های 993 (IMAP-SSL), 465 (SMTP-SSL), و 80/443 (HTTP API).

## تنظیم رکوردهای DNS
برای تحویل بدون وقفه ایمیل‌ها و اتصال امن دلتاچت، رکوردهای زیر را تنظیم کنید:
- **A / AAAA:** اشاره به آی‌پی سرور برای دامنه و زیردامنه‌ها (مثلاً `mail.example.com`).
- **MX:** اولویت ۱۰ به سمت سرور میل شما.
- **SPF:** رکورد TXT به شکل `v=spf1 mx ~all`.
- **DKIM:** کلید عمومی ایجاد شده در پنل استال‌مارت برای امضای دیجیتال پیام‌ها.
- **DMARC:** رکورد TXT در `_dmarc.example.com` به شکل `v=DMARC1; p=reject;`.

## راه‌اندازی سرویس
نمونه پیکربندی با Docker Compose:

```yaml
version: '3.8'

services:
  chatchi:
    image: stalwartlabs/mail-server:latest
    container_name: chatchi-stalwart
    restart: unless-stopped
    ports:
      - "465:465"   # SMTP-SSL
      - "993:993"   # IMAP-SSL
      - "80:80"     # ACME HTTP-01 challenge
      - "443:443"   # HTTPS Admin & API
    volumes:
      - ./data:/opt/stalwart-mail
    environment:
      - STALWART_CONFIG=/opt/stalwart-mail/etc/config.toml
```

برای اجرای سرور:
```bash
docker compose -f docker-compose.yml up -d
```
