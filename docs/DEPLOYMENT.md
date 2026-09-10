# Deployment
سرویس Django را پشت Caddy/Nginx با TLS اجرا کنید؛ `python backend/manage.py migrate` و سپس Gunicorn (`gunicorn --chdir backend rise.wsgi:application`). frontend را با `npm run build` بسازید و `frontend/dist` را static host کنید؛ `VITE_API_URL` را روی origin API بگذارید. DB production را PostgreSQL کنید، backups و monitoring فعال کنید، و Stalwart را فقط روی شبکه خصوصی در دسترس API قرار دهید.

برای rate-limit واقعی بین چند worker، `REDIS_URL` تنظیم کنید و در reverse proxy نیز `limit_req`/WAF فعال کنید. DRF محدودیت ثبت‌نام را روی ۵ درخواست در ساعت برای هر IP، بررسی username را ۳۰ درخواست در دقیقه و endpointهای عمومی را ۶۰ درخواست در دقیقه اعمال می‌کند. دفع DDoS حجیم باید در لبه شبکه/Cloudflare انجام شود.
