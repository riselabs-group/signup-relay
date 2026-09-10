# Threat model

دارایی‌ها: رمز، token مدیریتی، هویت و availability کاربران. مهاجم‌ها: bot، enumeration، replay، XSS/CSRF، نفوذ VPS و خطای Stalwart.

کنترل‌ها: HTTPS اجباری در ingress، secret فقط env سمت سرور، ALTCHA proof-of-work قابل فعال‌سازی با `ALTCHA_REQUIRED=true`، DRF throttling، نام‌های رزرو، پاسخ عمومی حداقلی، ORM و serializer برای injection، React escaping، CSRF/CORS محدود، transaction و rollback، log فقط email رویداد و هرگز password/token. در production، کلید ALTCHA قوی، WAF، audit sink و rotation کلیدها اضافه شود.
