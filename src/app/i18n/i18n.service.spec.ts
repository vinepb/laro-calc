import { detectAppLanguage, I18nService } from './i18n.service';
import { translations } from './i18n.translations';

describe('I18nService', () => {
  const originalLanguage = window.navigator.language;

  function setNavigatorLanguage(language: string) {
    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: language,
    });
  }

  afterEach(() => {
    localStorage.clear();
    setNavigatorLanguage(originalLanguage);
  });

  it('detects pt-BR from pt-* browser languages', () => {
    expect(detectAppLanguage('pt')).toBe('pt-BR');
    expect(detectAppLanguage('pt-PT')).toBe('pt-BR');
  });

  it('detects es from es-* browser languages', () => {
    expect(detectAppLanguage('es')).toBe('es');
    expect(detectAppLanguage('es-MX')).toBe('es');
  });

  it('defaults to English for unsupported browser languages', () => {
    expect(detectAppLanguage('fr-FR')).toBe('en');
    expect(detectAppLanguage(undefined)).toBe('en');
  });

  it('uses the stored language preference when available', () => {
    localStorage.setItem('appLanguage', 'es');
    setNavigatorLanguage('pt-BR');

    const service = new I18nService();

    expect(service.currentLanguage).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('persists a user-selected language', () => {
    setNavigatorLanguage('en-US');

    const service = new I18nService();
    service.setLanguage('pt-BR');

    expect(service.currentLanguage).toBe('pt-BR');
    expect(localStorage.getItem('appLanguage')).toBe('pt-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('falls back to English when a locale key is missing', () => {
    setNavigatorLanguage('en-US');

    const original = translations.es['footer.title'];
    delete (translations.es as any)['footer.title'];

    try {
      const service = new I18nService();
      service.setLanguage('es');

      expect(service.translate('footer.title')).toBe('RO Calculator');
    } finally {
      (translations.es as any)['footer.title'] = original;
    }
  });
});
