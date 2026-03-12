import { normalizeName, toStableItemObject } from './io.mjs';

const LOCAL_ITEM_TYPE_ID = {
  WEAPON: 1,
  ARMOR: 2,
  CONSUMABLE: 3,
  AMMO: 4,
  ETC: 5,
  CARD: 6,
  ENCHANT: 11,
};

const LOCAL_ITEM_SUBTYPE_ID = {
  Upper: 512,
  Armor: 513,
  Shield: 514,
  Garment: 515,
  Boot: 516,
  Accessory: 517,
  AccessoryRight: 510,
  AccessoryLeft: 511,
  CostumeUpper: 519,
  CostumeMiddle: 520,
  CostumeLower: 521,
  CostumeGarment: 522,
  ShadowWeapon: 280,
  ShadowArmor: 526,
  ShadowShield: 527,
  ShadowBoot: 528,
  ShadowEarring: 529,
  ShadowPendant: 530,
  Arrow: 1024,
  Cannonball: 1025,
  Kunai: 1026,
  Bullet: 1027,
};

const LOCAL_CARD_POSITION = {
  Weapon: 0,
  Head: 769,
  Shield: 32,
  Armor: 16,
  Garment: 4,
  Boot: 64,
  AccessoryBoth: 136,
  AccessoryLeft: 128,
  AccessoryRight: 8,
};

const WEAPON_SUBTYPE_BY_TOKEN = {
  dagger: 256,
  sword: 257,
  twohandedsword: 258,
  spear: 259,
  twohandedspear: 260,
  axe: 261,
  twohandedaxe: 262,
  mace: 263,
  twohandedmace: 264,
  rod: 265,
  twohandedrod: 266,
  staff: 266,
  bow: 267,
  fistweapon: 268,
  knuckle: 268,
  instrument: 269,
  whip: 270,
  book: 271,
  katar: 272,
  revolver: 273,
  rifle: 274,
  gatlinggun: 275,
  shotgun: 276,
  grenadelauncher: 277,
  shuriken: 278,
};

const LOCAL_HEAD_GEAR_LOCATION = {
  Middle: 'Middle',
  Lower: 'Lower',
};

const JOB_TITLE_ALIASES = {
  arcmage: 'ArchMage',
  gltcross: 'GuillotineCross',
  summoner: 'Doram',
  supernovice2: 'SuperNovice',
};

function toToken(value) {
  return normalizeName(value).replace(/\s+/g, '');
}

function parseNumber(value, fallback = null) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseStatFromDescription(description, label) {
  const match = String(description ?? '').match(new RegExp(`${label}\\s*:\\s*(\\d+)`, 'i'));
  return match ? Number(match[1]) : null;
}

function inferCanGrade(description) {
  return /\bGrade\b/i.test(String(description ?? ''));
}

function inferIsRefinable(itemTypeId, itemSubTypeId, description, canGrade) {
  if (itemTypeId !== LOCAL_ITEM_TYPE_ID.WEAPON && itemTypeId !== LOCAL_ITEM_TYPE_ID.ARMOR) {
    return undefined;
  }
  if (canGrade) return true;
  if (itemTypeId === LOCAL_ITEM_TYPE_ID.WEAPON) return true;
  if (itemTypeId === LOCAL_ITEM_TYPE_ID.ARMOR) {
    if ([
      LOCAL_ITEM_SUBTYPE_ID.Armor,
      LOCAL_ITEM_SUBTYPE_ID.Shield,
      LOCAL_ITEM_SUBTYPE_ID.Garment,
      LOCAL_ITEM_SUBTYPE_ID.Boot,
      LOCAL_ITEM_SUBTYPE_ID.ShadowWeapon,
      LOCAL_ITEM_SUBTYPE_ID.ShadowArmor,
      LOCAL_ITEM_SUBTYPE_ID.ShadowShield,
      LOCAL_ITEM_SUBTYPE_ID.ShadowBoot,
      LOCAL_ITEM_SUBTYPE_ID.ShadowEarring,
      LOCAL_ITEM_SUBTYPE_ID.ShadowPendant,
    ].includes(itemSubTypeId)) {
      return true;
    }
  }

  return /\brefine\b/i.test(String(description ?? '')) ? true : undefined;
}

