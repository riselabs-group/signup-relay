# Test scenarios
`cd backend && python manage.py test registration` سناریوهای موفقیت، duplicate و رمز کوتاه را اجرا می‌کند. برای staging با dry-run=false، حساب ساخته‌شده را با Delta Chat روی IMAP 993 و SMTP 465 تست کنید، پیام دوطرفه بفرستید و با `journalctl` بررسی کنید که password/token در log نیست. Rate limit را با 11 درخواست پیاپی و خطای upstream را با URL نامعتبر بررسی کنید.
