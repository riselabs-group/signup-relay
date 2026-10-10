import React, { useState } from 'react';
import { generateQrSvgDataUri } from '../../utils/qr.js';

// ponytail: client-side SVG QR and Web Share API; upgrade to downloadable PNG or vCard export if contact interchange needed
export function ShareCard() {
  const [name, setName] = useState('Chatchi User');
  const [handle, setHandle] = useState('user@chatchi.org');
  const [copied, setCopied] = useState(false);

  const inviteUri = `https://i.delta.chat/#invite?addr=${encodeURIComponent(handle)}&name=${encodeURIComponent(name)}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUri).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `DeltaChat: ${name}`,
          text: `با من در دلتاچت در ارتباط باشید: ${name}`,
          url: inviteUri,
        });
      } catch (_) {}
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card bg-base-200 border border-base-300 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-center">ساخت کارت اشتراک‌گذاری شناسه دلتاچت</h3>

        <div className="space-y-3">
          <div className="form-control">
            <label className="label text-xs">نام نمایشی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered input-sm bg-base-100"
            />
          </div>
          <div className="form-control">
            <label className="label text-xs">نشانی ایمیل یا دلتاچت</label>
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
            {name.charAt(0) || '?'}
          </div>
          <div>
            <h4 className="font-bold text-sm">{name}</h4>
            <p className="text-xs text-base-content/70 font-mono" dir="ltr">
              <bdi dir="ltr">{handle}</bdi>
            </p>
          </div>
          <div className="w-40 h-40 mx-auto bg-white p-2 rounded-lg border border-base-300 flex items-center justify-center shadow-inner">
            <img
              src={generateQrSvgDataUri(inviteUri, 160)}
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
            {copied ? 'کپی شد ✓' : 'کپی لینک دعوت'}
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="btn btn-outline btn-sm"
            >
              اشتراک‌گذاری
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
