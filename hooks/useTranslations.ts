
import { useCallback } from 'react';
import { translations } from '../lib/translations';

type LanguageCode = keyof typeof translations;

export const useTranslations = (lang: string) => {
  const t = useCallback((key: string): string => {
    // Ensure the lang code is a valid key, otherwise default to 'PT'
    const langKey: LanguageCode = lang in translations ? (lang as LanguageCode) : 'PT';
    
    const translation = translations[langKey]?.[key];
    const fallback = translations['PT']?.[key];

    return translation || fallback || key;
  }, [lang]);

  return { t };
};
