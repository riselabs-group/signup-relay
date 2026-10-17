import { useState, useMemo } from 'react';
import { useI18n } from '../../i18n/index.tsx';
import { generateQrSvgDataUri } from '../../utils/qr.ts';
import { API_DOMAIN } from '../../api/registry.ts';
import { getDomainName } from '../../utils/dclogin.ts';

export interface ShareCardProps {
  embedded?: boolean;
}

// ponytail: client-side SVG QR and Web Share API; upgrade to downloadable PNG or vCard export if contact interchange needed
export function ShareCard({ embedded = false }: ShareCardProps = {}) {
  const { t } = useI18n();
  const [name, setName] = useState<string>('MailiaM User');
  const [handle, setHandle] = useState<string>(`user@${getDomainName(API_DOMAIN)}`);
  const [copied, setCopied] = useState<boolean>(false);

  const inviteUri = `https://i.delta.chat/#invite?addr=${encodeURIComponent(handle)}&name=${encodeURIComponent(name)}`;
  const qrDataUri = useMemo(() => generateQrSvgDataUri(inviteUri, 160), [inviteUri]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteUri)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {});
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator && navigator.share) {
      try {
        await navigator.share({
          title: `DeltaChat: ${name}`,
          text: `با من در دلتاچت در ارتباط باشید: ${name}`,
          url: inviteUri,
        });
      } catch {
        // Native share dismissed or cancelled
      }
    }
  };

  const formContent = (
    <>
      {!embedded && <h3 className="text-sm font-bold text-center">{t('share_title')}</h3>}

      <div className="space-y-3">
        <div className="form-control">
          <label className="label text-xs">{t('share_display_name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered input-sm bg-base-100"
          />
        </div>
        <div className="form-control">
          <label className="label text-xs">{t('share_handle_label')}</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="input input-bordered input-sm bg-base-100"
            dir="ltr"
          />
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-base-100 to-base-200 text-center space-y-3 shadow-inner">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
          {Array.from(name.trim())[0] || '?'}
        </div>
        <div>
          <h4 className="font-bold text-sm">{name}</h4>
          <p className="text-xs text-base-content/70 font-mono" dir="ltr">
            <bdi dir="ltr">{handle}</bdi>
          </p>
        </div>
        <div className="w-40 h-40 mx-auto bg-white p-2 rounded-lg border border-base-300 flex items-center justify-center shadow-inner">
          <img
            src={qrDataUri}
            alt="DeltaChat Invite QR"
            width="160"
            height="160"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={`btn btn-sm flex-1 ${copied ? 'btn-success text-white' : 'btn-primary'}`}
        >
          {copied ? t('index_copied') : t('share_copy_invite')}
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="btn btn-outline btn-sm"
          >
            {t('share_native_button')}
          </button>
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="space-y-4">{formContent}</div>;
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card bg-base-200 border border-base-300 p-6 shadow-sm space-y-4">
        {formContent}
      </div>
    </div>
  );
}
