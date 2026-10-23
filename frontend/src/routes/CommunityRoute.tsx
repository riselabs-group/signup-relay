import { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Heart,
  Users,
  ExternalLink,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { useI18n } from '../i18n/index.tsx';
import { useServerConfig } from '../services/ConfigContext.tsx';
import { copyToClipboard } from '../utils/clipboard.ts';
import { getLocalizedTitle } from '../utils/branding.ts';
import {
  sanitizeContactUrl,
  sanitizeCryptoAddress,
  sanitizeImageUrl,
} from '../utils/security.ts';
import type { LinkItem } from '../services/types.ts';

function resolveContactIcon(icon?: string, link?: string, title?: string) {
  const combined = `${icon || ''} ${link || ''} ${title || ''}`.toLowerCase();
  if (combined.includes('telegram') || combined.includes('t.me')) return Send;
  if (combined.includes('matrix')) return MessageSquare;
  if (combined.includes('mail') || (link && link.startsWith('mailto:'))) return Mail;
  return ExternalLink;
}

function ContactChip({ item }: { item: LinkItem }) {
  const { lang } = useI18n();
  const label = getLocalizedTitle(item, lang);
  const safeLink = sanitizeContactUrl(item.link);
  const safeIconUrl = sanitizeImageUrl(item.icon);
  const IconComp = resolveContactIcon(item.icon, item.link, item.title);

  if (!safeLink) return null;
  const isMailto = safeLink.startsWith('mailto:');

  return (
    <a
      href={safeLink}
      target={isMailto ? undefined : '_blank'}
      rel={isMailto ? undefined : 'noopener noreferrer'}
      className="btn btn-outline btn-sm gap-2 rounded-full border-base-300 hover:border-primary hover:bg-primary/5 normal-case font-medium transition-all shadow-sm"
    >
      {safeIconUrl ? (
        <img
          src={safeIconUrl}
          alt=""
          aria-hidden="true"
          className="w-3.5 h-3.5 object-contain"
        />
      ) : (
        <IconComp className="w-3.5 h-3.5 text-primary shrink-0" />
      )}
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 opacity-40 ms-0.5" />
    </a>
  );
}

function DonationCard({ item }: { item: LinkItem }) {
  const { lang, t } = useI18n();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const title = getLocalizedTitle(item, lang);
  const cleanAddress = sanitizeCryptoAddress(item.link);
  const safeIconUrl = sanitizeImageUrl(item.icon);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!cleanAddress) return;
    const ok = await copyToClipboard(cleanAddress);
    if (ok) {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card bg-base-200/70 backdrop-blur-md border border-base-300 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-3.5 hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {safeIconUrl ? (
            <img src={safeIconUrl} alt="" className="w-5 h-5 object-contain" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
          )}
          <span className="font-bold text-sm text-base-content">{title}</span>
        </div>

        {copied ? (
          <span className="badge badge-success badge-xs py-2 px-2 text-white font-bold gap-1 shadow-sm">
            <Check className="w-3 h-3" />
            <span>{t('community_copied')}</span>
          </span>
        ) : null}
      </div>

      <div
        className="font-mono text-xs bg-base-100 p-3 rounded-xl border border-base-300/80 break-all select-all text-start cursor-pointer hover:border-primary/50 transition-colors shadow-inner"
        dir="ltr"
        onClick={handleCopy}
        title={t('community_copy_btn')}
      >
        <bdi dir="ltr">{cleanAddress}</bdi>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`btn btn-sm w-full gap-2 font-medium ${
          copied ? 'btn-success text-white' : 'btn-outline border-base-300 hover:border-primary'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>{t('community_copied')}</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>{t('community_copy_btn')}</span>
          </>
        )}
      </button>
    </div>
  );
}

// ponytail: single community and support view; upgrade to multi-tab page if discussion forum or ticketing embedded
export function CommunityRoute() {
  const { t } = useI18n();
  const config = useServerConfig();

  const contacts = config?.admin_contacts || [];
  const donations = config?.donation_links || [];
  const hasContent = contacts.length > 0 || donations.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
          {t('community_title')}
        </h2>
        <p className="text-xs sm:text-sm text-base-content/75 max-w-md mx-auto leading-relaxed">
          {t('community_subtitle')}
        </p>
      </div>

      {!hasContent ? (
        <div className="card bg-base-200/50 border border-base-300 p-8 rounded-2xl text-center space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-base-content/40" />
          <p className="text-sm text-base-content/60">
            {t('community_no_content')}
          </p>
        </div>
      ) : null}

      {/* Admin & Support Contacts */}
      {contacts.length > 0 && (
        <section className="space-y-4" aria-label={t('community_contacts_title')}>
          <div className="flex items-center gap-2 border-b border-base-300 pb-2.5">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm sm:text-base text-base-content">
              {t('community_contacts_title')}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {contacts.map((c, i) => (
              <ContactChip key={c.id || c.link || i} item={c} />
            ))}
          </div>
        </section>
      )}

      {/* Server Donation Options */}
      {donations.length > 0 && (
        <section className="space-y-4" aria-label={t('community_donations_title')}>
          <div className="flex items-center gap-2 border-b border-base-300 pb-2.5">
            <Heart className="w-4 h-4 text-error" />
            <h3 className="font-bold text-sm sm:text-base text-base-content">
              {t('community_donations_title')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {donations.map((d, i) => (
              <DonationCard key={d.id || d.link || i} item={d} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
