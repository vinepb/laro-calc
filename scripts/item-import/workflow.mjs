import path from 'node:path';

import {
  copyFile,
  draftRootDir,
  ensureDir,
  fileExists,
  findComparatorItems,
  findLocalNameMatches,
  getGitStatusFiles,
  itemIconDir,
  itemJsonPath,
  loadLocalItems,
  localConfigExamplePath,
  localConfigPath,
  normalizeName,
  readJson,
  removeDir,
  repoRelative,
  sortItemRecordById,
  toStableItemObject,
  writeBuffer,
  writeJson,
  classNameSourcePath,
  readText,
} from './io.mjs';
import {
  DEFAULT_DIVINE_PRIDE_LANGUAGE,
  downloadDivinePrideIcon,
  fetchDivinePrideItemApi,
  getDivinePridePageUrl,
  searchDivinePrideItemsByName,
} from './divine-pride.mjs';
import { mapDivinePrideItem } from './mapping.mjs';
import { createReviewContent, readReviewMeta, writeReviewFile } from './review.mjs';
import { validateCandidateItem } from './validation.mjs';

const SERVER_CANONICAL_MAP = new Map([
  ['aro', 'aRO'],
  ['bro', 'bRO'],
  ['cro', 'cRO'],
  ['dpro', 'dpRO'],
  ['fro', 'fRO'],
  ['ggh', 'GGH'],
  ['idro', 'idRO'],
  ['iro', 'iRO'],
  ['iroc', 'iROC'],
  ['jro', 'jRO'],
  ['krom', 'kROM'],
  ['kros', 'kROS'],
  ['kroz', 'kROZ'],
  ['krozs', 'kROZS'],
  ['latam', 'LATAM'],
  ['ropeu', 'ropEU'],
  ['ropru', 'ropRU'],
  ['throc', 'thROC'],
  ['throg', 'thROG'],
  ['twro', 'twRO'],
  ['twroz', 'twROZ'],
  ['vnro', 'vnRO'],
]);

function canonicalizeServer(server) {
  if (!server) return '';
  return SERVER_CANONICAL_MAP.get(String(server).trim().toLowerCase()) ?? String(server).trim();
}

function canonicalizeLanguage(language) {
  return String(language ?? '').trim();
}

async function loadLocalConfig() {
  if (!(await fileExists(localConfigPath))) {
    throw new Error(
      `Missing ${repoRelative(localConfigPath)}. Copy ${repoRelative(localConfigExamplePath)} and add your Divine Pride API key.`,
    );
  }

  const config = await readJson(localConfigPath);
  if (!config.apiKey || typeof config.apiKey !== 'string') {
    throw new Error(`Invalid ${repoRelative(localConfigPath)}: "apiKey" must be a non-empty string.`);
  }

  return {
    apiKey: config.apiKey,
    defaultServer: canonicalizeServer(config.defaultServer || 'LATAM'),
    defaultLanguage: canonicalizeLanguage(config.defaultLanguage || DEFAULT_DIVINE_PRIDE_LANGUAGE),
    timeoutMs: Number.isFinite(config.timeoutMs) ? Number(config.timeoutMs) : 20000,
  };
}

async function loadClassNames() {
  const source = await readText(classNameSourcePath);
  const block = source.match(/export enum ClassName \{([\s\S]*?)\n\}/);
  const values = new Set();

  for (const match of block?.[1].matchAll(/=\s*'([^']+)'/g) ?? []) {
    values.add(match[1]);
  }

  return values;
}

function rankSearchResults(results, query) {
  const normalizedQuery = normalizeName(query);

  return [...results].sort((left, right) => {
    const leftExact = normalizeName(left.name) === normalizedQuery ? 1 : 0;
    const rightExact = normalizeName(right.name) === normalizedQuery ? 1 : 0;
    if (rightExact !== leftExact) return rightExact - leftExact;
    return left.id - right.id;
  });
}

