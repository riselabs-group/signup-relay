ساختار کلی:


                         USER
                          │
                          ▼
                   ┌────────────┐
                   │ React SPA  │
                   └─────┬──────┘
                         │
                  HTTPS / HTTP
                         │
                         ▼
                 ┌───────────────┐
                 │   STALWART    │
                 │               │
                 │ Authentication│
                 │ Authorization │
                 │               │
                 │     JMAP      │
                 │      │        │
                 │   ┌──┼────┐   │
                 │   │  │    │   │
                 │ Mail Cal Contacts
                 │               │
                 │    WebDAV
                        |
                        |
                      files


_________________________________________________________________



جزییات هر بخش:

# Tasks

این فایل فهرست کارهای اصلی پروژه است.

هر بخش یک فایل جدا دارد.
قبل از شروع هر Task، مستندات رسمی Stalwart مربوط به همان بخش بررسی شود.

---

## 1. Authentication

**هدف:** اتصال React به سیستم احراز هویت Stalwart.

**کارهایی که باید انجام شود:**

* بررسی روش مناسب Authentication برای React SPA
* بررسی OAuth
* مشخص کردن Login Flow
* مشخص کردن Token Flow
* پیاده‌سازی Login
* پیاده‌سازی Logout
* مدیریت Expiration
* تست Authentication با Stalwart واقعی

**مستندات Stalwart:**

