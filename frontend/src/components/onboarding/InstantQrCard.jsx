import React, { useState } from 'react';
import { useI18n } from '../../i18n/index.jsx';
import { generateRandomCredentials, buildDcloginUri, openDeltaChatUri } from '../../utils/dclogin.js';
import { generateQrSvgDataUri } from '../../utils/qr.js';
import { ManualInstructions } from './ManualInstructions.jsx';

// ponytail: in-memory state for ephemeral QR; upgrade to persistent local storage if tab-recovery needed
export function InstantQrCard() {
  const { t } = useI18n();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setNotInstalled(false);
    setTimeout(() => {
      const creds = generateRandomCredentials('chatchi.org');
      const uri = buildDcloginUri({
        email: creds.email,
        password: creds.password,
        imapHost: 'mail.chatchi.org',
        smtpHost: 'mail.chatchi.org',
      });
      setAccount({ ...creds, dclogin_link: uri });
      setLoading(false);
    }, 150);
  };

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.dclogin_link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    if (!account) return;
    openDeltaChatUri(account.dclogin_link, () => setNotInstalled(true));
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {!account ? (
        <div className="w-full py-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn btn-primary btn-md w-full max-w-xs shadow"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : t('index_generate')}
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* Locked dimension QR Slot (224px / 14rem) eliminates CLS */}
          <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl border border-base-300 flex items-center justify-center shadow-inner">
            <img
              src={generateQrSvgDataUri(account.dclogin_link, 200)}
              alt="DeltaChat Login QR"
              width="200"
              height="200"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-xs text-base-content/70">
            <span className="font-semibold"><bdi dir="ltr">{account.email}</bdi></span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={handleOpenApp} className="btn btn-primary btn-sm">
              {t('index_open_dc')}
            </button>
            <button onClick={handleCopy} className={`btn btn-sm ${copied ? 'btn-success text-white' : 'btn-outline'}`}>
              {copied ? t('index_copied') : t('index_copy_link')}
            </button>
          </div>

          {notInstalled && (
            <div className="alert alert-warning text-xs py-2 rounded">
              <span>{t('index_dc_not_installed')}</span>
            </div>
          )}

          <ManualInstructions dcloginLink={account.dclogin_link} />
        </div>
      )}
    </div>
  );
}