function normalizeJobs(jobs) {
  return [...new Set(jobs.filter(Boolean))];
}

function resolveUsableClasses(pagePayload, classNames) {
  const classEntries = [...classNames];
  const byToken = new Map(classEntries.map((value) => [toToken(value), value]));

  if (pagePayload.jobsLine && /all jobs/i.test(pagePayload.jobsLine)) {
    return ['all'];
  }

  const enabledJobs = [];
  for (const rawJobName of pagePayload.enabledJobs ?? []) {
    const normalized = toToken(rawJobName);
    const found = byToken.get(normalized) ?? JOB_TITLE_ALIASES[normalized];
    if (found) {
      enabledJobs.push(found);
    }
  }

  if (enabledJobs.length > 0) {
    return normalizeJobs(enabledJobs);
  }

  const jobsLine = pagePayload.jobsLine ?? '';
  const matches = [];
  const jobsLineToken = toToken(jobsLine);

  if (JOB_TITLE_ALIASES[jobsLineToken]) {
    matches.push(JOB_TITLE_ALIASES[jobsLineToken]);
  }

  for (const className of classEntries) {
    const token = toToken(className);
    if (!token || token === 'all') continue;
    if (jobsLineToken.includes(token)) {
      matches.push(className);
    }
  }

  return normalizeJobs(matches);
}

function mapWeaponSubtype(apiItem, pagePayload) {
  const apiSubType = parseNumber(apiItem.itemSubTypeId);
  if (apiSubType && Object.values(WEAPON_SUBTYPE_BY_TOKEN).includes(apiSubType)) {
    return apiSubType;
  }

  const subtypeToken = toToken(pagePayload.subtype);
  return WEAPON_SUBTYPE_BY_TOKEN[subtypeToken] ?? null;
}

function mapAmmoSubtype(pagePayload) {
  const token = toToken(pagePayload.subtype);
  if (token.includes('arrow')) return LOCAL_ITEM_SUBTYPE_ID.Arrow;
  if (token.includes('bullet')) return LOCAL_ITEM_SUBTYPE_ID.Bullet;
  if (token.includes('kunai')) return LOCAL_ITEM_SUBTYPE_ID.Kunai;
  if (token.includes('cannonball')) return LOCAL_ITEM_SUBTYPE_ID.Cannonball;
  return null;
}

function mapCardPosition(apiItem, pagePayload) {
  const compositionPos = parseNumber(apiItem.compositionPos);
  if (Object.values(LOCAL_CARD_POSITION).includes(compositionPos)) {
    return compositionPos;
  }

  const token = `${toToken(pagePayload.subtype)} ${toToken(pagePayload.location)}`.trim();
  if (token.includes('weapon')) return LOCAL_CARD_POSITION.Weapon;
  if (token.includes('head')) return LOCAL_CARD_POSITION.Head;
  if (token.includes('shield')) return LOCAL_CARD_POSITION.Shield;
  if (token.includes('armor') || token.includes('body')) return LOCAL_CARD_POSITION.Armor;
  if (token.includes('garment')) return LOCAL_CARD_POSITION.Garment;
  if (token.includes('shoe') || token.includes('boot') || token.includes('footgear')) return LOCAL_CARD_POSITION.Boot;
  if (token.includes('leftaccessory')) return LOCAL_CARD_POSITION.AccessoryLeft;
  if (token.includes('rightaccessory')) return LOCAL_CARD_POSITION.AccessoryRight;
  if (token.includes('accessory')) return LOCAL_CARD_POSITION.AccessoryBoth;
  return null;
}

