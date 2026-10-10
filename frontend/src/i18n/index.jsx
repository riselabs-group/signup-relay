import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en.js';
import { fa } from './fa.js';

// ponytail: in-memory bilingual dict with react context; upgrade to i18next/icu if pluralization or 3+ locales needed
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('chatchi_lang') : null;
      return stored === 'en' ? 'en' : 'fa';
    } catch (_) {
      return 'fa';
    }
  });

  const currentDict = lang === 'en' ? en : fa;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentDict.lang;
      document.documentElement.dir = currentDict.dir;
      try {
        localStorage.setItem('chatchi_lang', lang);
      } catch (_) {}
    }
  }, [lang, currentDict]);

  const toggleLang = () => setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  const t = (key, fallback = '') => currentDict[key] || fallback || key;

  return (
    <I18nContext.Provider value={{ lang, dir: currentDict.dir, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
