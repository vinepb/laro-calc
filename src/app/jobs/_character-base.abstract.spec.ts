import { Weapon } from '../domain';
import { ItemModel } from '../models/item.model';
import { ActiveSkillModel, AtkSkillModel, CharacterBase } from './_character-base.abstract';
import { ClassName } from './_class-name';

class MockRuneKnight extends CharacterBase {
  protected override readonly CLASS_NAME = ClassName.RuneKnight;
  protected override JobBonusTable: Record<number, [number, number, number, number, number, number]> = {};
  protected override initialStatusPoint = 0;
  protected override classNames = [ClassName.RuneKnight];
  protected override _atkSkillList: AtkSkillModel[] = [];
  protected override _activeSkillList: ActiveSkillModel[] = [];
  protected override _passiveSkillList: ActiveSkillModel[] = [];
}

function createSwordWeapon() {
  return new Weapon().set({
    itemData: {
      id: 1,
      aegisName: 'TestSword',
      name: 'Test Sword',
      unidName: 'Sword',
      resName: 'TestSword',
      description: '',
      slots: 0,
      itemTypeId: 1,
      itemSubTypeId: 257,
      itemLevel: 4,
      attack: 100,
      defense: 0,
      weight: 100,
      requiredLevel: 1,
      location: null,
      compositionPos: 0,
      script: {},
    } as ItemModel,
    refineLevel: 0,
    grade: '',
  });
}

describe('CharacterBase calcAspd', () => {
  const character = new MockRuneKnight();

  it('calculates kRO-style basic ASPD with one decimal precision', () => {
    const totalAspd = character.calcAspd({
      weapon: createSwordWeapon(),
      weapon2: new Weapon(),
      isEquipShield: false,
      aspd: 0,
      aspdPercent: 14,
      totalAgi: 90,
      totalDex: 70,
      potionAspds: [],
      potionAspdPercent: 0,
      skillAspd: 0,
      skillAspdPercent: 0,
      decreaseSkillAspdPercent: 0,
    });

    expect(totalAspd).toBeCloseTo(166.3, 5);
    expect(Number.isInteger(totalAspd)).toBeFalse();
  });

  it('keeps the ASPD cap at 193.0', () => {
    const totalAspd = character.calcAspd({
      weapon: createSwordWeapon(),
      weapon2: new Weapon(),
      isEquipShield: false,
      aspd: 10,
      aspdPercent: 40,
      totalAgi: 200,
      totalDex: 150,
      potionAspds: [],
      potionAspdPercent: 0,
      skillAspd: 0,
      skillAspdPercent: 0,
      decreaseSkillAspdPercent: 0,
    });

    expect(totalAspd).toBeCloseTo(193, 5);
  });
});