function mapArmorSubtype(pagePayload) {
  const typeToken = toToken(pagePayload.type);
  const subtypeToken = toToken(pagePayload.subtype);
  const locationToken = toToken(pagePayload.location);
  const token = `${typeToken} ${subtypeToken} ${locationToken}`.trim();

  if (token.includes('shadowweapon')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.ShadowWeapon, location: null };
  }
  if (token.includes('shadowarmor')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.ShadowArmor, location: null };
  }
  if (token.includes('shadowshield')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.ShadowShield, location: null };
  }
  if (token.includes('shadowshoe') || token.includes('shadowboot')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.ShadowBoot, location: null };
  }
  if (token.includes('shadowearring')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.ShadowEarring, location: null };
  }
  if (token.includes('shadowpendant')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.ShadowPendant, location: null };
  }
  if (token.includes('costume')) {
    if (token.includes('middle')) {
      return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.CostumeMiddle, location: null };
    }
    if (token.includes('lower')) {
      return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.CostumeLower, location: null };
    }
    if (token.includes('garment')) {
      return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.CostumeGarment, location: null };
    }
    if (token.includes('upper') || token.includes('head')) {
      return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.CostumeUpper, location: null };
    }
    return null;
  }
  if (token.includes('upper') || token.includes('upperhead')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Upper, location: null };
  }
  if (token.includes('middle') || token.includes('middlehead')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Upper, location: LOCAL_HEAD_GEAR_LOCATION.Middle };
  }
  if (token.includes('lower') || token.includes('lowerhead')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Upper, location: LOCAL_HEAD_GEAR_LOCATION.Lower };
  }
  if (token.includes('shield')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Shield, location: null };
  }
  if (token.includes('garment') || token.includes('manteau') || token.includes('cloak')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Garment, location: null };
  }
  if (token.includes('shoe') || token.includes('boot') || token.includes('footgear')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Boot, location: null };
  }
  if (token.includes('rightaccessory')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.AccessoryRight, location: null };
  }
  if (token.includes('leftaccessory')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.AccessoryLeft, location: null };
  }
  if (token.includes('accessory')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Accessory, location: null };
  }
  if (token.includes('body') || token.includes('armor')) {
    return { itemSubTypeId: LOCAL_ITEM_SUBTYPE_ID.Armor, location: null };
  }

  return null;
}

function mapPlacement(apiItem, pagePayload) {
  const typeToken = toToken(pagePayload.type);
  const subtypeToken = toToken(pagePayload.subtype);

  if (typeToken.includes('consumable')) {
    return { supported: false, reason: 'Consumables are outside the v1 add-item workflow.' };
  }
  if (typeToken.includes('costume') || subtypeToken.includes('costume')) {
    return { supported: false, reason: 'Costume items are outside the v1 add-item workflow.' };
  }
  if (typeToken.includes('etc') || typeToken.includes('other')) {
    return { supported: false, reason: 'ETC and Other items are outside the v1 add-item workflow.' };
  }
  if (typeToken.includes('enchant') || subtypeToken.includes('enchant')) {
    return { supported: false, reason: 'Enchant items require side-table handling and are outside the automatic apply path.' };
  }
  if (typeToken.includes('card')) {
    const compositionPos = mapCardPosition(apiItem, pagePayload);
    if (compositionPos == null) {
      return { supported: false, reason: 'Unable to map the card composition position into the calculator format.' };
    }
    return {
      supported: true,
      itemTypeId: LOCAL_ITEM_TYPE_ID.CARD,
      itemSubTypeId: 0,
      compositionPos,
      location: null,
    };
  }
  if (typeToken.includes('ammo') || typeToken.includes('ammunition')) {
    const itemSubTypeId = mapAmmoSubtype(pagePayload);
    if (itemSubTypeId == null) {
      return { supported: false, reason: 'Unable to map the ammunition subtype into the calculator format.' };
    }
    return {
      supported: true,
      itemTypeId: LOCAL_ITEM_TYPE_ID.AMMO,
      itemSubTypeId,
      compositionPos: null,
      location: null,
    };
  }
  if (typeToken.includes('weapon')) {
    const itemSubTypeId = mapWeaponSubtype(apiItem, pagePayload);
    if (itemSubTypeId == null) {
      return { supported: false, reason: 'Unable to map the weapon subtype into the calculator format.' };
    }
    return {
      supported: true,
      itemTypeId: LOCAL_ITEM_TYPE_ID.WEAPON,
      itemSubTypeId,
      compositionPos: null,
      location: null,
    };
  }

  const armorPlacement = mapArmorSubtype(pagePayload);
  if (armorPlacement == null) {
    return { supported: false, reason: 'Unable to map the equipment slot into the calculator format.' };
  }

  return {
    supported: true,
    itemTypeId: LOCAL_ITEM_TYPE_ID.ARMOR,
    itemSubTypeId: armorPlacement.itemSubTypeId,
    compositionPos: null,
    location: armorPlacement.location,
  };
}

