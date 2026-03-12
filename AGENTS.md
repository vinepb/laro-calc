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
