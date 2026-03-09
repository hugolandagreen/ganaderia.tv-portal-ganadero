import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "@/i18n/translations";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  tArray: (key: TranslationKey) => string[];
  tSchedule: (key: "prog_shows") => { time: string; show: string; desc: string; region: string }[];
}

const LangContext = createContext<LangContextType | null>(null);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("ganaderia_lang");
    return (stored === "pt" ? "pt" : "es") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("ganaderia_lang", l);
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    const val = (entry as any)[lang];
    if (typeof val === "string") return val;
    return (entry as any)["es"] || key;
  };

  const tArray = (key: TranslationKey): string[] => {
    const entry = translations[key];
    if (!entry) return [];
    const val = (entry as any)[lang];
    return Array.isArray(val) ? val : (entry as any)["es"] || [];
  };

  const tSchedule = (key: "prog_shows") => {
    const entry = translations[key];
    return (entry as any)[lang] || (entry as any)["es"];
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, tArray, tSchedule }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
};
