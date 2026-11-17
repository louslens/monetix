import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fr, type Dict } from "./fr";
import { en } from "./en";

export type Lang = "fr" | "en";
const STORAGE_KEY = "louslens-lang";
const dictionaries: Record<Lang, Dict> = { fr, en };

/** Replace {placeholders} in a translated string. */
export function fill(template: string, params: Record<string, string | number | null | undefined> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (params[k] ?? "").toString());
}

type I18nValue = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const I18nContext = createContext<I18nValue>({ lang: "fr", t: fr, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo(() => ({ lang, t: dictionaries[lang], setLang }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Translate an RPC / server error code into a user message. */
export function errorMessage(t: Dict, err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err ?? "");
  const errors = t.errors as Record<string, string>;
  for (const key of Object.keys(errors)) {
    if (raw.includes(key)) return errors[key] ?? t.common.error;
  }
  return t.common.error;
}
