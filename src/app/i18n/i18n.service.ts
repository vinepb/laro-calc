import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { APP_LANGUAGES, AppLanguage, LanguageOption, TranslationParams } from './i18n.types';
import { TranslationKey, enTranslations, translations } from './i18n.translations';

const LANGUAGE_STORAGE_KEY = 'appLanguage';

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { flag: '🇺🇸', label: 'English', value: 'en' },
  { flag: '🇧🇷', label: 'Português (Brasil)', value: 'pt-BR' },
  { flag: '🇪🇸', label: 'Español', value: 'es' },
];

export function detectAppLanguage(language?: string | null): AppLanguage {
  const normalized = (language || '').toLowerCase();

  if (normalized.startsWith('pt')) return 'pt-BR';
  if (normalized.startsWith('es')) return 'es';

  return 'en';
}

function isAppLanguage(value: string | null): value is AppLanguage {
  return !!value && APP_LANGUAGES.includes(value as AppLanguage);
}

function interpolate(message: string, params?: TranslationParams): string {
  if (!params) return message;

  return message.replace(/\{\{(.*?)\}\}/g, (_match, rawKey) => {
    const key = String(rawKey || '').trim();
    const value = params[key];

    return value == null ? '' : String(value);
  });
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  readonly languageOptions = LANGUAGE_OPTIONS;

  private readonly languageSubject = new BehaviorSubject<AppLanguage>('en');
  readonly language$ = this.languageSubject.asObservable();

  private initialized = false;

  constructor() {
    this.initialize();
  }

  initialize() {
    if (this.initialized) return;

    const storedLanguage = this.readStoredLanguage();
    const initialLanguage = storedLanguage || detectAppLanguage(globalThis.navigator?.language);

    this.initialized = true;
    this.setDocumentLanguage(initialLanguage);
    this.languageSubject.next(initialLanguage);
  }

  get currentLanguage(): AppLanguage {
    this.initialize();

    return this.languageSubject.value;
  }

  setLanguage(language: AppLanguage) {
    this.initialize();

    if (this.currentLanguage === language) return;

    this.persistLanguage(language);
    this.setDocumentLanguage(language);
    this.languageSubject.next(language);
  }

  translate(key: TranslationKey | string, params?: TranslationParams): string {
    this.initialize();

    const language = this.currentLanguage;
    const translated =
      translations[language][key as TranslationKey] ||
      enTranslations[key as TranslationKey] ||
      String(key);

    return interpolate(translated, params);
  }

  t(key: TranslationKey | string, params?: TranslationParams): string {
    return this.translate(key, params);
  }

  private readStoredLanguage(): AppLanguage | null {
    try {
      const value = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY) || null;

      return isAppLanguage(value) ? value : null;
    } catch {
      return null;
    }
  }

  private persistLanguage(language: AppLanguage) {
    try {
      globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      //
    }
  }

  private setDocumentLanguage(language: AppLanguage) {
    globalThis.document?.documentElement?.setAttribute('lang', language);
  }
}
