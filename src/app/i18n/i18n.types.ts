export const APP_LANGUAGES = ['en', 'pt-BR', 'es'] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

export interface TranslationParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface LanguageOption {
  flag: string;
  label: string;
  value: AppLanguage;
}
