import { useState, useMemo } from 'react';
import { marked } from 'marked';
import { useI18n } from '../i18n/index.tsx';

export interface DocTopic {
  id: string;
  title_fa: string;
  title_en: string;
  content_fa: string;
  content_en: string;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '');
}

// ponytail: static in-bundle doc content; upgrade to dynamic markdown loader if docs exceed 50KB
export const DOC_TOPICS: DocTopic[] = [
  {
    id: 'philosophy',
    title_fa: 'فلسفه نرم‌افزار آزاد (Philosophy)',
    title_en: 'Free Software Philosophy',
    content_fa: `این سرویس برای تقویت ارتباطات آزاد، رمزنگاری‌شده و مستقل از پلتفرم‌های انحصاری راه‌اندازی شده است.

## نرم‌افزار آزاد چیست؟
نرم‌افزار آزاد به آزادی کاربران برای اجرا، مطالعه، تغییر و بازتوزیع نرم‌افزار اشاره دارد. این مفهوم بر چهار آزادی اساسی بنا شده است:
- **آزادی ۰:** آزادی اجرای برنامه برای هر هدفی.
- **آزادی ۱:** آزادی مطالعه نحوه کار برنامه و تغییر آن.
- **آزادی ۲:** آزادی بازتوزیع نسخه‌ها برای کمک به دیگران.
- **آزادی ۳:** آزادی بهبود برنامه و انتشار تغییرات برای عموم.

## چرا دلتاچت؟
دلتاچت (DeltaChat) پیام‌رسانی است که به جای سرورهای متمرکز تجاری، بر بستر شبکه جهانی ایمیل (بزرگ‌ترین و بازترین سیستم پیام‌رسانی دنیا) کار می‌کند. با Autocrypt و رمزنگاری سرتاسری OpenPGP، چت‌های شما امن می‌مانند.

## مجوز کد منبع
کد منبع این پروژه تحت مجوز **GNU AGPL-3.0-or-later** منتشر شده است.`,
    content_en: `This service is established to foster free, encrypted, and decentralized communication independent from proprietary silos.

## What is Free Software?
Free software respects users' freedom to run, copy, distribute, study, change, and improve the software. It is founded on the four essential freedoms:
- **Freedom 0:** The freedom to run the program as you wish, for any purpose.
- **Freedom 1:** The freedom to study how the program works, and change it.
- **Freedom 2:** The freedom to redistribute copies so you can help your neighbor.
- **Freedom 3:** The freedom to distribute copies of your modified versions to others.

## Why DeltaChat?
DeltaChat is a messenger that operates over the global email network rather than proprietary centralized servers. With Autocrypt and end-to-end OpenPGP encryption, your conversations remain private.

## Source Code License
The source code of this project is released under **GNU AGPL-3.0-or-later**.`,
  },
  {
    id: 'deploy',
    title_fa: 'راه‌اندازی سرور چت‌چی (Deploy)',
    title_en: 'Deploying ChatChi Server',
    content_fa: `چت‌چی یک فورک بهینه‌شده از سرور میل استال‌مارت (Stalwart) برای پاسخگویی به ثبت‌نام‌های دلتاچت است.

## پیش‌نیازها
- یک سرور لینوکس (دبیان یا ابونتو) با آی‌پی تمیز.
- رکوردهای DNS: MX, A, SPF, DKIM, DMARC.
- دسترسی به پورت‌های 993 (IMAP-SSL), 465 (SMTP-SSL), و 80/443 (HTTP API).

## رکوردهای DNS
- **A / AAAA:** اشاره به آی‌پی سرور برای دامنه و زیردامنه‌ها
- **MX:** اولویت ۱۰ به سمت سرور میل شما
- **SPF:** رکورد TXT به شکل \`v=spf1 mx ~all\`
- **DKIM:** کلید عمومی ایجاد شده در استال‌مارت برای امضای دیجیتال
- **DMARC:** رکورد TXT در \`_dmarc\` با مقدار \`v=DMARC1; p=reject;\`

## دستور اجرا با Docker Compose
\`\`\`bash
docker compose -f docker-compose.yml up -d
\`\`\``,
    content_en: `ChatChi is an optimized Stalwart mail server fork tailored for instant DeltaChat account registration.

## Prerequisites
- A Linux server (Debian/Ubuntu) with clean IP reputation.
- DNS Records: MX, A, SPF, DKIM, DMARC.
- Exposed ports: 993 (IMAP-SSL), 465 (SMTP-SSL), and 80/443 (HTTP API).

## DNS Configuration
- **A / AAAA:** Point to server IP for domain and subdomains.
- **MX:** Priority 10 pointing to your mail server.
- **SPF:** TXT record: \`v=spf1 mx ~all\`
- **DKIM:** Public key generated in Stalwart for digital signing.
- **DMARC:** TXT record at \`_dmarc\` with \`v=DMARC1; p=reject;\`

## Docker Compose Deployment
\`\`\`bash
docker compose -f docker-compose.yml up -d
\`\`\``,
  },
  {
    id: 'security',
    title_fa: 'امنیت و رمزنگاری (Security)',
    title_en: 'Security & Encryption',
    content_fa: `امنیت ارتباطات کاربران مهم‌ترین اولویت است.

## رمزنگاری و حفاظت
- تمامی پورت‌های ورودی و خروجی با TLS 1.3 رمزنگاری شده‌اند.
- پیام‌های ارسالی با پروتکل Autocrypt و استاندارد OpenPGP سرتاسر رمزنگاری می‌شوند.
- پسوردها در حافظه ذخیره نمی‌شوند و به صورت محلی در کلاینت تولید می‌گردند.

## اعتبارسنجی
کلیدهای خصوصی PGP منحصراً روی دستگاه کاربر قرار داشته و هرگز به سرور منتقل نمی‌شوند.`,
    content_en: `User communication security is our paramount priority.

## Encryption & Protection
- All ingress and egress traffic is encrypted via TLS 1.3.
- Messages are end-to-end encrypted with Autocrypt and OpenPGP standards.
- Passwords are generated locally on the client and never retained in server state.

## Verification
PGP private keys remain strictly on the user's device and are never transmitted to the server.`,
  },
  {
    id: 'privacy',
    title_fa: 'حریم خصوصی (Privacy)',
    title_en: 'Privacy Policy',
    content_fa: `سیاست‌های حفظ حریم خصوصی کاربران چت‌چی:

- **بدون لاگ‌برداری:** آدرس آی‌پی، مکالمات و فراداده‌ها ذخیره نمی‌شوند.
- **بدون ردیابی:** از هیچ سرویس تحلیلگر شخص ثالث یا اسکریپت ردیابی استفاده نمی‌شود.
- **حذف خودکار:** حساب‌های موقت در صورت عدم استفاده پس از ۳۰ روز منقضی می‌شوند.
- **عدم نگهداری پیام‌ها:** سرور هیچ بایگانی از پیام‌های کاربران ذخیره نمی‌کند.`,
    content_en: `ChatChi privacy commitments:

- **Zero Logs:** IP addresses, chat messages, and metadata are never logged or stored.
- **Zero Tracking:** No third-party analytics or tracker scripts.
- **Automatic Expiry:** Ephemeral accounts without activity expire and clean up automatically after 30 days.
- **No Message Archive:** The server retains no archive of user messages.`,
  },
];

