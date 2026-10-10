import React, { useState } from 'react';

// ponytail: static in-bundle doc content; upgrade to dynamic markdown loader if docs exceed 50KB
const DOC_TOPICS = [
  {
    id: 'philosophy',
    title: 'فلسفه نرم‌افزار آزاد (Philosophy)',
    content: `این سرویس برای تقویت ارتباطات آزاد، رمزنگاری‌شده و مستقل از پلتفرم‌های انحصاری راه‌اندازی شده است.

## نرم‌افزار آزاد چیست؟
نرم‌افزار آزاد به آزادی کاربران برای اجرا، مطالعه، تغییر و بازتوزیع نرم‌افزار اشاره دارد. این مفهوم بر چهار آزادی اساسی بنا شده است:
• آزادی ۰: آزادی اجرای برنامه برای هر هدفی.
• آزادی ۱: آزادی مطالعه نحوه کار برنامه و تغییر آن.
• آزادی ۲: آزادی بازتوزیع نسخه‌ها برای کمک به دیگران.
• آزادی ۳: آزادی بهبود برنامه و انتشار تغییرات برای عموم.

## چرا دلتاچت؟
دلتاچت (DeltaChat) پیام‌رسانی است که به جای سرورهای متمرکز تجاری، بر بستر شبکه جهانی ایمیل (بزرگ‌ترین و بازترین سیستم پیام‌رسانی دنیا) کار می‌کند. با Autocrypt و رمزنگاری سرتاسری OpenPGP، چت‌های شما امن می‌مانند.

## مجوز کد منبع
کد منبع این پروژه تحت مجوز GNU AGPL-3.0-or-later منتشر شده است.`
  },
  {
    id: 'deploy',
    title: 'راه‌اندازی سرور چاتچی (Deploy)',
    content: `چاتچی یک فورک بهینه‌شده از سرور میل استال‌مارت (Stalwart) برای پاسخگویی به ثبت‌نام‌های دلتاچت است.

## پیش‌نیازها
• یک سرور لینوکس (دبیان یا ابونتو) با آی‌پی تمیز.
• رکوردهای DNS: MX, A, SPF, DKIM, DMARC.
• دسترسی به پورت‌های 993 (IMAP-SSL), 465 (SMTP-SSL), و 80/443 (HTTP API).

## رکوردهای DNS
• A / AAAA: اشاره به آی‌پی سرور برای دامنه و زیردامنه‌ها
• MX: اولویت ۱۰ به سمت سرور میل شما
• SPF: رکورد TXT به شکل v=spf1 mx ~all
• DKIM: کلید عمومی ایجاد شده در استال‌مارت برای امضای دیجیتال
• DMARC: رکورد TXT در _dmarc با مقدار v=DMARC1; p=reject;

## دستور اجرا با Docker Compose
docker compose -f docker-compose.yml up -d`
  },
  {
    id: 'security',
    title: 'امنیت و رمزنگاری (Security)',
    content: `امنیت ارتباطات کاربران مهم‌ترین اولویت است.

## رمزنگاری و حفاظت
• تمامی پورت‌های ورودی و خروجی با TLS 1.3 رمزنگاری شده‌اند.
• پیام‌های ارسالی با پروتکل Autocrypt و استاندارد OpenPGP سرتاسر رمزنگاری می‌شوند.
• پسوردها در حافظه ذخیره نمی‌شوند و به صورت محلی در کلاینت تولید می‌گردند.

## اعتبارسنجی
کلیدهای خصوصی PGP منحصراً روی دستگاه کاربر قرار داشته و هرگز به سرور منتقل نمی‌شوند.`
  },
  {
    id: 'privacy',
    title: 'حریم خصوصی (Privacy)',
    content: `سیاست‌های حفظ حریم خصوصی کاربران چاتچی:

• بدون لاگ‌برداری: آدرس آی‌پی، مکالمات و فراداده‌ها ذخیره نمی‌شوند.
• بدون ردیابی: از هیچ سرویس تحلیلگر شخص ثالث یا اسکریپت ردیابی استفاده نمی‌شود.
• حذف خودکار: حساب‌های موقت در صورت عدم استفاده پس از ۳۰ روز منقضی می‌شوند.
• عدم نگهداری پیام‌ها: سرور هیچ بایگانی از پیام‌های کاربران ذخیره نمی‌کند.`
  },
];

export function DocsRoute() {
  const [activeId, setActiveId] = useState('philosophy');
  const activeDoc = DOC_TOPICS.find((d) => d.id === activeId) || DOC_TOPICS[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <aside className="w-full lg:w-64 flex-shrink-0 border border-base-300 rounded-lg bg-base-200 p-4 lg:sticky lg:top-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-3">مستندات چاتچی</h3>
        <ul className="menu menu-sm p-0 gap-1">
          {DOC_TOPICS.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => setActiveId(doc.id)}
                className={`text-xs py-2 w-full text-right ${activeId === doc.id ? 'active' : ''}`}
              >
                {doc.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <article className="flex-1 min-w-0 w-full bg-base-100 border border-base-300 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold border-b border-base-300 pb-2">{activeDoc.title}</h2>
        <div className="prose prose-sm max-w-none text-sm leading-relaxed text-base-content/90 whitespace-pre-line font-sans">
          {activeDoc.content}
        </div>
      </article>
    </div>
  );
}
