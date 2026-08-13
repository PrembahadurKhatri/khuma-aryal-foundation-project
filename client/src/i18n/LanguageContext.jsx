import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import translations from "./translations.js";

const LanguageContext = createContext(null);
const STORAGE_KEY = "kaf-language";

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "ne" || saved === "en" ? saved : "en";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en" ? "ne" : "en"));
  }, []);

  // t("some.key") -> translated UI string, always resolved for the active language.
  const t = useCallback(
    (key) => {
      const value = getNested(translations[language], key);
      if (value === undefined) {
        const fallback = getNested(translations.en, key);
        return fallback !== undefined ? fallback : key;
      }
      return value;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
