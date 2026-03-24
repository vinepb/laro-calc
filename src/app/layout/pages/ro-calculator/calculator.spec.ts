import { ItemTypeEnum, ItemTypeId } from 'src/app/constants';
import { ActiveSkillModel, AtkSkillModel, CharacterBase, ClassIDEnum, ClassName, RuneKnight } from 'src/app/jobs';
import { HpSpTable } from 'src/app/models/hp-sp-table.model';
import { ItemModel } from 'src/app/models/item.model';
import { MainModel } from 'src/app/models/main.model';
import { MonsterModel } from 'src/app/models/monster.model';
import { createMainModel } from 'src/app/utils';
import { Calculator } from './calculator';

// Mock CharacterBase for testing purposes
class MockCharacter extends CharacterBase {
  protected override CLASS_NAME: ClassName;
  protected override JobBonusTable: Record<number, [number, number, number, number, number, number]>;
  protected override initialStatusPoint: number;
  protected override classNames: ClassName[];
  protected override _atkSkillList: AtkSkillModel[];
  protected override _activeSkillList: ActiveSkillModel[];
  protected override _passiveSkillList: ActiveSkillModel[];
  // className = ClassName.RuneKnight;
  // classNameSet = new Set([ClassName.RuneKnight]);
  // isAllowTraitStat = () => false;
  // minMaxLevelCap = { minMaxLevel: [1, 200] as [number, number], maxJob: 70 };
  // initialStatPoint = 48;
  // getJobBonusStatus = () => ({ str: 7, agi: 2, vit: 5, int: 0, dex: 4, luk: 2, pow: 0, sta: 0, wis: 0, spl: 0, con: 0, crt: 0 });
}