async function resolveItemInput({ itemInput, localItems, timeoutMs, language }) {
  const localNameMatches = findLocalNameMatches(localItems, itemInput);

  if (/^\d+$/.test(itemInput.trim())) {
    return {
      resolvedId: Number(itemInput.trim()),
      resolvedName: null,
      localNameMatches,
      searchResults: [],
    };
  }

  const searchResults = rankSearchResults(
    await searchDivinePrideItemsByName({ query: itemInput, timeoutMs, language }),
    itemInput,
  );

  if (searchResults.length === 0) {
    throw new Error(`No Divine Pride item search results were found for "${itemInput}".`);
  }

  const exactMatches = searchResults.filter((item) => normalizeName(item.name) === normalizeName(itemInput));
  const candidates = exactMatches.length > 0 ? exactMatches : searchResults;

  if (candidates.length !== 1) {
    const candidateLines = candidates
      .slice(0, 10)
      .map((item) => `${item.id}: ${item.name} [${item.type}${item.subtype ? ` / ${item.subtype}` : ''}]`);
    throw new Error(
      `Multiple Divine Pride items match "${itemInput}". Use an explicit item ID.\n${candidateLines.join('\n')}`,
    );
  }

  return {
    resolvedId: candidates[0].id,
    resolvedName: candidates[0].name,
    localNameMatches,
    searchResults,
  };
}

function createDraftMeta({
  draftDir,
  input,
  resolvedId,
  resolvedName,
  server,
  language,
  apiUrl,
  pageUrl,
  iconDownloaded,
  blockingWarnings,
  nonBlockingWarnings,
  duplicateLocalItemIds,
}) {
  return {
    version: 1,
    input,
    resolvedId,
    resolvedName,
    server,
    language,
    apiUrl,
    pageUrl,
    draftDir,
    scriptStatus: 'pending-review',
    applyBlocked: true,
    blockingWarnings,
    nonBlockingWarnings,
    duplicateLocalItemIds,
    iconDownloaded,
    expectedChangedFiles: [
      repoRelative(itemJsonPath),
      repoRelative(path.join(itemIconDir, `${resolvedId}.png`)),
    ],
    preparedAt: new Date().toISOString(),
  };
}

export async function prepareDraft({ itemInput, serverOverride, languageOverride }) {
  const [config, localItems, classNames] = await Promise.all([
    loadLocalConfig(),
    loadLocalItems(),
    loadClassNames(),
  ]);

  const resolved = await resolveItemInput({
    itemInput,
    localItems,
    timeoutMs: config.timeoutMs,
    language: canonicalizeLanguage(languageOverride ?? config.defaultLanguage),
  });

  const resolvedId = resolved.resolvedId;
  const server = canonicalizeServer(serverOverride ?? config.defaultServer);
  const language = canonicalizeLanguage(languageOverride ?? config.defaultLanguage);
  const draftDir = path.join(draftRootDir, String(resolvedId));

  await removeDir(draftDir);
  await ensureDir(draftDir);

  const pageUrl = getDivinePridePageUrl(resolvedId);
  const { url: apiUrl, payload: apiItem } = await fetchDivinePrideItemApi({
    id: resolvedId,
    apiKey: config.apiKey,
    server,
    language,
    timeoutMs: config.timeoutMs,
  });

  const mapped = mapDivinePrideItem({
    apiItem,
    classNames,
  });

  const candidate = mapped.item;
  const blockingWarnings = [...mapped.blockingWarnings];
  const nonBlockingWarnings = [...mapped.warnings];

  if (localItems[String(candidate.id)]) {
    blockingWarnings.push(`Item id ${candidate.id} already exists in src/assets/demo/data/item.json.`);
  }
  if (resolved.localNameMatches.length > 0) {
    nonBlockingWarnings.push('Local items already exist with the same normalized name. Review for duplicates.');
  }
  nonBlockingWarnings.push('Confirm manually whether this item also needs _enchant_table.ts or another side-table update before apply.');

  const iconDownload = await downloadDivinePrideIcon({
    id: resolvedId,
    language,
    timeoutMs: config.timeoutMs,
  });
  const iconPath = path.join(draftDir, 'icon.png');
  if (iconDownload.ok && iconDownload.buffer) {
    await writeBuffer(iconPath, iconDownload.buffer);
  } else {
    nonBlockingWarnings.push('The Divine Pride icon could not be downloaded. Apply will require an override or a manual icon.');
  }

  blockingWarnings.push('Calculator script review is still required before apply.');

  const meta = createDraftMeta({
    draftDir,
    input: itemInput,
    resolvedId,
    resolvedName: candidate.name || resolved.resolvedName || apiItem.name,
    server,
    language,
    apiUrl,
    pageUrl,
    iconDownloaded: iconDownload.ok,
    blockingWarnings,
    nonBlockingWarnings,
    duplicateLocalItemIds: resolved.localNameMatches.map((item) => item.id),
  });

  const comparatorItems = findComparatorItems(localItems, candidate, itemInput);

  await writeJson(path.join(draftDir, 'source.json'), {
    apiItem,
    searchResults: resolved.searchResults,
  });
  await writeJson(path.join(draftDir, 'candidate.item.json'), candidate);
  await writeReviewFile(path.join(draftDir, 'review.md'), {
    meta,
    candidate,
    comparatorItems,
    localNameMatches: resolved.localNameMatches,
    searchResults: resolved.searchResults,
  });

  return {
    draftDir,
    resolvedId,
    reviewPath: path.join(draftDir, 'review.md'),
    blockingWarnings,
  };
}

