import { Pipe, PipeTransform } from '@angular/core';

import { I18nService } from './i18n.service';
import { TranslationParams } from './i18n.types';

@Pipe({
  name: 't',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly i18nService: I18nService) {}

  transform(key: string, params?: TranslationParams): string {
    return this.i18nService.translate(key, params);
  }
}
