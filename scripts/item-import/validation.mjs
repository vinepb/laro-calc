import path from 'node:path';

import {
  bonusSourcePath,
  classNameSourcePath,
  fileExists,
  getGitStatusFiles,
  itemJsonPath,
  loadLocalItems,
  readJson,
  readText,
  repoRelative,
  skillNameSourcePath,
} from './io.mjs';
import { readReviewMeta } from './review.mjs';

const SUPPORTED_ITEM_TYPE_IDS = new Set([1, 2, 4, 6]);
const ARMOR_SUBTYPE_IDS = new Set([71, 72, 73, 74, 75, 76, 280, 510, 511, 512, 513, 514, 515, 516, 517, 519, 520, 521, 522, 526, 527, 528, 529, 530]);
const AMMO_SUBTYPE_IDS = new Set([1024, 1025, 1026, 1027]);
const CARD_POSITION_IDS = new Set([0, 4, 8, 16, 32, 64, 128, 136, 769]);
const WEAPON_SUBTYPE_IDS = new Set([256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278]);
const VALID_LOCATIONS = new Set([null, 'Middle', 'Lower']);
const SCRIPT_PREFIXES = ['fix_vct__', 'vct__', 'chance__', 'fctPercent__', 'fct__', 'acd__', 'cd__'];

let cachedClassNames;
let cachedBonusKeys;
let cachedOffensiveSkills;

async function parseClassNames() {
  if (cachedClassNames) return cachedClassNames;

  const source = await readText(classNameSourcePath);
  const enumBlock = source.match(/export enum ClassName \{([\s\S]*?)\n\}/);
  const classNames = new Set();

  for (const match of enumBlock?.[1].matchAll(/=\s*'([^']+)'/g) ?? []) {
    classNames.add(match[1]);
  }

  cachedClassNames = classNames;
  return classNames;
}

async function parseBonusKeys() {
  if (cachedBonusKeys) return cachedBonusKeys;

  const source = await readText(bonusSourcePath);
  const returnBlock = source.match(/return \{([\s\S]*?)\n  \};/);
  const bonusKeys = new Set();

  for (const match of returnBlock?.[1].matchAll(/^\s*([A-Za-z0-9_]+):/gm) ?? []) {
    bonusKeys.add(match[1]);
  }

  cachedBonusKeys = bonusKeys;
  return bonusKeys;
}

async function parseOffensiveSkillNames() {
  if (cachedOffensiveSkills) return cachedOffensiveSkills;

  const source = await readText(skillNameSourcePath);
  const block = source.match(/export const OFFENSIVE_SKILL_NAMES = \[([\s\S]*?)\n\]/);
  const skills = new Set();

  for (const match of block?.[1].matchAll(/'([^']+)'/g) ?? []) {
    skills.add(match[1]);
  }

  cachedOffensiveSkills = skills;
  return skills;
}

function normalizeScriptKey(key) {
  return SCRIPT_PREFIXES.reduce((current, prefix) => current.replace(prefix, ''), key);
}

