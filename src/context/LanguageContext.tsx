"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKey, categoryTranslations } from "../lib/translations";

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: TranslationKey) => string;
    tc: (category: string) => string; // translate category
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Vietnamese is the default language
    const [language, setLanguage] = useState<Language>("vi");

    const toggleLanguage = useCallback(() => {
        setLanguage((prev) => (prev === "vi" ? "en" : "vi"));
    }, []);

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[language][key] || key;
        },
        [language]
    );

    const tc = useCallback(
        (category: string): string => {
            const cat = categoryTranslations[category];
            return cat ? cat[language] : category;
        },
        [language]
    );

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t, tc }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
