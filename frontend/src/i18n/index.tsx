import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { en } from './en.ts';
import { fa } from './fa.ts';

export type Language = 'en' | 'fa';
export type Direction = 'ltr' | 'rtl';

export interface I18nContextValue {
  lang: Language;
  dir: Direction;
  t: (key: string, fallback?: string) => string;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('chatchi_lang') : null;
      return stored === 'en' ? 'en' : 'fa';
    } catch {
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
      } catch {
        // Ignore local storage write errors
      }
    }
  }, [lang, currentDict]);

  const toggleLang = () => setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  const t = (key: string, fallback?: string): string => currentDict[key] ?? fallback ?? key;

  return (
    <I18nContext.Provider value={{ lang, dir: currentDict.dir, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
