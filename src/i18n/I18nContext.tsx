import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { INTERFACE_LANGUAGES, isRTL, type InterfaceLanguage, type UiKey } from './keys';
import { translations } from './translations';

const STORAGE_KEY = 'lq.interfaceLang';

interface I18nContextValue {
  lang: InterfaceLanguage;
  dir: 'rtl' | 'ltr';
  setLang: (l: InterfaceLanguage) => void;
  t: (key: UiKey) => string;
  /** Translate a localized content text in the current interface language, fallback to ar. */
  lt: (localized: Record<string, string> | undefined) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitial(): InterfaceLanguage {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && INTERFACE_LANGUAGES.includes(stored as InterfaceLanguage)) {
    return stored as InterfaceLanguage;
  }
  return 'ar';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<InterfaceLanguage>(detectInitial);

  const dir = isRTL(lang) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: InterfaceLanguage) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore storage errors
    }
  }, []);

  const t = useCallback((key: UiKey) => translations[lang][key], [lang]);

  const lt = useCallback(
    (localized: Record<string, string> | undefined) => {
      if (!localized) return '';
      return localized[lang] ?? localized.ar ?? localized.en ?? Object.values(localized)[0] ?? '';
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, dir, setLang, t, lt }),
    [lang, dir, setLang, t, lt],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
