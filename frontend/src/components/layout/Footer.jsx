import React from 'react';
import { useI18n } from '../../i18n/index.jsx';

export function Footer({ onNavigate }) {
  const { t } = useI18n();

  return (
    <footer className="border-t border-base-300 py-8 bg-base-200/50 text-xs text-base-content/70">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <p>{t('footer_fs_statement')}</p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => onNavigate('docs')} className="link link-hover">
            {t('footer_fs_what')}
          </button>
          <a href="https://delta.chat" target="_blank" rel="noopener noreferrer" className="link link-hover">
            DeltaChat
          </a>
          <a href="https://github.com/themadorg" target="_blank" rel="noopener noreferrer" className="link link-hover">
            AGPL-3.0
          </a>
        </div>
      </div>
    </footer>
  );
}
