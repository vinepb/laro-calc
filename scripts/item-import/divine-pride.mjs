const DIVINE_PRIDE_API_BASE = 'https://www.divine-pride.net/api/database/Item';
const DIVINE_PRIDE_PAGE_BASE = 'https://www.divine-pride.net/database/item';
const DIVINE_PRIDE_SEARCH_URL = 'https://www.divine-pride.net/database/search';
const DIVINE_PRIDE_ICON_BASE = 'https://static.divine-pride.net/images/items/item';

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
}

async function fetchText(url, timeoutMs) {
  const { controller, timeoutId } = createTimeoutSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'laro-calc-item-import/1.0',
        'accept-language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timeoutId);
  }
}

function decodeHtmlEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    if (entity.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }

    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function stripTags(value, { preserveLineBreaks = false } = {}) {
  let text = String(value ?? '');
  if (preserveLineBreaks) {
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
  }

  text = text.replace(/<[^>]+>/g, '');
  text = decodeHtmlEntities(text);
  text = text.replace(/\r/g, '');
  text = text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

function extractFirst(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1] : null;
}

function parseInfoTable(html) {
  const section = extractFirst(html, /<h3>Item information<\/h3>\s*<table[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
  if (!section) return {};

  const entries = {};
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let rowMatch = rowRegex.exec(section);
  while (rowMatch) {
    const row = rowMatch[1];
    const key = stripTags(extractFirst(row, /<th[^>]*>([\s\S]*?)<\/th>/i) ?? '');
    const value = stripTags(extractFirst(row, /<td[^>]*>([\s\S]*?)<\/td>/i) ?? '');
    if (key) {
      entries[key] = value;
    }
    rowMatch = rowRegex.exec(section);
  }

  return entries;
}

function parseEnabledJobs(html) {
  const jobs = [];
  const jobRegex = /data-original-title="([^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"/gi;
  let match = jobRegex.exec(html);

  while (match) {
    const title = stripTags(match[1]);
    const src = match[2];
    if (title && !src.includes('/disabled/')) {
      jobs.push(title);
    }
    match = jobRegex.exec(html);
  }

  return [...new Set(jobs)];
}

function parseSearchResults(html) {
  const section = extractFirst(html, /<div class="tab-pane" id="items">([\s\S]*?)<\/table>/i);
  if (!section) return [];

  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  const results = [];
  let match = rowRegex.exec(section);

  while (match) {
    const row = match[1];
    const idMatch = row.match(/href="\/database\/item\/(\d+)(?:\/[^"]*)?"/i);
    if (!idMatch) {
      match = rowRegex.exec(section);
      continue;
    }

    const columns = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((entry) => entry[1]);
    const name = stripTags(columns[0] ?? '');
    const type = stripTags(columns[1] ?? '');
    const subtype = stripTags(columns[2] ?? '');
    const servers = [...(columns[3] ?? '').matchAll(/badge[^>]*>([^<]+)</gi)].map((entry) => stripTags(entry[1]));

    results.push({
      id: Number(idMatch[1]),
      name,
      type,
      subtype,
      servers,
    });

    match = rowRegex.exec(section);
  }

  return results;
}

function parseNumericValue(value) {
  const match = String(value ?? '').match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

export function getDivinePrideApiUrl(id, apiKey, server) {
  const url = new URL(`${DIVINE_PRIDE_API_BASE}/${id}`);
  url.searchParams.set('apiKey', apiKey);
  if (server) {
    url.searchParams.set('server', server);
  }
  return url.toString();
}

export function getDivinePridePageUrl(id) {
  return `${DIVINE_PRIDE_PAGE_BASE}/${id}/`;
}

export function getDivinePrideIconUrl(id) {
  return `${DIVINE_PRIDE_ICON_BASE}/${id}.png`;
}

export async function fetchDivinePrideItemApi({ id, apiKey, server, timeoutMs }) {
  const url = getDivinePrideApiUrl(id, apiKey, server);
  const { response, body } = await fetchText(url, timeoutMs);

  if (!response.ok) {
    const detail = body.slice(0, 300).trim() || `HTTP ${response.status}`;
    throw new Error(`Divine Pride API request failed for item ${id} on server "${server}": ${detail}`);
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    throw new Error(`Divine Pride API returned invalid JSON for item ${id}: ${error.message}`);
  }

  if (!payload || typeof payload !== 'object' || Number(payload.id) !== Number(id)) {
    throw new Error(`Divine Pride API did not return a valid item payload for ${id}.`);
  }

  return { url, payload };
}

export async function fetchDivinePrideItemPage({ id, timeoutMs }) {
  const url = getDivinePridePageUrl(id);
  const { response, body } = await fetchText(url, timeoutMs);

  if (!response.ok) {
    throw new Error(`Divine Pride item page request failed for item ${id}: HTTP ${response.status}`);
  }

  const name = stripTags(extractFirst(body, /<legend class="entry-title">[\s\S]*?class="skill-icon"[^>]*>\s*([^<]+?)\s*(?:<br|<small)/i) ?? '');
  const aegisLine = stripTags(extractFirst(body, /<small[^>]*class="text-muted[^"]*"[^>]*>([\s\S]*?)<\/small>/i) ?? '');
  const descriptionHtml = extractFirst(body, /<table class="mon_table">[\s\S]*?<p>([\s\S]*?)<\/p>/i) ?? '';
  const description = stripTags(descriptionHtml, { preserveLineBreaks: true });
  const info = parseInfoTable(body);
  const jobsLineMatch = description.match(/Jobs:\s*([^\n]+)/i);
  const iconUrl = extractFirst(body, /<meta property="og:image" content="([^"]+)"/i) ?? getDivinePrideIconUrl(id);

  return {
    url,
    payload: {
      id,
      name,
      aegisName: aegisLine.replace(/^\d+\s+/, '').trim() || null,
      description,
      info,
      jobsLine: jobsLineMatch ? jobsLineMatch[1].trim() : null,
      enabledJobs: parseEnabledJobs(body),
      iconUrl,
      weight: parseNumericValue(info.Weight),
      type: info.Type ?? null,
      subtype: info.Subtype ?? null,
      location: info.Location ?? null,
    },
  };
}

export async function searchDivinePrideItemsByName({ query, timeoutMs }) {
  const url = new URL(DIVINE_PRIDE_SEARCH_URL);
  url.searchParams.set('q', query);

  const { response, body } = await fetchText(url.toString(), timeoutMs);
  if (!response.ok) {
    throw new Error(`Divine Pride search request failed for "${query}": HTTP ${response.status}`);
  }

  return parseSearchResults(body);
}

export async function downloadDivinePrideIcon({ id, timeoutMs }) {
  const url = getDivinePrideIconUrl(id);
  const { controller, timeoutId } = createTimeoutSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'laro-calc-item-import/1.0',
        'accept-language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, url, buffer: null };
    }

    const arrayBuffer = await response.arrayBuffer();
    return { ok: true, url, buffer: Buffer.from(arrayBuffer) };
  } finally {
    clearTimeout(timeoutId);
  }
}
