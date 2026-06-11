import { useCallback } from 'react';
import { translations, type Language, type TranslationKey } from './translations';
import { useStore } from '../store/useStore';

export function useTranslation() {
  const { language } = useStore();

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language as Language][key] || key;
    },
    [language]
  );

  return { t, language };
}
