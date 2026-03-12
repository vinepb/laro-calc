import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { I18nModule } from './i18n.module';
import { I18nService } from './i18n.service';

@Component({
  template: `<span class="translated-label">{{ 'topbar.items' | t }}</span>`,
})
class HostComponent {}

describe('TranslatePipe', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('appLanguage', 'en');

    await TestBed.configureTestingModule({
      declarations: [HostComponent],
      imports: [I18nModule],
    }).compileComponents();
  });

  it('updates a rendered label when the active language changes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    const i18nService = TestBed.inject(I18nService);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.translated-label')?.textContent?.trim()).toBe('Items');

    i18nService.setLanguage('pt-BR');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.translated-label')?.textContent?.trim()).toBe('Itens');

    i18nService.setLanguage('es');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.translated-label')?.textContent?.trim()).toBe('Ítems');
  });
});
