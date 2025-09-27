import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { supportedLanguages, defaultLanguage, type LanguageConfig } from '../locales/languages';
import { getTranslation, type Translation } from '../locales';

interface LanguageContextType {
  currentLanguage: string;
  languageConfig: LanguageConfig;
  translations: Translation;
  changeLanguage: (languageCode: string) => void;
  supportedLanguages: LanguageConfig[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Try to get saved language from localStorage
    const saved = localStorage.getItem('isl-language');
    return saved || defaultLanguage;
  });

  const languageConfig = supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  const translations = getTranslation(currentLanguage);

  const changeLanguage = (languageCode: string) => {
    if (supportedLanguages.some(lang => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('isl-language', languageCode);
    }
  };

  // Translation function with parameter replacement
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
      return key;
    }
    
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    languageConfig,
    translations,
    changeLanguage,
    supportedLanguages,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}