describe('Calculator', () => {
  let calculator: Calculator;
  let mockItems: Record<number, Partial<ItemModel>>;
  let mockMonster: MonsterModel;
  let mockModel: MainModel;
  let mockHpSpTable: HpSpTable;
  let mockCharacter: CharacterBase;

  beforeEach(() => {
    calculator = new Calculator();
    mockCharacter = new MockCharacter();

    mockItems = {
      1: { id: 1, name: 'Test Weapon', itemTypeId: ItemTypeId.WEAPON, attack: 100, script: { atk: ['10'] } },
      2: { id: 2, name: 'Test Armor', itemTypeId: ItemTypeId.ARMOR, defense: 10, script: { vit: ['5'] } },
      3: { id: 3, name: 'Test Card', itemTypeId: ItemTypeId.CARD, script: { str: ['2'] } },
    };

    mockMonster = {
      id: 1002,
      name: 'Poring',
      spawn: 'pay_fild04',
      stats: {
        level: 1,
        health: 50,
        attack: { min: 7, max: 8 },
        range: 1,
        defense: 0,
        magicDefense: 0,
        str: 1,
        int: 0,
        vit: 1,
        dex: 6,
        agi: 1,
        luk: 30,
        baseExp: 2,
        jobExp: 1,
        hitRequireFor100: 182,
        fleeRequireFor95: 182,
        element: 1,
        elementName: 'Water',
        elementShortName: 'W1',
        race: 4,
        raceName: 'Plant',
        scale: 0,
        scaleName: 'Small',
        class: 0,
        criShield: 0,
        softDef: 0,
        mdef: 0,
        softMdef: 0,
        res: 0,
        mres: 0,
      },
      data: {
        def: 0,
        mdef: 0,
        hitRequireFor100: 182,
        fleeRequireFor95: 182,
        criShield: 0,
        softDef: 0,
        res: 0,
        mres: 0,
      },
    } as any;

    mockModel = createMainModel();
    mockModel.class = ClassIDEnum.RuneKnight;
    mockModel.level = 100;
    mockModel.jobLevel = 50;
    mockModel.str = 10;
    mockModel.agi = 10;
    mockModel.vit = 10;
    mockModel.int = 10;
    mockModel.dex = 10;
    mockModel.luk = 10;

    mockHpSpTable = [
      {
        jobs: { [mockCharacter.className]: true },
        baseHp: Array(251).fill(1000),
        baseSp: Array(251).fill(100),
      },
    ] as any;

    calculator.setMasterItems(mockItems).setHpSpTable(mockHpSpTable).setClass(mockCharacter).setMonster(mockMonster);
  });

  it('should be created', () => {
    expect(calculator).toBeTruthy();
  });

  describe('loadItemFromModel', () => {
    it('should load items and refines from model', () => {
      mockModel.weapon = 1;
      mockModel.weaponRefine = 7;
      mockModel.armor = 2;
      mockModel.armorRefine = 4;
      mockModel.armorCard = 3;

      calculator.loadItemFromModel(mockModel);

      const itemSummary = calculator.prepareAllItemBonus().getItemSummary();

      // expect(itemSummary.weapon).toBeDefined();
      // expect(itemSummary.armor).toBeDefined();
      // expect(itemSummary.armorCard).toBeDefined();
      expect(itemSummary.consumableBonuses).toBeDefined();

      const internalEquipItem = (calculator as any).equipItem;
      expect(internalEquipItem.get(ItemTypeEnum.weapon).id).toBe(1);
      expect(internalEquipItem.get(ItemTypeEnum.armor).id).toBe(2);
      expect(internalEquipItem.get(ItemTypeEnum.armorCard).id).toBe(3);

      const internalRefineMap = (calculator as any).mapRefine;
      expect(internalRefineMap.get(ItemTypeEnum.weapon)).toBe(7);
      expect(internalRefineMap.get(ItemTypeEnum.armor)).toBe(4);
    });
  });

  describe('auto attack proc dps', () => {
    const buildRuneKnightCalculator = (params?: {
      weaponId?: number;
      weaponRefine?: number;
      weaponCard1Id?: number;
      shadowWeaponId?: number;
      shadowWeaponRefine?: number;
      shadowShieldId?: number;
      shadowShieldRefine?: number;
      shadowPendantId?: number;
      shadowPendantRefine?: number;
      shadowEarringId?: number;
      shadowEarringRefine?: number;
      learnedSonicWave?: number;
      learnedIgnitionBreak?: number;
      luxAnima?: boolean;
    }) => {
      const {
        weaponId = 10,
        weaponRefine = 0,
        weaponCard1Id = 0,
        shadowWeaponId = 0,
        shadowWeaponRefine = 0,
        shadowShieldId = 0,
        shadowShieldRefine = 0,
        shadowPendantId = 0,
        shadowPendantRefine = 0,
        shadowEarringId = 0,
        shadowEarringRefine = 0,
        learnedSonicWave = 0,
        learnedIgnitionBreak = 0,
        luxAnima = false,
      } = params || {};

      const items = {
        10: {
          id: 10,
          aegisName: 'Test_Weapon',
          name: 'Test Weapon',
          unidName: 'Sword',
          resName: 'Test_Weapon',
          description: 'Test weapon',
          slots: 2,
          itemTypeId: ItemTypeId.WEAPON,
          itemSubTypeId: 258,
          itemLevel: 4,
          attack: 240,
          defense: null,
          weight: 200,
          requiredLevel: 100,
          location: null,
          compositionPos: null,
          usableClass: ['RuneKnight'],
          script: {
            atk: ['25'],
          },
        },
        31024: {
          id: 31024,
          aegisName: 'As_Bdy_Knight_Card',
          name: 'Immortal Bloody Knight Card',
          unidName: 'Immortal Bloody Knight Card',
          resName: '이름없는카드',
          description: 'Immortal Bloody Knight Card',
          slots: 0,
          itemTypeId: ItemTypeId.CARD,
          itemSubTypeId: 0,
          itemLevel: null,
          attack: null,
          defense: null,
          weight: 1,
          requiredLevel: null,
          location: null,
          compositionPos: 0,
          usableClass: ['all'],
          autoAttackProcs: [
            {
              skillName: 'Ignition Break',
              baseSkillLevel: 5,
              chanceScriptKey: 'chance__proc_immortal_bloody_knight_card',
              requiresMelee: true,
            },
          ],
          script: {
            atkPercent: ['10'],
            'chance__proc_immortal_bloody_knight_card': ['2'],
          },
        },
        600009: {
          id: 600009,
          aegisName: 'Up_Oriental_Sword',
          name: 'Patent Oriental Sword [2]',
          unidName: 'Bastard Sword',
          resName: 'UpOnimaru',
          description: 'Patent sword',
          slots: 2,
          itemTypeId: ItemTypeId.WEAPON,
          itemSubTypeId: 258,
          itemLevel: 4,
          attack: 240,
          defense: null,
          weight: 200,
          requiredLevel: 150,
          location: null,
          compositionPos: null,
          usableClass: ['RuneKnight'],
          autoAttackProcs: [
            {
              skillName: 'Sonic Wave',
              baseSkillLevel: 2,
              chanceScriptKey: 'chance__proc_patent_oriental_sword',
              useLearnedLevelIfHigher: true,
              requiresMelee: true,
            },
          ],
          script: {
            atk: ['2---15'],
            'Sonic Wave': ['3---10'],
            'chance__proc_patent_oriental_sword': ['9===7'],
            aspdPercent: ['7===10'],
            cri: ['11===15'],
            criDmg: ['11===15'],
          },
        },
        24288: {
          id: 24288,
          aegisName: 'S_Runeknight_Weapon',
          name: 'Rune Knight Weapon Shadow',
          unidName: 'Shadow Weapon',
          resName: '웨폰쉐도우',
          description: 'Rune Knight Weapon Shadow',
          slots: 0,
          itemTypeId: 10,
          itemSubTypeId: 280,
          itemLevel: null,
          attack: null,
          defense: null,
          weight: 0,
          requiredLevel: 99,
          location: 'Weapon',
          compositionPos: null,
          usableClass: ['RuneKnight'],
          autoAttackProcs: [
            {
              skillName: 'Ignition Break',
              baseSkillLevel: 3,
              chanceScriptKey: 'chance__proc_rune_knight_weapon_shadow',
            },
          ],
          script: {
            'Sonic Wave': ['20', '1---5'],
            'chance__proc_rune_knight_weapon_shadow': ['EQUIP[Rune Knight Shield Shadow]===3'],
            atk: ['1---1'],
            matk: ['1---1'],
          },
        },
        24301: {
          id: 24301,
          aegisName: 'S_Runeknight_Shield',
          name: 'Rune Knight Shield Shadow',
          unidName: 'Shadow Shield',
          resName: '쉴드쉐도우',
          description: 'Rune Knight Shield Shadow',
          slots: 0,
          itemTypeId: 10,
          itemSubTypeId: 527,
          itemLevel: null,
          attack: null,
          defense: null,
          weight: 0,
          requiredLevel: 99,
          location: 'Shield',
          compositionPos: null,
          usableClass: ['RuneKnight'],
          script: {
            aspdPercent: ['ACTIVE_SKILL[Enchant Blade]1---1'],
            aspd: ['ACTIVE_SKILL[Enchant Blade]7===1', 'ACTIVE_SKILL[Enchant Blade]9===1'],
          },
        },
        24443: {
          id: 24443,
          aegisName: 'S_Ignition_Weapon',
          name: 'Ignition Shadow Weapon',
          unidName: 'Shadow Weapon',
          resName: '웨폰쉐도우',
          description: 'Ignition Shadow Weapon',
          slots: 0,
          itemTypeId: 10,
          itemSubTypeId: 280,
          itemLevel: null,
          attack: null,
          defense: null,
          weight: 0,
          requiredLevel: 99,
          location: 'Weapon',
          compositionPos: null,
          usableClass: ['RuneKnight'],
          autoAttackProcs: [
            {
              skillName: 'Ignition Break',
              baseSkillLevel: 3,
              chanceScriptKey: 'chance__proc_ignition_shadow_weapon',
              useLearnedLevelIfHigher: true,
              requiresMelee: true,
            },
          ],
          script: {
            'Ignition Break': ['EQUIP[Ignition Shadow Pendant&&Ignition Shadow Earring]REFINE[shadowWeapon,shadowPendant,shadowEarring==1]---1'],
            'chance__proc_ignition_shadow_weapon': ['2', '7===1', '9===2'],
            'p_pene_race_all': ['EQUIP[Rune Knight Shield Shadow]40', 'EQUIP[Rune Knight Shield Shadow]REFINE[shadowWeapon,shadowShield==1]---1'],
            atk: ['1---1'],
            matk: ['1---1'],
          },
        },
        24444: {
          id: 24444,
          aegisName: 'S_Ignition_Pendant',
          name: 'Ignition Shadow Pendant',
          unidName: 'Shadow Pendant',
          resName: '펜던트쉐도우',
          description: 'Ignition Shadow Pendant',
          slots: 0,
          itemTypeId: 10,
          itemSubTypeId: 530,
          itemLevel: null,
          attack: null,
          defense: null,
          weight: 0,
          requiredLevel: 99,
          location: 'AccessoryLeft',
          compositionPos: null,
          usableClass: ['RuneKnight'],
          script: {
            'Ignition Break': ['5', '2---2'],
          },
        },
        24445: {
          id: 24445,
          aegisName: 'S_Ignition_Earing',
          name: 'Ignition Shadow Earring',
          unidName: 'Shadow Earring',
          resName: '이어링쉐도우',
          description: 'Ignition Shadow Earring',
          slots: 0,
          itemTypeId: 10,
          itemSubTypeId: 529,
          itemLevel: null,
          attack: null,
          defense: null,
          weight: 0,
          requiredLevel: 99,
          location: 'AccessoryRight',
          compositionPos: null,
          usableClass: ['RuneKnight'],
          script: {
            'cd__Ignition Break': ['0.2', '3---0.1'],
          },
        },
      } as unknown as Record<number, ItemModel>;

      const runeKnight = new RuneKnight();
      const hpSpTable = [
        {
          jobs: { [runeKnight.className]: true },
          baseHp: Array(251).fill(1000),
          baseSp: Array(251).fill(100),
        },
      ] as any;
      const activeSkillIds = runeKnight.activeSkills.map((skill) => skill.dropdown[0]?.value || 0);
      const passiveSkillIds = runeKnight.passiveSkills.map((skill) => skill.dropdown[0]?.value || 0);
      const luxAnimaIndex = runeKnight.activeSkills.findIndex((skill) => skill.name === 'Lux Anima Runestone');
      const ignitionBreakIndex = runeKnight.passiveSkills.findIndex((skill) => skill.name === 'Ignition Break');
      const sonicWaveIndex = runeKnight.passiveSkills.findIndex((skill) => skill.name === 'Sonic Wave');

      if (luxAnima && luxAnimaIndex >= 0) {
        activeSkillIds[luxAnimaIndex] = 2;
      }
      if (learnedSonicWave > 0 && sonicWaveIndex >= 0) {
        passiveSkillIds[sonicWaveIndex] = learnedSonicWave;
      }
      if (learnedIgnitionBreak > 0 && ignitionBreakIndex >= 0) {
        passiveSkillIds[ignitionBreakIndex] = learnedIgnitionBreak;
      }

      const { equipAtks, masteryAtks, activeSkillNames, learnedSkillMap } = runeKnight
        .setLearnSkills({ activeSkillIds, passiveSkillIds })
        .getSkillBonusAndName();

      const model = createMainModel();
      model.class = ClassIDEnum.RuneKnight;
      model.level = 200;
      model.jobLevel = 70;
      model.str = 120;
      model.agi = 100;
      model.vit = 100;
      model.int = 30;
      model.dex = 90;
      model.luk = 60;
      model.weapon = weaponId;
      model.weaponRefine = weaponRefine;
      model.weaponCard1 = weaponCard1Id;
      model.shadowWeapon = shadowWeaponId;
      model.shadowWeaponRefine = shadowWeaponRefine;
      model.shadowShield = shadowShieldId;
      model.shadowShieldRefine = shadowShieldRefine;
      model.shadowPendant = shadowPendantId;
      model.shadowPendantRefine = shadowPendantRefine;
      model.shadowEarring = shadowEarringId;
      model.shadowEarringRefine = shadowEarringRefine;
      model.selectedAtkSkill = 'Sonic Wave==10';

      const calc = new Calculator();
      calc
        .setMasterItems(items)
        .setHpSpTable(hpSpTable)
        .setClass(runeKnight)
        .setMonster(mockMonster)
        .loadItemFromModel(model)
        .setEquipAtkSkillAtk(equipAtks)
        .setBuffBonus({ masteryAtk: {}, equipAtk: {} })
        .setMasterySkillAtk(masteryAtks)
        .setUsedSkillNames(activeSkillNames)
        .setLearnedSkills(learnedSkillMap)
        .setOffensiveSkill(model.selectedAtkSkill)
        .prepareAllItemBonus()
        .calcAllAtk()
        .calcAllDefs()
        .calculateHpSp({ isUseHpL: false })
        .calculateAllDamages(model.selectedAtkSkill);

      return calc.getTotalSummary().dmg;
    };

    it('does not add Patent Sword proc dps below refine 9', () => {
      const dmg = buildRuneKnightCalculator({ weaponId: 600009, weaponRefine: 8 });

      expect(dmg.autoAttackProcSummaries.length).toBe(0);
      expect(dmg.autoAttackProcDps).toBe(0);
      expect(dmg.autoAttackTotalDps).toBe(dmg.basicDps);
    });

    it('adds Patent Sword proc dps at refine 9', () => {
      const dmg = buildRuneKnightCalculator({ weaponId: 600009, weaponRefine: 9 });

      expect(dmg.autoAttackProcSummaries.length).toBe(1);
      expect(dmg.autoAttackProcSummaries[0].skillLabel).toBe('Sonic Wave');
      expect(dmg.autoAttackProcSummaries[0].chancePercent).toBe(7);
      expect(dmg.autoAttackProcSummaries[0].dps).toBeGreaterThan(0);
      expect(dmg.autoAttackTotalDps).toBe(dmg.basicDps + dmg.autoAttackProcSummaries[0].dps);
    });

    it('uses level 2 Sonic Wave when the learned level is lower', () => {
      const lowLearned = buildRuneKnightCalculator({ weaponId: 600009, weaponRefine: 9, learnedSonicWave: 1 });
      const unlearned = buildRuneKnightCalculator({ weaponId: 600009, weaponRefine: 9, learnedSonicWave: 0 });

      expect(lowLearned.autoAttackProcSummaries[0].dps).toBe(unlearned.autoAttackProcSummaries[0].dps);
    });

    it('uses the learned Sonic Wave level when it is higher than level 2', () => {
      const baseProc = buildRuneKnightCalculator({ weaponId: 600009, weaponRefine: 9, learnedSonicWave: 1 });
      const highLearned = buildRuneKnightCalculator({ weaponId: 600009, weaponRefine: 9, learnedSonicWave: 10 });

      expect(highLearned.autoAttackProcSummaries[0].dps).toBeGreaterThan(baseProc.autoAttackProcSummaries[0].dps);
    });

    it('does not add Lux Anima proc dps while the buff is inactive', () => {
      const dmg = buildRuneKnightCalculator({ weaponId: 10, luxAnima: false });

      expect(dmg.autoAttackProcSummaries.find((proc) => proc.skillLabel === 'Storm Blast')).toBeUndefined();
    });

    it('adds Lux Anima Storm Blast proc dps while the buff is active', () => {
      const dmg = buildRuneKnightCalculator({ weaponId: 10, luxAnima: true });
      const stormBlastProc = dmg.autoAttackProcSummaries.find((proc) => proc.skillLabel === 'Storm Blast');

      expect(stormBlastProc).toBeDefined();
      expect(stormBlastProc.chancePercent).toBe(15);
      expect(stormBlastProc.dps).toBeGreaterThan(0);
      expect(dmg.autoAttackTotalDps).toBe(dmg.basicDps + dmg.autoAttackProcDps);
    });

    it('adds Immortal Bloody Knight Card proc dps from the weapon card slot', () => {
      const dmg = buildRuneKnightCalculator({
        weaponId: 10,
        weaponCard1Id: 31024,
      });
      const ignitionProc = dmg.autoAttackProcSummaries.find((proc) => proc.sourceLabel === 'Immortal Bloody Knight Card');

      expect(ignitionProc).toBeDefined();
      expect(ignitionProc.skillLabel).toBe('Ignition Break');
      expect(ignitionProc.chancePercent).toBe(2);
      expect(ignitionProc.dps).toBeGreaterThan(0);
    });

    it('adds Ignition Shadow Weapon proc dps for the ignition shadow set', () => {
      const dmg = buildRuneKnightCalculator({
        weaponId: 10,
        shadowWeaponId: 24443,
        shadowWeaponRefine: 9,
        shadowPendantId: 24444,
        shadowEarringId: 24445,
      });
      const ignitionProc = dmg.autoAttackProcSummaries.find((proc) => proc.sourceLabel === 'Ignition Shadow Weapon');

      expect(ignitionProc).toBeDefined();
      expect(ignitionProc.skillLabel).toBe('Ignition Break');
      expect(ignitionProc.chancePercent).toBe(5);
      expect(ignitionProc.dps).toBeGreaterThan(0);
      expect(dmg.autoAttackTotalDps).toBe(dmg.basicDps + dmg.autoAttackProcDps);
    });

    it('uses the learned Ignition Break level when it is higher than level 3', () => {
      const baseProc = buildRuneKnightCalculator({
        weaponId: 10,
        shadowWeaponId: 24443,
        shadowWeaponRefine: 9,
        shadowPendantId: 24444,
        shadowEarringId: 24445,
        learnedIgnitionBreak: 1,
      });
      const highLearned = buildRuneKnightCalculator({
        weaponId: 10,
        shadowWeaponId: 24443,
        shadowWeaponRefine: 9,
        shadowPendantId: 24444,
        shadowEarringId: 24445,
        learnedIgnitionBreak: 5,
      });

      expect(highLearned.autoAttackProcSummaries[0].dps).toBeGreaterThan(baseProc.autoAttackProcSummaries[0].dps);
    });

    it('does not add Rune Knight Weapon Shadow proc dps without the shield set', () => {
      const dmg = buildRuneKnightCalculator({
        weaponId: 10,
        shadowWeaponId: 24288,
      });

      expect(dmg.autoAttackProcSummaries.find((proc) => proc.sourceLabel === 'Rune Knight Weapon Shadow')).toBeUndefined();
    });

    it('adds Rune Knight Weapon Shadow proc dps with the shield set equipped', () => {
      const dmg = buildRuneKnightCalculator({
        weaponId: 10,
        shadowWeaponId: 24288,
        shadowShieldId: 24301,
      });
      const ignitionProc = dmg.autoAttackProcSummaries.find((proc) => proc.sourceLabel === 'Rune Knight Weapon Shadow');

      expect(ignitionProc).toBeDefined();
      expect(ignitionProc.skillLabel).toBe('Ignition Break');
      expect(ignitionProc.chancePercent).toBe(3);
      expect(ignitionProc.dps).toBeGreaterThan(0);
    });

    it('keeps separate Ignition Break proc sources independent when the card and shadow weapon are equipped together', () => {
      const dmg = buildRuneKnightCalculator({
        weaponId: 10,
        weaponCard1Id: 31024,
        shadowWeaponId: 24443,
        shadowWeaponRefine: 9,
      });
      const cardProc = dmg.autoAttackProcSummaries.find((proc) => proc.sourceLabel === 'Immortal Bloody Knight Card');
      const shadowProc = dmg.autoAttackProcSummaries.find((proc) => proc.sourceLabel === 'Ignition Shadow Weapon');

      expect(cardProc).toBeDefined();
      expect(cardProc.chancePercent).toBe(2);
      expect(shadowProc).toBeDefined();
      expect(shadowProc.chancePercent).toBe(5);
      expect(dmg.autoAttackProcSummaries.length).toBe(2);
    });
  });
});