async function readDraftFiles(draftDir) {
  const absoluteDraftDir = path.isAbsolute(draftDir) ? draftDir : path.resolve(process.cwd(), draftDir);
  const candidatePath = path.join(absoluteDraftDir, 'candidate.item.json');
  const reviewPath = path.join(absoluteDraftDir, 'review.md');
  const iconDraftPath = path.join(absoluteDraftDir, 'icon.png');

  if (!(await fileExists(candidatePath))) {
    throw new Error(`Missing ${repoRelative(candidatePath)}.`);
  }
  if (!(await fileExists(reviewPath))) {
    throw new Error(`Missing ${repoRelative(reviewPath)}.`);
  }

  const [candidate, reviewMeta] = await Promise.all([
    readJson(candidatePath),
    readReviewMeta(reviewPath),
  ]);

  return {
    absoluteDraftDir,
    candidatePath,
    reviewPath,
    iconDraftPath,
    candidate: toStableItemObject(candidate),
    reviewMeta,
  };
}

export async function applyDraft({ draftDir, allowMissingIcon = false }) {
  const { absoluteDraftDir, iconDraftPath, candidate, reviewMeta, reviewPath } = await readDraftFiles(draftDir);
  const validation = await validateCandidateItem(candidate);

  if (validation.errors.length > 0) {
    throw new Error(`Candidate item is invalid:\n${validation.errors.join('\n')}`);
  }
  if (reviewMeta.applyBlocked) {
    throw new Error(`Draft is still blocked in ${repoRelative(reviewPath)}.`);
  }
  if (!['reviewed', 'scriptless-approved'].includes(reviewMeta.scriptStatus)) {
    throw new Error(`Draft scriptStatus must be "reviewed" or "scriptless-approved" in ${repoRelative(reviewPath)} before apply.`);
  }
  if ((reviewMeta.blockingWarnings ?? []).length > 0) {
    throw new Error(`Resolve the blocking warnings in ${repoRelative(reviewPath)} before apply.`);
  }
  if (Object.keys(candidate.script ?? {}).length === 0 && reviewMeta.scriptStatus !== 'scriptless-approved') {
    throw new Error(`Draft script is still empty. Review the script or mark scriptStatus as "scriptless-approved" in ${repoRelative(reviewPath)}.`);
  }

  const localItems = await loadLocalItems();
  if (localItems[String(candidate.id)]) {
    throw new Error(`Item id ${candidate.id} already exists in ${repoRelative(itemJsonPath)}.`);
  }

  const iconTargetPath = path.join(itemIconDir, `${candidate.id}.png`);
  if (!(await fileExists(iconDraftPath)) && !allowMissingIcon) {
    throw new Error(`Missing staged icon ${repoRelative(iconDraftPath)}. Use --allow-missing-icon only if you intend to add the icon manually.`);
  }

  const mergedItems = sortItemRecordById({
    ...localItems,
    [String(candidate.id)]: candidate,
  });

  await writeJson(itemJsonPath, mergedItems);
  if (await fileExists(iconDraftPath)) {
    await copyFile(iconDraftPath, iconTargetPath);
  }

  const updatedMeta = {
    ...reviewMeta,
    appliedAt: new Date().toISOString(),
    applyBlocked: false,
  };

  const sourceJson = await readJson(path.join(absoluteDraftDir, 'source.json'));
  const comparatorItems = findComparatorItems(localItems, candidate, candidate.name);
  await writeReviewFile(reviewPath, {
    meta: updatedMeta,
    candidate,
    comparatorItems,
    localNameMatches: reviewMeta.duplicateLocalItemIds.map((id) => {
      const item = localItems[String(id)];
      return item ? { id: item.id, name: item.name, aegisName: item.aegisName } : { id, name: 'Unknown local item', aegisName: '' };
    }),
    searchResults: sourceJson.searchResults ?? [],
  });

  const changedFiles = getGitStatusFiles().filter((file) => updatedMeta.expectedChangedFiles.includes(file));
  return {
    changedFiles,
  };
}
