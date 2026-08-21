import enDict from './locales/en.json';
import frDict from './locales/fr.json';
import esDict from './locales/es.json';
import deDict from './locales/de.json';

export type Language = 'en' | 'fr' | 'es' | 'de';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: enDict as Record<string, string>,
  fr: frDict as Record<string, string>,
  es: esDict as Record<string, string>,
  de: deDict as Record<string, string>,
};

// In-memory cache for dynamic dictionary loading
const dictionaryCache: Record<string, Record<string, string>> = {
  en: enDict as Record<string, string>,
  fr: frDict as Record<string, string>,
  es: esDict as Record<string, string>,
  de: deDict as Record<string, string>,
};

/**
 * Dynamically loads the dictionary for a given language without page reload.
 * Loads the json file and populates the cache.
 */
export async function loadDictionary(lang: Language): Promise<Record<string, string>> {
  if (dictionaryCache[lang] && Object.keys(dictionaryCache[lang]).length > 0) {
    return dictionaryCache[lang];
  }

  try {
    let dict: Record<string, string>;
    switch (lang) {
      case 'fr': {
        const mod = await import('./locales/fr.json');
        dict = (mod.default || mod) as Record<string, string>;
        break;
      }
      case 'es': {
        const mod = await import('./locales/es.json');
        dict = (mod.default || mod) as Record<string, string>;
        break;
      }
      case 'de': {
        const mod = await import('./locales/de.json');
        dict = (mod.default || mod) as Record<string, string>;
        break;
      }
      case 'en':
      default: {
        const mod = await import('./locales/en.json');
        dict = (mod.default || mod) as Record<string, string>;
        break;
      }
    }
    dictionaryCache[lang] = dict;
    return dict;
  } catch (error) {
    console.warn(`[i18n] Failed to load ${lang}.json dynamically, using fallback dictionary`, error);
    return TRANSLATIONS[lang] || TRANSLATIONS.en;
  }
}

export type TranslationKey = keyof typeof enDict;
