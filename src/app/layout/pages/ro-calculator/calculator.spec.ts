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
      learnedSonicWave?: number;
      luxAnima?: boolean;
    }) => {
      const {
        weaponId = 10,
        weaponRefine = 0,
        learnedSonicWave = 0,
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
              chanceScriptKey: 'chance__Sonic Wave',
              useLearnedLevelIfHigher: true,
              requiresMelee: true,
            },
          ],
          script: {
            atk: ['2---15'],
            'Sonic Wave': ['3---10'],
            'chance__Sonic Wave': ['9===7'],
            aspdPercent: ['7===10'],
            cri: ['11===15'],
            criDmg: ['11===15'],
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
      const sonicWaveIndex = runeKnight.passiveSkills.findIndex((skill) => skill.name === 'Sonic Wave');

      if (luxAnima && luxAnimaIndex >= 0) {
        activeSkillIds[luxAnimaIndex] = 2;
      }
      if (learnedSonicWave > 0 && sonicWaveIndex >= 0) {
        passiveSkillIds[sonicWaveIndex] = learnedSonicWave;
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
  });
});