export function DocsRoute() {
  const { lang, t } = useI18n();
  const [activeId, setActiveId] = useState<string>('philosophy');
  const activeDoc = DOC_TOPICS.find((d) => d.id === activeId) || DOC_TOPICS[0];

  const title = lang === 'en' ? activeDoc.title_en : activeDoc.title_fa;
  const content = lang === 'en' ? activeDoc.content_en : activeDoc.content_fa;

  const renderedHtml = useMemo(() => {
    try {
      const parsed = marked.parse(content, { gfm: true, breaks: true }) as string;
      return sanitizeHtml(parsed);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <aside className="w-full lg:w-64 flex-shrink-0 border border-base-300 rounded-lg bg-base-200 p-4 lg:sticky lg:top-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-3">
          {lang === 'en' ? `${t('app_title')} Docs` : `مستندات ${t('app_title')}`}
        </h3>
        <ul className="menu menu-sm p-0 gap-1">
          {DOC_TOPICS.map((doc) => {
            const docTitle = lang === 'en' ? doc.title_en : doc.title_fa;
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(doc.id)}
                  className={`text-xs py-2 w-full text-start ${activeId === doc.id ? 'active' : ''}`}
                >
                  {docTitle}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <article className="flex-1 min-w-0 w-full bg-base-100 border border-base-300 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold border-b border-base-300 pb-2">{title}</h2>
        <div
          className="prose prose-sm max-w-none text-sm leading-relaxed text-base-content/90 font-sans prose-headings:font-bold prose-headings:text-base-content prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-pre:bg-base-200 prose-pre:text-base-content prose-pre:border prose-pre:border-base-300 prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </article>
    </div>
  );
}
