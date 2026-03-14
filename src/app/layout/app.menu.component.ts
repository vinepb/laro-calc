import { Component } from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { I18nService } from '../i18n/i18n.service';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit, OnDestroy {
  model: any[] = [];
  private languageSub?: Subscription;

  constructor(
    public layoutService: LayoutService,
    private readonly i18nService: I18nService,
  ) {}

  ngOnInit() {
    this.buildMenu();
    this.languageSub = this.i18nService.language$.subscribe(() => {
      this.buildMenu();
    });
  }

  ngOnDestroy() {
    this.languageSub?.unsubscribe();
  }

  private buildMenu() {
    this.model = [
      {
        label: 'RO',
        items: [{ label: this.i18nService.t('navigation.calculator'), icon: 'pi pi-fw pi-home', routerLink: ['/'] }],
      },
    ];
  }
}
