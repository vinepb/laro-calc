import { repoRelative, writeText, readText } from './io.mjs';

const META_START = '<!-- item-import-meta';
const META_END = '-->';

export function createReviewContent({
  meta,
  candidate,
  comparatorItems,
  localNameMatches,
  searchResults,
}) {
  const comparatorLines = comparatorItems.length > 0
    ? comparatorItems.map((item) => `- ${item.id}: ${item.name} (${item.aegisName})`).join('\n')
    : '- None found';

  const localMatchLines = localNameMatches.length > 0
    ? localNameMatches.map((item) => `- ${item.id}: ${item.name} (${item.aegisName})`).join('\n')
    : '- None';

  const searchResultLines = searchResults.length > 0
    ? searchResults.map((item) => `- ${item.id}: ${item.name} [${item.type}${item.subtype ? ` / ${item.subtype}` : ''}]`).join('\n')
    : '- Not applicable';

  const blockingLines = meta.blockingWarnings.length > 0
    ? meta.blockingWarnings.map((warning) => `- ${warning}`).join('\n')
    : '- None';

  const warningLines = meta.nonBlockingWarnings.length > 0
    ? meta.nonBlockingWarnings.map((warning) => `- ${warning}`).join('\n')
    : '- None';

  return `${META_START}
${JSON.stringify(meta, null, 2)}
${META_END}

# Item Import Review

- Input: ${meta.input}
- Resolved ID: ${meta.resolvedId}
- Resolved Name: ${meta.resolvedName}
- Divine Pride server: ${meta.server}
- Divine Pride API URL: ${meta.apiUrl}
- Divine Pride page URL: ${meta.pageUrl}
- Candidate item: ${candidate.name}
- Draft dir: ${repoRelative(meta.draftDir)}
- Script status: ${meta.scriptStatus}
- Apply blocked: ${meta.applyBlocked ? 'yes' : 'no'}
- Icon downloaded: ${meta.iconDownloaded ? 'yes' : 'no'}

## Blocking Warnings
${blockingLines}

## Non-Blocking Warnings
${warningLines}

## Local Duplicate Name Matches
${localMatchLines}

## Divine Pride Search Matches
${searchResultLines}

## Mapped Slot Summary
- itemTypeId: ${candidate.itemTypeId}
- itemSubTypeId: ${candidate.itemSubTypeId}
- location: ${candidate.location ?? 'null'}
- compositionPos: ${candidate.compositionPos ?? 'null'}

## Comparator Items
${comparatorLines}

## Review Checklist
- Confirm the mapped slot/category values are correct.
- Write or adjust the calculator \`script\` in \`candidate.item.json\`.
- If the item script is ready, set \`scriptStatus\` to \`reviewed\` in the metadata block above.
- If the item intentionally has no script, set \`scriptStatus\` to \`scriptless-approved\` in the metadata block above.
- Set \`applyBlocked\` to \`false\` in the metadata block above only after the draft is ready to merge.
- Clear any resolved blocking warnings in the metadata block before apply.
`;
}

export async function writeReviewFile(targetPath, payload) {
  await writeText(targetPath, createReviewContent(payload));
}

export async function readReviewMeta(reviewPath) {
  const content = await readText(reviewPath);
  const startIndex = content.indexOf(META_START);
  const endIndex = content.indexOf(META_END, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Missing item-import metadata block in ${repoRelative(reviewPath)}.`);
  }

  const jsonText = content.slice(startIndex + META_START.length, endIndex).trim();

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Invalid item-import metadata JSON in ${repoRelative(reviewPath)}: ${error.message}`);
  }
}
