import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import enMessages from "../locales/en.json";

type Translations = Record<string, string | Translations>;

type Locale = "en" | "pa";

interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getFromNested(obj: Translations, path: string): string | undefined {
  return path.split(".").reduce<any>((acc, part) => (acc && (acc as any)[part] !== undefined ? (acc as any)[part] : undefined), obj) as any;
}

const STORAGE_KEY = "app_locale";

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    return saved === "pa" ? "pa" : "en";
  });

  const [messages, setMessages] = useState<Translations>(enMessages as Translations);

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        if (locale === "en") {
          if (isActive) setMessages(enMessages as Translations);
          return;
        }
        const module = await import(`../locales/${locale}.json`);
        if (isActive) setMessages(module.default as Translations);
      } catch (e) {
        console.error("Failed to load locale messages", e);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [locale]);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem(STORAGE_KEY, loc);
    document.documentElement.lang = loc;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => {
      const value = getFromNested(messages, key);
      if (typeof value === "string") return value;
      const last = key.split(".").pop() || key;
      const pretty = last
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return pretty;
    };
  }, [messages]);

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


