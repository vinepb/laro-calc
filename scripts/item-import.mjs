#!/usr/bin/env node

import { applyDraft, prepareDraft } from './item-import/workflow.mjs';
import { validateDraft } from './item-import/validation.mjs';

const usage = `Usage:
  npm run item:prepare -- --item <item-id-or-name> [--server <server>]
  npm run item:apply -- --draft .codex/item-import/<item-id> [--allow-missing-icon]
  npm run item:validate -- --draft .codex/item-import/<item-id>
`;

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[index + 1];

    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
      continue;
    }

    args[key] = true;
  }

  return args;
}

function printError(error) {
  console.error(error instanceof Error ? error.message : String(error));
}

async function main() {
  const [, , command, ...rest] = process.argv;
  const args = parseArgs(rest);

  if (!command || command === '--help' || command === '-h') {
    console.log(usage);
    return;
  }

  switch (command) {
    case 'prepare': {
      if (!args.item) {
        throw new Error(`Missing --item.\n\n${usage}`);
      }

      const result = await prepareDraft({
        itemInput: String(args.item),
        serverOverride: args.server ? String(args.server) : undefined,
      });

      console.log(`Draft prepared at ${result.draftDir}`);
      console.log(`Resolved Divine Pride item ID: ${result.resolvedId}`);
      console.log(`Review file: ${result.reviewPath}`);
      if (result.blockingWarnings.length > 0) {
        console.log('Blocking warnings:');
        for (const warning of result.blockingWarnings) {
          console.log(`- ${warning}`);
        }
      }
      return;
    }
    case 'apply': {
      if (!args.draft) {
        throw new Error(`Missing --draft.\n\n${usage}`);
      }

      const result = await applyDraft({
        draftDir: String(args.draft),
        allowMissingIcon: Boolean(args['allow-missing-icon']),
      });

      console.log('Applied item draft successfully.');
      for (const changedFile of result.changedFiles) {
        console.log(`- ${changedFile}`);
      }
      return;
    }
    case 'validate': {
      if (!args.draft) {
        throw new Error(`Missing --draft.\n\n${usage}`);
      }

      const report = await validateDraft(String(args.draft));
      if (report.errors.length > 0) {
        console.error('Validation failed:');
        for (const error of report.errors) {
          console.error(`- ${error}`);
        }
        if (report.warnings.length > 0) {
          console.error('Warnings:');
          for (const warning of report.warnings) {
            console.error(`- ${warning}`);
          }
        }
        process.exitCode = 1;
        return;
      }

      console.log('Validation passed.');
      for (const warning of report.warnings) {
        console.log(`- ${warning}`);
      }
      return;
    }
    default:
      throw new Error(`Unknown command "${command}".\n\n${usage}`);
  }
}

main().catch((error) => {
  printError(error);
  process.exitCode = 1;
});