export async function validateCandidateItem(candidate) {
  const [classNames, bonusKeys, offensiveSkills] = await Promise.all([
    parseClassNames(),
    parseBonusKeys(),
    parseOffensiveSkillNames(),
  ]);

  const errors = [];
  const warnings = [];

  if (!candidate || typeof candidate !== 'object') {
    return { errors: ['Candidate item payload must be an object.'], warnings };
  }

  if (!Number.isInteger(candidate.id)) {
    errors.push('Candidate item id must be an integer.');
  }
  if (!candidate.aegisName || !candidate.name) {
    errors.push('Candidate item must include aegisName and name.');
  }
  if (!SUPPORTED_ITEM_TYPE_IDS.has(candidate.itemTypeId)) {
    errors.push(`Unsupported itemTypeId ${candidate.itemTypeId}.`);
  }

  if (candidate.itemTypeId === 1 && !WEAPON_SUBTYPE_IDS.has(candidate.itemSubTypeId)) {
    errors.push(`Unsupported weapon itemSubTypeId ${candidate.itemSubTypeId}.`);
  }
  if (candidate.itemTypeId === 2 && !ARMOR_SUBTYPE_IDS.has(candidate.itemSubTypeId)) {
    errors.push(`Unsupported equipment itemSubTypeId ${candidate.itemSubTypeId}.`);
  }
  if (candidate.itemTypeId === 4 && !AMMO_SUBTYPE_IDS.has(candidate.itemSubTypeId)) {
    errors.push(`Unsupported ammo itemSubTypeId ${candidate.itemSubTypeId}.`);
  }
  if (candidate.itemTypeId === 6) {
    if (candidate.itemSubTypeId !== 0) {
      errors.push('Cards must use itemSubTypeId 0.');
    }
    if (!CARD_POSITION_IDS.has(candidate.compositionPos)) {
      errors.push(`Unsupported card compositionPos ${candidate.compositionPos}.`);
    }
  }

  if (!VALID_LOCATIONS.has(candidate.location ?? null)) {
    errors.push(`Unsupported location value "${candidate.location}".`);
  }

  for (const fieldName of ['usableClass', 'unusableClass']) {
    const fieldValue = candidate[fieldName];
    if (!fieldValue) continue;

    if (!Array.isArray(fieldValue)) {
      errors.push(`${fieldName} must be an array when present.`);
      continue;
    }

    for (const className of fieldValue) {
      if (!classNames.has(className)) {
        errors.push(`Invalid class name "${className}" in ${fieldName}.`);
      }
    }
  }

  if (!candidate.script || typeof candidate.script !== 'object' || Array.isArray(candidate.script)) {
    errors.push('Candidate script must be an object.');
  } else {
    for (const key of Object.keys(candidate.script)) {
      const normalizedKey = normalizeScriptKey(key);
      if (bonusKeys.has(normalizedKey)) continue;
      if (offensiveSkills.has(normalizedKey)) continue;
      errors.push(`Unknown script key "${key}".`);
    }
  }

  if ((candidate.itemTypeId === 1 || candidate.itemTypeId === 2) && candidate.weight == null) {
    warnings.push('Candidate item is missing weight.');
  }

  return { errors, warnings };
}

export async function validateDraft(draftDir) {
  const absoluteDraftDir = path.isAbsolute(draftDir) ? draftDir : path.resolve(process.cwd(), draftDir);
  const candidatePath = path.join(absoluteDraftDir, 'candidate.item.json');
  const reviewPath = path.join(absoluteDraftDir, 'review.md');
  const iconPath = path.join(absoluteDraftDir, 'icon.png');

  const errors = [];
  const warnings = [];

  if (!(await fileExists(candidatePath))) {
    errors.push(`Missing ${repoRelative(candidatePath)}.`);
    return { errors, warnings };
  }
  if (!(await fileExists(reviewPath))) {
    errors.push(`Missing ${repoRelative(reviewPath)}.`);
    return { errors, warnings };
  }

  const [candidate, reviewMeta] = await Promise.all([
    readJson(candidatePath),
    readReviewMeta(reviewPath),
  ]);

  const candidateValidation = await validateCandidateItem(candidate);
  errors.push(...candidateValidation.errors);
  warnings.push(...candidateValidation.warnings);

  if (reviewMeta.applyBlocked) {
    warnings.push('Draft is still marked as applyBlocked in review.md.');
  }
  if (!['reviewed', 'scriptless-approved'].includes(reviewMeta.scriptStatus)) {
    warnings.push(`Draft script is still marked as ${reviewMeta.scriptStatus}.`);
  }
  if (!(await fileExists(iconPath)) && !reviewMeta.iconDownloaded) {
    warnings.push('No staged icon was found for this draft.');
  }

  const gitStatusFiles = getGitStatusFiles();
  if (reviewMeta.expectedChangedFiles?.length > 0) {
    const unexpectedFiles = gitStatusFiles.filter((file) => !reviewMeta.expectedChangedFiles.includes(file));
    if (unexpectedFiles.length > 0) {
      warnings.push(`Unexpected repo changes detected: ${unexpectedFiles.join(', ')}`);
    }
  }

  return { errors, warnings };
}
