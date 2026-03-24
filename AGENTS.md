# AGENTS.md

GitHub Pages deployment is handled from the same repo by GitHub Actions.

## Add Item Workflow
When the user asks to add a new item to the calculator:

1. Run the local draft workflow in `/Users/vinepb/Developer/turugrura/laro-calc` instead of editing `item.json` directly.
2. Start with:
   - `npm run item:prepare -- --item <item_id>`
   - or `npm run item:prepare -- --item "<item name>"`
   - optional overrides: `--server <server>` and `--language <language>`
   - local defaults should stay `LATAM` and English unless there is a reason to override them
3. If the user provides a name instead of an ID:
   - check for local duplicate names first
   - use Divine Pride search to resolve the name to one item ID
   - if multiple plausible IDs remain, stop and ask the user to choose the exact item
4. Use the Divine Pride API as the authoritative item source.
   API requests must set both `server` and `Accept-Language`.
   Use Divine Pride page scraping only to resolve an item ID when the user provides a name instead of a numeric ID.
5. Keep the Divine Pride API key only in the gitignored file `/Users/vinepb/Developer/turugrura/laro-calc/.divine-pride.local.json`.
6. Do not edit `/Users/vinepb/Developer/turugrura/laro-calc/src/assets/demo/data/item.json` before a successful draft exists in `.codex/item-import/<item_id>/`.
7. During review, edit only:
   - `.codex/item-import/<item_id>/candidate.item.json`
   - `.codex/item-import/<item_id>/review.md`
   In `review.md`, leave `applyBlocked` as `true` until the draft is ready, then set:
   - `scriptStatus` to `reviewed` when the script is ready
   - or `scriptStatus` to `scriptless-approved` when the item intentionally has no script
   - and `applyBlocked` to `false`
8. Propose the calculator `script` only from:
   - the Divine Pride API description
   - the fetched API metadata
   - comparable local items already in `item.json`
9. If any effect cannot be mapped confidently, keep the draft blocked for review and say so explicitly.
10. Run `npm run item:apply -- --draft .codex/item-import/<item_id>` only after explicit user approval.
    `item:apply` will not overwrite an existing item ID.
11. After apply, run `npm run item:validate -- --draft .codex/item-import/<item_id>` and report exactly which repo files changed.

## Fork Review Workflow
When reviewing and importing updates from other forks:

1. Treat `/Users/vinepb/Developer/turugrura/laro-calc/.fork-tracking.yml` as the shared source of truth for fork remotes, compare bases, current tips, and review checkpoints.
2. Keep the configured remotes aligned with the tracker file.
   Current expected source remotes are `upstream`, `lzcouto`, and `attackjom`.
3. Start each review pass with `git fetch --all --prune`.
4. Use `node scripts/fork-review.mjs [source]` to print the current review checkpoint and the exact `git log` command implied by `.fork-tracking.yml`.
5. For large or selective fork imports, keep a per-fork review ledger under `.fork-reviews/`.
   Use a file named `.fork-reviews/<source>-<branch>.md`, such as `.fork-reviews/attackjom-main.md`.
   Record commit-level status there: imported, skipped, deferred, next, or pending, plus local cherry-pick hashes and short notes.
6. Review fork-only commits from the saved checkpoint in `.fork-tracking.yml`.
   - If `last_reviewed` is set, use `git log --oneline --reverse <last_reviewed>..<remote>/<branch> --not upstream/main`.
   - If `last_reviewed` is `null`, start from `git log --oneline --reverse upstream/main..<remote>/<branch>`.
7. When importing a useful change, use `git cherry-pick -x <sha>` so the original commit hash is preserved in the new commit message.
8. Keep the local workspace clean while doing fork review work.
   Commit meaningful import batches promptly instead of leaving long-lived uncommitted changes around.
   Prefer keeping the review branch in a commit-ready state before moving on to the next batch.
9. For fork-review and selective-import branches, rely on the GitHub CI build as the main verification step.
   Prefer pushing the dev branch and watching the branch CI run instead of running local page builds.
   Only use local verification when the user explicitly asks for it or when CI cannot answer the question.
10. After each review pass, update `.fork-tracking.yml` even if nothing was imported.
   - refresh `current_tip`
   - advance `last_reviewed` to the newest commit that was reviewed
   - update `review_status` and `notes` so the next pass can start from the correct place
11. Keep the per-fork ledger in `.fork-reviews/` up to date as commit decisions are made.
   `.fork-tracking.yml` is the source-level checkpoint; the ledger is the commit-level decision log.
12. Push the active dev branch whenever a review/import batch is ready for validation, and watch the GitHub CI run to completion before continuing with risky follow-up work.
13. If a new fork remote is added, add it to `.fork-tracking.yml` in the same change.
14. Do not leave `.fork-tracking.yml` stale after reviewing or importing from another fork. The file is what tells future work where review should resume.
