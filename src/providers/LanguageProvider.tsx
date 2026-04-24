"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations, Language, Translations } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  dir: "rtl" | "ltr";
  isHebrew: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "he",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.he,
  dir: "rtl",
  isHebrew: true,
});

const STORAGE_KEY = "app-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>("he");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && (saved === "he" || saved === "en")) {
      setLang(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Update document direction and lang
    document.documentElement.lang = lang === "he" ? "he" : "en";
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "he" ? "en" : "he");
  }, [language, setLanguage]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
    dir: language === "he" ? "rtl" : "ltr",
    isHebrew: language === "he",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