function shouldRequireManualFollowUp(itemTypeId) {
  return itemTypeId === LOCAL_ITEM_TYPE_ID.CONSUMABLE || itemTypeId === LOCAL_ITEM_TYPE_ID.ENCHANT;
}

export function mapDivinePrideItem({ apiItem, pagePayload, classNames }) {
  const warnings = [];
  const blockingWarnings = [];

  const placement = mapPlacement(apiItem, pagePayload);
  if (!placement.supported) {
    blockingWarnings.push(placement.reason);
  }

  const description = pagePayload.description || apiItem.description || '';
  const canGrade = inferCanGrade(description);
  const attack = apiItem.attack ?? parseStatFromDescription(description, 'Atk');
  const defense = apiItem.defense ?? parseStatFromDescription(description, 'Defense');
  const itemLevel = apiItem.itemLevel
    ?? parseStatFromDescription(description, 'Armor Level')
    ?? parseStatFromDescription(description, 'Weapon Level');
  const requiredLevel = apiItem.requiredLevel ?? parseStatFromDescription(description, 'Required Level');
  const usableClass = resolveUsableClasses(pagePayload, classNames);

  if (!usableClass.length) {
    if (pagePayload.jobsLine && !/all jobs/i.test(pagePayload.jobsLine)) {
      blockingWarnings.push('Could not derive a usableClass list from the Divine Pride page. Review and map the job restrictions before apply.');
    } else {
      warnings.push('Could not derive a usableClass list from the Divine Pride page. Review before apply.');
    }
  }

  const mappedItem = toStableItemObject({
    id: Number(apiItem.id),
    aegisName: apiItem.aegisName ?? pagePayload.aegisName ?? apiItem.name,
    name: apiItem.name ?? pagePayload.name,
    unidName: apiItem.unidName ?? (placement.itemTypeId === LOCAL_ITEM_TYPE_ID.CARD ? 'Card' : (pagePayload.subtype ?? pagePayload.type ?? apiItem.name)),
    resName: apiItem.resName ?? apiItem.name ?? pagePayload.name,
    description,
    slots: apiItem.slots ?? 0,
    itemTypeId: placement.itemTypeId ?? null,
    itemSubTypeId: placement.itemSubTypeId ?? null,
    itemLevel,
    attack,
    ...(apiItem.propertyAtk != null ? { propertyAtk: apiItem.propertyAtk } : {}),
    defense,
    weight: apiItem.weight ?? pagePayload.weight ?? 0,
    requiredLevel,
    location: placement.location ?? null,
    compositionPos: placement.compositionPos ?? null,
    isRefinable: placement.supported
      ? inferIsRefinable(placement.itemTypeId, placement.itemSubTypeId, description, canGrade)
      : undefined,
    canGrade: canGrade || undefined,
    usableClass: usableClass.length > 0 ? usableClass : undefined,
    script: {},
  });

  if (placement.supported && shouldRequireManualFollowUp(mappedItem.itemTypeId)) {
    blockingWarnings.push('This item type requires manual side-table updates and is outside the one-step apply path.');
  }

  return {
    item: mappedItem,
    warnings,
    blockingWarnings,
    mappedPlacement: placement.supported
      ? {
          itemTypeId: mappedItem.itemTypeId,
          itemSubTypeId: mappedItem.itemSubTypeId,
          location: mappedItem.location,
          compositionPos: mappedItem.compositionPos,
        }
      : null,
  };
}
