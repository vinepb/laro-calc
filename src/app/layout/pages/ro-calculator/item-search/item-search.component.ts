import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { createBonusNameList, prettyItemDesc } from '../../../../utils';
import { DropdownModel } from '../../../../models/dropdown.model';
import { ItemModel } from '../../../../models/item.model';
import { Observable, Subject, Subscription, debounceTime, tap } from 'rxjs';
import { I18nService } from 'src/app/i18n/i18n.service';

const positionKeys: { value: string; key: string; }[] = [
  { value: 'weaponList', key: 'calculator.slots.weapon' },
  { value: 'weaponCardList', key: 'calculator.slots.weaponCard' },
  { value: 'shieldList', key: 'calculator.slots.shield' },
  { value: 'shieldCardList', key: 'calculator.slots.shieldCard' },
  { value: 'headUpperList', key: 'calculator.slots.headUpper' },
  { value: 'headMiddleList', key: 'calculator.slots.headMiddle' },
  { value: 'headLowerList', key: 'calculator.slots.headLower' },
  { value: 'headCardList', key: 'calculator.slots.headCard' },
  { value: 'enchants', key: 'calculator.slots.enchantStone' },
  { value: 'armorList', key: 'calculator.slots.armor' },
  { value: 'armorCardList', key: 'calculator.slots.armorCard' },
  { value: 'garmentList', key: 'calculator.slots.garment' },
  { value: 'garmentCardList', key: 'calculator.slots.garmentCard' },
  { value: 'bootList', key: 'calculator.slots.boot' },
  { value: 'bootCardList', key: 'calculator.slots.bootCard' },
  { value: 'accList', key: 'calculator.slots.acc' },
  { value: 'accCardList', key: 'calculator.slots.accCard' },
  { value: 'petList', key: 'calculator.slots.pet' },
  { value: 'costumeList', key: 'calculator.slots.costume' },
  { value: 'shadowWeaponList', key: 'calculator.slots.shadowWeapon' },
  { value: 'shadowArmorList', key: 'calculator.slots.shadowArmor' },
  { value: 'shadowShieldList', key: 'calculator.slots.shadowShield' },
  { value: 'shadowBootList', key: 'calculator.slots.shadowBoot' },
  { value: 'shadowEarringList', key: 'calculator.slots.shadowEarring' },
  { value: 'shadowPendantList', key: 'calculator.slots.shadowPendant' },
];

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['../ro-calculator.component.css', './item-search.component.css'],
})
export class ItemSearchComponent implements OnInit, OnDestroy {
  @Input({ required: true }) items!: Record<number, ItemModel>;
  @Input({ required: true }) selectedCharacter: any;
  @Input({ required: true }) equipableItems: (DropdownModel & { id: number; position: string })[];
  @Input({ required: true }) offensiveSkills: DropdownModel[] = [];
  @Input({ required: true }) onClassChanged: Observable<boolean>;

  private subscription: Subscription;
  private subscription2: Subscription;
  private languageSubscription: Subscription;

  private selectItemSource = new Subject<number>();
  private onSelectItemChange$ = this.selectItemSource.asObservable();

  isShowSearchDialog = false;
  itemPositionOptions: DropdownModel[] = [];
  selectedItemPositions: string[] = [];
  itemSearchFirst = 0;
  totalFilteredItems = 0;

  bonusNameList: any[] = [];
  selectedBonus: string[] = [];

  filteredItems: DropdownModel[] = [];
  isSerchMatchAllBonus = true;
  selectedFilteredItem: string;
  activeFilteredItemDesc: string;
  activeFilteredItem: (typeof this.equipableItems)[0];
  seletedItemId = 0;

  selectedOffensiveSkills: string[] = [];

  constructor(private readonly i18nService: I18nService) {}

