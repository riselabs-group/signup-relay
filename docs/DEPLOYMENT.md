# Deployment
سرویس Django را پشت Caddy/Nginx با TLS اجرا کنید؛ `python backend/manage.py migrate` و سپس Gunicorn (`gunicorn --chdir backend rise.wsgi:application`). frontend را با `npm run build` بسازید و `frontend/dist` را static host کنید؛ `VITE_API_URL` را روی origin API بگذارید. DB production را PostgreSQL کنید، backups و monitoring فعال کنید، و Stalwart را فقط روی شبکه خصوصی در دسترس API قرار دهید.

برای اتصال واقعی، `STALWART_DRY_RUN=false`، `STALWART_JMAP_URL` و `STALWART_API_KEY` را فقط در secret manager یا محیط اجرای Django قرار دهید. مسیر JMAP مدیریتی Stalwart باید با TLS و API key کم‌دسترسی در دسترس Django باشد؛ هرگز آن را از browser صدا نزنید. بعد از deploy، یک Relay در Admin بسازید، یک mailbox آزمایشی provision کنید و با همان credential روی IMAP/SMTP یا Delta Chat وارد شوید.

برای rate-limit واقعی بین چند worker، `REDIS_URL` تنظیم کنید و در reverse proxy نیز `limit_req`/WAF فعال کنید. DRF محدودیت ثبت‌نام را روی ۵ درخواست در ساعت برای هر IP، بررسی username را ۳۰ درخواست در دقیقه و endpointهای عمومی را ۶۰ درخواست در دقیقه اعمال می‌کند. دفع DDoS حجیم باید در لبه شبکه/Cloudflare انجام شود.
