#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const trackingPath = path.join(repoRoot, '.fork-tracking.yml');
const requestedSource = process.argv[2] || null;

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function parseTrackingFile(content) {
  const lines = content.split(/\r?\n/);
  const sources = {};
  let inSources = false;
  let currentSource = null;
  let currentNestedKey = null;

  for (const line of lines) {
    if (!inSources) {
      if (line.trim() === 'sources:') {
        inSources = true;
      }
      continue;
    }

    const sourceMatch = line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
    if (sourceMatch) {
      currentSource = sourceMatch[1];
      sources[currentSource] = {};
      currentNestedKey = null;
      continue;
    }

    if (!currentSource) {
      continue;
    }

    const nestedMatch = line.match(/^    ([A-Za-z0-9_-]+):\s*$/);
    if (nestedMatch) {
      currentNestedKey = nestedMatch[1];
      if (!sources[currentSource][currentNestedKey]) {
        sources[currentSource][currentNestedKey] = {};
      }
      continue;
    }

    const directValueMatch = line.match(/^    ([A-Za-z0-9_-]+):\s*(.+)\s*$/);
    if (directValueMatch) {
      const [, key, rawValue] = directValueMatch;
      sources[currentSource][key] = rawValue === 'null' ? null : unquote(rawValue);
      currentNestedKey = null;
      continue;
    }

    const nestedValueMatch = line.match(/^      ([A-Za-z0-9_-]+):\s*(.+)\s*$/);
    if (nestedValueMatch && currentNestedKey) {
      const [, key, rawValue] = nestedValueMatch;
      if (!sources[currentSource][currentNestedKey] || typeof sources[currentSource][currentNestedKey] !== 'object') {
        sources[currentSource][currentNestedKey] = {};
      }
      sources[currentSource][currentNestedKey][key] = rawValue === 'null' ? null : unquote(rawValue);
    }
  }

  return sources;
}

function buildReviewCommand(sourceName, source) {
  const remoteRef = `${source.remote}/${source.branch}`;
  const compareFrom = source.compare_from;
  const lastReviewedSha = source.last_reviewed?.sha ?? null;

  if (lastReviewedSha) {
    if (compareFrom) {
      return `git log --oneline --reverse ${lastReviewedSha}..${remoteRef} --not ${compareFrom}`;
    }

    return `git log --oneline --reverse ${lastReviewedSha}..${remoteRef}`;
  }

  if (compareFrom) {
    return `git log --oneline --reverse ${compareFrom}..${remoteRef}`;
  }

  return `git log --oneline --reverse ${remoteRef}`;
}

function printSource(sourceName, source) {
  console.log(`${sourceName}`);
  console.log(`  repo: ${source.repo}`);
  console.log(`  remote: ${source.remote}`);
  console.log(`  branch: ${source.branch}`);
  console.log(`  review_status: ${source.review_status}`);
  console.log(`  current_tip: ${source.current_tip?.sha ?? 'unknown'} ${source.current_tip?.date ?? ''}`.trimEnd());

  if (source.last_reviewed?.sha) {
    console.log(`  last_reviewed: ${source.last_reviewed.sha} ${source.last_reviewed.date ?? ''}`.trimEnd());
  } else {
    console.log('  last_reviewed: null');
  }

  console.log(`  review_command: ${buildReviewCommand(sourceName, source)}`);
  console.log('');
}

if (!fs.existsSync(trackingPath)) {
  console.error(`Tracking file not found: ${trackingPath}`);
  process.exit(1);
}

const sources = parseTrackingFile(fs.readFileSync(trackingPath, 'utf8'));

if (requestedSource) {
  if (!sources[requestedSource]) {
    console.error(`Unknown source "${requestedSource}". Known sources: ${Object.keys(sources).join(', ')}`);
    process.exit(1);
  }

  printSource(requestedSource, sources[requestedSource]);
  process.exit(0);
}

for (const [sourceName, source] of Object.entries(sources)) {
  printSource(sourceName, source);
}
