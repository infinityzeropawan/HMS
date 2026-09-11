"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { SupportedLanguage, I18nDictionary } from "../_i18n_types/i18n.types";
import { DICTIONARIES } from "../_i18n_dictionaries/i18n.dictionaries";

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: I18nDictionary;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("hms_language") as SupportedLanguage | null;
    if (savedLang && DICTIONARIES[savedLang]) {
      setLanguageState(savedLang);
    }
    const savedHC = localStorage.getItem("hms_high_contrast");
    if (savedHC === "true") {
      setHighContrast(true);
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("hms_language", lang);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem("hms_high_contrast", String(next));
      if (next) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: DICTIONARIES[language],
      highContrast,
      toggleHighContrast,
    }),
    [language, setLanguage, highContrast, toggleHighContrast]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
