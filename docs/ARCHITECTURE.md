# Architecture
کاربر → HTTPS relay VPS/reverse proxy → Django API → encrypted private tunnel → Stalwart management API. Browser فقط public config و connection settings را می‌بیند؛ token مدیریت، password و topology هرگز به frontend نمی‌رود. هر نصب با env دامنه، برند، رنگ/متن و endpoint خودش را می‌گیرد.
