import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(moduleDir, '..', '..');
export const itemJsonPath = path.join(repoRoot, 'src/assets/demo/data/item.json');
export const itemIconDir = path.join(repoRoot, 'src/assets/demo/images/items');
export const draftRootDir = path.join(repoRoot, '.codex/item-import');
export const localConfigPath = path.join(repoRoot, '.divine-pride.local.json');
export const localConfigExamplePath = path.join(repoRoot, '.divine-pride.local.example.json');
export const classNameSourcePath = path.join(repoRoot, 'src/app/jobs/_class-name.ts');
export const bonusSourcePath = path.join(repoRoot, 'src/app/utils/create-raw-total-bonus.ts');
export const skillNameSourcePath = path.join(repoRoot, 'src/app/constants/skill-name.ts');

export function repoRelative(targetPath) {
  return path.relative(repoRoot, targetPath);
}

export async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

export async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(targetPath) {
  return fs.readFile(targetPath, 'utf8');
}

export async function writeText(targetPath, content) {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content, 'utf8');
}

export async function writeBuffer(targetPath, content) {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content);
}

export async function readJson(targetPath) {
  const raw = await readText(targetPath);
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${repoRelative(targetPath)}: ${error.message}`);
  }
}

export async function writeJson(targetPath, payload) {
  await writeText(targetPath, `${JSON.stringify(payload, null, 2)}\n`);
}

export async function copyFile(fromPath, toPath) {
  await ensureDir(path.dirname(toPath));
  await fs.copyFile(fromPath, toPath);
}

export async function removeDir(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

export function normalizeName(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_/\\-]+/g, ' ')
    .replace(/\[(\d+)\]/g, ' $1 ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export async function loadLocalItems() {
  return readJson(itemJsonPath);
}

export function sortItemRecordById(itemRecord) {
  const orderedEntries = Object.entries(itemRecord)
    .sort(([leftId], [rightId]) => Number(leftId) - Number(rightId))
    .map(([id, item]) => [id, toStableItemObject(item)]);

  return Object.fromEntries(orderedEntries);
}

export function toStableItemObject(item) {
  const stable = {
    id: item.id,
    aegisName: item.aegisName,
    name: item.name,
    unidName: item.unidName,
    resName: item.resName,
    description: item.description,
    slots: item.slots,
    itemTypeId: item.itemTypeId,
    itemSubTypeId: item.itemSubTypeId,
    itemLevel: item.itemLevel ?? null,
    attack: item.attack ?? null,
  };

  if (Object.hasOwn(item, 'propertyAtk')) {
    stable.propertyAtk = item.propertyAtk ?? null;
  }

  Object.assign(stable, {
    defense: item.defense ?? null,
    weight: item.weight,
    requiredLevel: item.requiredLevel ?? null,
    location: item.location ?? null,
    compositionPos: item.compositionPos ?? null,
  });

  if (typeof item.isRefinable === 'boolean') {
    stable.isRefinable = item.isRefinable;
  }
  if (item.cardPrefix) {
    stable.cardPrefix = item.cardPrefix;
  }
  if (typeof item.canGrade === 'boolean') {
    stable.canGrade = item.canGrade;
  }
  if (Array.isArray(item.usableClass)) {
    stable.usableClass = item.usableClass;
  }
  if (Array.isArray(item.unusableClass) && item.unusableClass.length > 0) {
    stable.unusableClass = item.unusableClass;
  }

  stable.script = item.script ?? {};
  return stable;
}

export function findLocalNameMatches(items, query) {
  const normalizedQuery = normalizeName(query);
  if (!normalizedQuery) return [];

  return Object.values(items)
    .filter((item) => {
      return [item.name, item.aegisName, item.unidName]
        .filter(Boolean)
        .some((value) => normalizeName(value) === normalizedQuery);
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      aegisName: item.aegisName,
    }));
}

function createTokenSet(value) {
  return new Set(normalizeName(value).split(' ').filter(Boolean));
}

function scoreCandidateName(query, item) {
  const queryTokens = createTokenSet(query);
  const nameTokens = createTokenSet(item.name);
  const aegisTokens = createTokenSet(item.aegisName);

  let overlap = 0;
  for (const token of queryTokens) {
    if (nameTokens.has(token) || aegisTokens.has(token)) {
      overlap += 1;
    }
  }

  const exactName = normalizeName(item.name) === normalizeName(query) ? 10 : 0;
  return overlap + exactName;
}

export function findComparatorItems(items, candidate, queryName) {
  const values = Object.values(items);
  const query = queryName || candidate.name || candidate.aegisName;

  return values
    .filter((item) => item.id !== candidate.id)
    .filter((item) => item.itemTypeId === candidate.itemTypeId)
    .filter((item) => {
      if (candidate.itemTypeId === 6) {
        return item.compositionPos === candidate.compositionPos;
      }

      return item.itemSubTypeId === candidate.itemSubTypeId && (item.location ?? null) === (candidate.location ?? null);
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      aegisName: item.aegisName,
      itemTypeId: item.itemTypeId,
      itemSubTypeId: item.itemSubTypeId,
      location: item.location ?? null,
      compositionPos: item.compositionPos ?? null,
      score: scoreCandidateName(query, item),
      levelDistance: Math.abs((item.requiredLevel ?? 0) - (candidate.requiredLevel ?? 0)),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.levelDistance !== right.levelDistance) return left.levelDistance - right.levelDistance;
      return left.id - right.id;
    })
    .slice(0, 5)
    .map(({ score, levelDistance, ...item }) => item);
}

export function getGitStatusFiles() {
  try {
    const output = execFileSync('git', ['-C', repoRoot, 'status', '--porcelain', '--untracked-files=all'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return output
      .split('\n')
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => {
        const payload = line.slice(3);
        if (payload.includes(' -> ')) {
          return payload.split(' -> ').at(-1);
        }
        return payload;
      });
  } catch {
    return [];
  }
}
