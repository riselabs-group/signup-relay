# Multi-relay configuration
برای رله جدید `.env` را از `backend/.env.example` بسازید و `RELAY_NAME`, `RELAY_DOMAIN`, `RELAY_DESCRIPTION`, `TERMS_URL`, `PRIVACY_URL`, `IMAP_HOST`, `SMTP_HOST` و `REGISTRATION_OPEN` را تغییر دهید. `STALWART_ADMIN_URL/TOKEN` فقط روی هسته قرار گیرد. ابتدا `STALWART_DRY_RUN=true`، سپس در staging false.