[Authentication](https://stalw.art/docs/auth/)

[OAuth Clients](https://stalw.art/docs/auth/oauth/oauth-client/)

**Task:** `AUTH-01`

**خروجی:** یک Login Flow کاملاً مشخص و تست‌شده برای React.

---

## 2. Users & Accounts

**هدف:** ساخت و مدیریت حساب‌های کاربران در Stalwart.

**کارهایی که باید انجام شود:**

* بررسی Account در Stalwart
* ساخت User
* تغییر اطلاعات User
* تغییر Password
* Suspend / Resume
* Delete
* بررسی Username availability
* تست تمام عملیات

**مستندات Stalwart:**

[Management Overview](https://stalw.art/docs/management/)

[Management API Reference](https://stalw.art/docs/ref/)

[API Endpoints](https://stalw.art/docs/development/api/)

**Task:** `USER-01`

**خروجی:** مشخص شدن API دقیق هر عملیات + تست آن روی Stalwart.

---

## 3. Mail

**هدف:** ساخت سیستم Mail داخل React با استفاده از JMAP.

**کارهایی که باید انجام شود:**

* اتصال به JMAP
* دریافت Session
* دریافت Account
* دریافت Mailboxها
* نمایش Emailها
* Search
* Read / Unread
* Send
* Reply
* Forward
* Draft
* Delete
* Attachment

**مستندات Stalwart:**

[JMAP Documentation](https://stalw.art/docs/jmap/)

[HTTP Service](https://stalw.art/docs/http/)

**Task:** `MAIL-01`

**خروجی:** Mail Flow کامل از React تا Stalwart.

---

## 4. Calendar

**هدف:** اضافه کردن Calendar.

**کارهایی که باید انجام شود:**

* بررسی JMAP Calendar
* دریافت Calendarها
* دریافت Eventها
* ساخت Event
* ویرایش Event
* حذف Event
* Recurrence
* بررسی Invitation / Scheduling

اگر JMAP نیازهای ما را پوشش نداد، CalDAV بررسی شود.

**مستندات Stalwart:**

[HTTP Overview](https://stalw.art/docs/http/)

[WebDAV / CalDAV / CardDAV](https://stalw.art/docs/http/webdav/)

**Task:** `CAL-01`

**خروجی:** مشخص شود Calendar را دقیقاً با چه Protocol و APIای می‌سازیم.

---

## 5. Contacts

**هدف:** مدیریت Contacts.

**کارهایی که باید انجام شود:**

* بررسی JMAP Contacts
* List
* Create
* Edit
* Delete
* Search

اگر JMAP کافی نبود، CardDAV بررسی شود.

**مستندات Stalwart:**

[WebDAV / CalDAV / CardDAV](https://stalw.art/docs/http/webdav/)

[JMAP Documentation](https://stalw.art/docs/jmap/)

**Task:** `CONTACT-01`

**خروجی:** مشخص شدن API/Protocol نهایی Contacts.

---

## 6. Files

**هدف:** ساخت File Manager با WebDAV.

**کارهایی که باید انجام شود:**

* اتصال React به WebDAV
* List files
* Folder
* Upload
* Download
* Rename
* Move
* Delete
* بررسی Permission
* بررسی محدودیت حجم

**مستندات Stalwart:**

[WebDAV Documentation](https://stalw.art/docs/http/webdav/)

**Task:** `FILE-01`

**خروجی:** File Manager متصل به Storage واقعی Stalwart.

---

## 7. Registration

**هدف:** ساخت Registration بدون اضافه کردن Backend غیرضروری.

**کارهایی که باید انجام شود:**

* بررسی ساخت Account در Stalwart
* بررسی Password
* بررسی Username
* بررسی Mailbox
* بررسی Rate Limit
* بررسی ALTCHA
* مشخص کردن اینکه Registration کاملاً با Stalwart ممکن است یا نه
* اگر ممکن نیست، دقیقاً مشخص کردن کوچک‌ترین سرویس مورد نیاز

**مستندات Stalwart:**

[Management Overview](https://stalw.art/docs/management/)

[Authentication](https://stalw.art/docs/auth/)

[API Reference](https://stalw.art/docs/ref/)

**Task:** `REG-01`

**خروجی:** Flow نهایی Registration.

---

## 8. Admin Panel

**هدف:** ساخت پنل مدیریت پروژه.

**کارهایی که باید انجام شود:**

* User management
* Mailbox management
* Domain management
* Permissions
* مشاهده وضعیت سیستم
* Logs / Monitoring در صورت نیاز

مدیریت باید از APIهای خود Stalwart انجام شود.

**مستندات Stalwart:**

[Management Overview](https://stalw.art/docs/management/)

[Management Object Reference](https://stalw.art/docs/ref/)

[Stalwart WebUI](https://stalw.art/docs/management/webui/)

**Task:** `ADMIN-01`

**خروجی:** مشخص شدن APIهای مورد نیاز Admin Panel.

---

## 9. Domains

**هدف:** مدیریت Domainهای Mail.

**کارهایی که باید انجام شود:**

* Create Domain
* List Domain
* Edit
* Delete
* DKIM
* Verification
* Alias

**مستندات Stalwart:**

[Management Object Reference](https://stalw.art/docs/ref/)

[Management Overview](https://stalw.art/docs/management/)

**Task:** `DOMAIN-01`

**خروجی:** مشخص شدن روش کامل مدیریت Domain.

---

## 10. Infrastructure

**هدف:** آماده کردن Stalwart برای استفاده واقعی پروژه.

**کارهایی که باید انجام شود:**

* HTTP Listener
* HTTPS
* Domain
* DNS
* Storage
* Authentication
* Permissions
* Backup
* Monitoring
* Logs
* بررسی نیاز به Reverse Proxy

**مستندات Stalwart:**

[HTTP Service](https://stalw.art/docs/http/)

[Authentication](https://stalw.art/docs/auth/)

**Task:** `INFRA-01`

**خروجی:** یک Stalwart آماده برای اتصال Frontend.

---

# تقسیم کار

کارها را می‌توان بین سه نفر این‌طور تقسیم کرد:

### نفر ۱ — Core / Mail

* `AUTH`
* `MAIL`
* `USERS`

### نفر ۲ — Collaboration

* `CALENDAR`
* `CONTACTS`
* `FILES`

### نفر ۳ — Platform

* `REGISTRATION`
* `ADMIN`
* `DOMAINS`
* `INFRASTRUCTURE`

این تقسیم‌بندی ثابت نیست؛ هدف فقط این است که هر نفر یک بخش مشخص داشته باشد و کارها روی هم نیفتند.

---

# قانون انجام Task

هر Task باید این مسیر را طی کند:

```text
Read Stalwart Docs
       ↓
Test on Stalwart
       ↓
Decide API / Protocol
       ↓
Implement
       ↓
Test
       ↓
Mark as Done
```

اگر در مرحله اول چیزی مشخص نبود، **اول Research کنید؛ مستقیم کدنویسی نکنید.**

مستندات Stalwart برای Management یک نکته مهم دارد: عملیات مدیریتی و Configuration از JMAP مدیریت می‌شوند و WebUI، CLI و دسترسی مستقیم HTTP همگی روی همین مدل کار می‌کنند. بنابراین قبل از ساخت API اختصاصی، اول همان قابلیت Stalwart بررسی شود.
