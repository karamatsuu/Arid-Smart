import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DICTS, LOCALES, type Locale } from "./locales";

const STORAGE_KEY = "aridsmart:lang";
const DEFAULT_LOCALE: Locale = "kaa";

export type TFunc = (key: string, params?: Record<string, string | number>) => string;

interface I18n {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFunc;
}

export function getStoredLocale(): Locale {
  const v = localStorage.getItem(STORAGE_KEY);
  return LOCALES.some((l) => l.code === v) ? (v as Locale) : DEFAULT_LOCALE;
}

function interpolate(s: string, params?: Record<string, string | number>) {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) =>
    k in params ? String(params[k]) : m,
  );
}

/** kaa → uz → en fallback chain; missing keys render the key itself. */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const s = DICTS[locale][key] ?? DICTS.uz[key] ?? DICTS.en[key] ?? key;
  return interpolate(s, params);
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
    setLocaleState(l);
  }, []);

  const t = useCallback<TFunc>(
    (key, params) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside I18nProvider");
  return ctx;
}

export { LOCALES, type Locale };
