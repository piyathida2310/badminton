"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "../contexts/i18n"; // initialize i18n

export type Language = "th" | "en";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { t: i18nT, i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>("th");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "th" || savedLang === "en")) {
      setLanguageState(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // คง API เดิม t("section.key") ไว้ → ทุก component ไม่ต้องแก้
  // รองรับทั้ง string และ array (เช่น defaultRules, rankHeadings)
  const t = (path: string): any => {
    const result = i18nT(path, { returnObjects: true }) as any;
    return result === path ? path : result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