  ngOnInit(): void {
    this.rebuildLocalizedOptions();

    this.subscription = this.onClassChanged.subscribe(() => {
      this.clearItemSearch();
    });
    this.subscription2 = this.onSelectItemChange$
      .pipe(
        tap(() => (this.seletedItemId = null)),
        debounceTime(50),
      )
      .subscribe((itemId) => {
        this.seletedItemId = itemId;
      });
    this.languageSubscription = this.i18nService.language$.subscribe(() => {
      this.rebuildLocalizedOptions();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription2?.unsubscribe();
    this.languageSubscription?.unsubscribe();
  }

  onItemSearchFilterChange() {
    let isIncludeCdReduction = false;
    const selectedBonus = [
      ...this.selectedBonus.filter(Boolean).filter((v) => {
        if (v === 'cd__') {
          isIncludeCdReduction = true;
          return false;
        }

        return true;
      }),
    ];
    const selectedPositions = new Set([...(this.selectedItemPositions || []).filter(Boolean)]);

    const displayItems = [];
    for (const equipableItem of this.equipableItems) {
      const item = this.items[equipableItem.value] as ItemModel;
      if (!item?.script) {
        console.log('No Script', { item, equipableItem });
        continue;
      }
      if (selectedPositions.size > 0 && !selectedPositions.has(equipableItem.position)) continue;
      let isFoundCD = false;
      if (this.selectedOffensiveSkills?.length > 0) {
        if (isIncludeCdReduction) {
          isFoundCD = this.selectedOffensiveSkills.some((skillName) => item.script[`cd__${skillName}`]);
        } else {
          const found = this.selectedOffensiveSkills.some(
            (skillName) =>
              item.script[skillName] ||
              item.script[`chance__${skillName}`] ||
              item.autoAttackProcs?.some((proc) => proc.skillName === skillName) ||
              item.script[`cd__${skillName}`] ||
              item.script[`vct__${skillName}`] ||
              item.script[`fct__${skillName}`] ||
              item.script[`fix_vct__${skillName}`],
          );
          if (!found) continue;
        }
      }

      let foundBonus = false;
      if (isIncludeCdReduction) {
        foundBonus =
          this.isSerchMatchAllBonus || selectedBonus.length === 0
            ? isFoundCD && selectedBonus.every((bonus) => item.script[bonus])
            : isFoundCD || selectedBonus.some((bonus) => item.script[bonus]);
      } else {
        foundBonus =
          this.isSerchMatchAllBonus || selectedBonus.length === 1
            ? selectedBonus.every((bonus) => item.script[bonus])
            : selectedBonus.some((bonus) => item.script[bonus]);
      }

      // const foundBonus =
      //   this.isSerchMatchAllBonus || selectedBonus.length === 1 || (selectedBonus.length === 0 && isIncludeCdReduction)
      //     ? isFoundCD && selectedBonus.every((bonus) => item.script[bonus])
      //     : isFoundCD || selectedBonus.length === 0 || selectedBonus.some((bonus) => item.script[bonus]);
      if (foundBonus) {
        displayItems.push(equipableItem);
      }
    }
    this.totalFilteredItems = displayItems.length;
    this.filteredItems = displayItems;
    this.activeFilteredItem = undefined;
    this.activeFilteredItemDesc = undefined;
    this.selectItemSource.next(null);
    setTimeout(() => {
      this.itemSearchFirst = 0;
    }, 10);
  }

  onSelectFilteredItem(item: any) {
    // console.log({ item, activeFilteredItemID: this.activeFilteredItemID });
    // console.log({ item });
    this.selectItemSource.next((item as (typeof this.equipableItems)[0]).value as number);

    this.activeFilteredItemDesc = prettyItemDesc(this.items[this.activeFilteredItem?.id]?.description);
  }

  private clearItemSearch() {
    this.filteredItems = [];
    this.selectedOffensiveSkills = [];
    this.totalFilteredItems = 0;
    this.itemSearchFirst = 0;
    this.selectedFilteredItem = undefined;
    this.activeFilteredItem = undefined;
    this.activeFilteredItemDesc = undefined;
  }

  showSearchDialog() {
    this.isShowSearchDialog = true;
  }

  showDialog() {
    this.showSearchDialog();
  }

  private rebuildLocalizedOptions() {
    this.itemPositionOptions = positionKeys.map((position) => ({
      value: position.value,
      label: this.i18nService.t(position.key),
    }));

    this.bonusNameList = createBonusNameList() as any[];
    this.bonusNameList.push(
      {
        label: this.i18nService.t('itemSearch.fixedCastTime'),
        value: 'fct',
      },
      {
        label: this.i18nService.t('itemSearch.perfectDodge'),
        value: 'perfectDodge',
      },
      {
        label: this.i18nService.t('itemSearch.reduceCooldown'),
        value: 'cd__',
      },
    );
  }
}
