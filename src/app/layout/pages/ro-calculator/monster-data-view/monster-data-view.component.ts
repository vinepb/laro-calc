import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MonsterGroupNames } from '../../../../constants/monster-spawn-mapper';
import { Subscription, debounceTime } from 'rxjs';
import { FilterService } from 'primeng/api';
import { I18nService } from 'src/app/i18n/i18n.service';

@Component({
  selector: 'app-monster-data-view',
  templateUrl: './monster-data-view.component.html',
  styleUrls: ['../ro-calculator.component.css'],
})
export class MonsterDataViewComponent implements OnInit, OnDestroy {
  allMonsters: any[];
  products: any[];
  seletedGroupNames = [] as string[];
  groupNames: { label: string; value: string; }[] = [];

  textSearch = '';
  textSearchChangeEvent = new EventEmitter();
  sub: Subscription;
  languageSub: Subscription;

  constructor(
    private ref: DynamicDialogRef,
    private dynamicDialogConfig: DynamicDialogConfig,
    private filterService: FilterService,
    private readonly i18nService: I18nService,
  ) {}

  ngOnInit() {
    this.rebuildGroupNames();
    this.allMonsters = this.getMonsters();
    this.products = this.allMonsters;

    this.sub = this.textSearchChangeEvent.pipe(debounceTime(400)).subscribe(() => {
      if (!this.textSearch) {
        this.products = this.allMonsters;
      } else {
        this.products = this.allMonsters.filter((monster) => {
          return this.filterService.filters['contains'](monster.name, this.textSearch);
        });
      }
    });
    this.languageSub = this.i18nService.language$.subscribe(() => {
      this.rebuildGroupNames();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.languageSub?.unsubscribe();
  }

  private getMonsters() {
    return this.dynamicDialogConfig.data.monsters;
  }

  private isMatch(name: string) {
    if (!this.textSearch) return true;

    return this.filterService.filters['contains'](name, this.textSearch);
  }

  private isMatchGroup(groups: string[]) {
    if (!this.seletedGroupNames?.length) return true;

    return groups.findIndex((g) => this.seletedGroupNames.includes(g)) >= 0;
  }

  getSeverity(a: any) {
    switch (a) {
      case 'Boss':
        return 'danger';
    }

    return 'info';
  }

  onSelectMonster(a: any) {
    this.ref.close(a?.value);
  }

  onSelectGroupChange(isClear = false) {
    if (isClear) return this.onTextSearchChange();

    if (this.seletedGroupNames?.length > 0) {
      this.products = this.allMonsters.filter(({ groups, name }) => {
        return this.isMatchGroup(groups) && this.isMatch(name);
      });
    } else {
      this.products = this.allMonsters;
    }
  }

  onTextSearchChange() {
    this.textSearchChangeEvent.emit();
  }

  private rebuildGroupNames() {
    this.groupNames = [
      { label: this.i18nService.t('monster.boss'), value: 'Boss' },
      ...MonsterGroupNames.map((groupName) => ({ label: groupName, value: groupName })),
    ];
  }
}
