# attackjom/main review ledger

Base: `upstream/main` at `ba4312fc`
Tip: `attackjom/main` at `c91c4320`
Review branch: `codex/import-attackjom-review`
Tracker: [`.fork-tracking.yml`](/Users/vinepb/Developer/turugrura/laro-calc/.fork-tracking.yml)
Last updated: `2026-03-24`

This ledger tracks source commits from `upstream/main..attackjom/main`.
It is source-commit centric: imported source commits record the local commit that carried the change into this repo.

Status legend:
- `[imported]` selectively imported into this repo
- `[next]` good next candidate for selective import
- `[pending]` not reviewed deeply yet
- `[deferred]` reviewed at a high level, but mixed/risky scope; revisit later
- `[likely-skip]` low-signal or non-portable commit; skip unless later evidence says otherwise

## Chronological source delta

- [deferred] `352aafb4` `2025-08-25` Update item
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `bf766914` `2025-08-26` Update item
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `483619c7` `2025-08-26` Create deploy.bat
- [deferred] `b8a91430` `2025-08-26` Update EM
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `8d415865` `2025-08-26` Create test.bat
- [deferred] `2b084900` `2025-08-26` Update Troubadour - Trouvere
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `2a638719` `2025-08-27` 123
- [deferred] `3d6c2ab8` `2025-08-27` Fix buff
  notes: formula-only scope; review later with calculator validation
- [deferred] `ec61e268` `2025-08-27` Update ArchMage.ts
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `4b678546` `2025-08-27` Update app.topbar.component.html
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `87c6ec02` `2025-08-28` Eternal Cross + Savage shadow
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `d770541a` `2025-08-28` Update skill-name.ts
  notes: formula-only scope; review later with calculator validation
- [deferred] `09af0224` `2025-08-28` Update skill name Cross Slash SHC
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `468d4deb` `2025-08-28` Update item.json
  local: `d08468d4`
  notes: selectively imported item IDs `24910`-`24921`; matching icons restored from `attackjom/main`
- [imported] `2efa9a8b` `2025-08-28` update Enroached Geffenia monster
  local: `4b59872d`
  notes: selectively imported monster IDs `22476`-`22489` and the `ch1_gfn03` spawn mapper entry
- [imported] `aaf15f69` `2025-08-28` Update monster.json
  local: `af8f9332`
  notes: selectively imported the first stat refresh for monster IDs `22476`-`22489`
- [imported] `fc193efd` `2025-08-29` Update Item
  local: `3b126812`
  notes: selectively imported item IDs `24926`, `24927`, `24928`, `24929`, `24936`, `24937`, `24938`, `24939`; also updated item `24920`; matching icons restored from `attackjom/main`
- [imported] `0abd628e` `2025-08-30` Update item.json
  local: `f82b0703`
  notes: selectively imported item ID `24987`; matching icon restored from `attackjom/main`
- [likely-skip] `cdd7a3d0` `2025-08-30` Update item.json
  notes: parsed `item.json` content matched its parent; appears to be a no-op for this repo
- [deferred] `0d54e66a` `2025-08-30` Update
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `f64c6c0d` `2025-09-01` Update GGT Troubadour/Trouvere
  notes: formula-only scope; review later with calculator validation
- [deferred] `e84925cb` `2025-09-04` Update white knight LT
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `14c3d650` `2025-09-04` Update
  notes: formula-only scope; review later with calculator validation
- [imported] `c7caace9` `2025-09-04` Update item.json
  local: `ff77980c`
  notes: selectively imported the update to item `480640`; local icon already matched the source image
- [deferred] `b18e84d6` `2025-09-06` Update master shadow enchant
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `fea3b7f5` `2025-09-06` Update Shadow KRO
  local: `aec354df`
  notes: selectively imported the item-data and image change
- [imported] `ca61d523` `2025-09-06` Update shadow
  local: `2871c9f6`
  notes: selectively imported the item-data change
- [imported] `92341448` `2025-09-06` Update Shadow
  local: `70b734fd`
  notes: selectively imported the item-data and image change
- [imported] `f825e5d2` `2025-09-06` Update Shadow
  local: `ac0b1499`
  notes: selectively imported the item-data and image change
- [deferred] `b33435a0` `2025-09-06` Update GGT Skill button
  notes: formula-only scope; review later with calculator validation
- [deferred] `723a0668` `2025-09-06` Update buff + monster
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `772d6301` `2025-09-07` Update ImperialGuard.ts
  notes: formula-only scope; review later with calculator validation
- [imported] `deacaa7c` `2025-09-08` Update monster.json
  local: `3d881270`
  notes: selectively imported the `res` and `mres` update for monster IDs `22476`-`22489`
- [deferred] `3c3e0375` `2025-09-08` Update Cardinal.ts
  notes: formula-only scope; review later with calculator validation
- [deferred] `0b23cf0a` `2025-09-08` Update ImperialGuard.ts
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `8b6f71ee` `2025-09-08` 123
- [deferred] `259dee4f` `2025-09-09` Update four charm
  notes: formula-only scope; review later with calculator validation
- [deferred] `395ab73b` `2025-09-09` Finalize Shinkiro-Shiranui C4 skill
  notes: mixed scope; review later
- [likely-skip] `c0695301` `2025-09-10` Update bp ggt data
  notes: attempted selective cherry-pick, but all affected item IDs and images were already present on this branch from later imports
- [deferred] `c5f04ad1` `2025-09-10` Shadow slot 2
  notes: mixed scope; review later
- [deferred] `103962b6` `2025-09-10` Update GGT Battle pass shadow
  notes: mixed scope; review later
- [deferred] `a4d6a99d` `2025-09-10` Update damage-calculator.ts
  notes: mixed scope; review later
- [deferred] `a888d533` `2025-09-11` Update enchant stone
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `f572ad63` `2025-09-12` Update Enchant stone to box 40
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `2836e00a` `2025-09-12` Oratio
  notes: mixed scope; review later
- [deferred] `00c269b2` `2025-09-12` Update
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `b2651a0c` `2025-09-12` Merge branch 'main' of https://github.com/attackjom/tong-calc-ro
- [likely-skip] `236ba7f0` `2025-09-12` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `c52916b7` `2025-09-12` Update exotic armor LT enchant
  notes: mixed scope; review later
- [likely-skip] `877249b5` `2025-09-12` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [likely-skip] `5fabec06` `2025-09-12` Revert ขวาบน
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `a3effec6` `2025-09-12` Update environment.prod.ts
  notes: mixed scope; review later
- [likely-skip] `1abbcb12` `2025-09-12` Remove 'Request/Issue Tracking' button
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `26eb4fc4` `2025-09-12` Fix indentation in Cardinal.ts skill calculations
  notes: formula-only scope; review later with calculator validation
- [deferred] `18a87ada` `2025-09-12` Add Rose Blossom skill to Troubadour and Trouvere
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `35031e3c` `2025-09-12` Update update log
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [imported] `d1e47182` `2025-09-13` Add Costume Starrysky Fountainpen BP lv1000
  local: `010da56b`
  notes: selectively imported the item-data and image change
- [deferred] `b87e1e74` `2025-09-13` Update environment.prod.ts
  notes: mixed scope; review later
- [deferred] `0ab9d7cd` `2025-09-13` Add Costume Autumn Piece  + Hide expired costume
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `e90de0c2` `2025-09-13` Add Razer energy Coffee drink
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `28cf9ff4` `2025-09-13` Add Temporal Ring-LT + Enchant
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `37b24aab` `2025-09-13` Update README.md
- [deferred] `52bc9965` `2025-09-14` Add Soul ascetic Buff
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `4dda3b7f` `2025-09-14` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `5792b619` `2025-09-15` Update Skill KRO Version
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `d1bad8ed` `2025-09-15` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `83d6401f` `2025-09-16` KRO : Add Blazing Flame Blast skill
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `97587d01` `2025-09-16` Merge branch 'main' of https://github.com/attackjom/tong-calc-ro
- [likely-skip] `4cb646de` `2025-09-16` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [imported] `26578e16` `2025-09-17` Add Rising Circlet KRO
  local: `ff6268fe`
  notes: selectively imported item IDs `400715` and `9400715` plus their images; the monster row from this source commit was already present on this branch
- [imported] `4b07efe4` `2025-09-17` Add Astraea-LT Set
  local: `b44cc779`
  notes: selectively imported the item-data change
- [likely-skip] `490d8f48` `2025-09-17` Add GGT Item
  notes: reviewed after later imports; its item, image, and `Mob_Scarf_LT` enchant-table payload were already present on this branch
- [imported] `68b03ec4` `2025-09-17` Update item.json
  local: `705a3531`
  notes: selectively imported the item-data change
- [imported] `f12d4e78` `2025-09-17` Update GGT Item 17 sep 2025
  local: `050efb24`
  notes: selectively imported item `450385` and item IDs `1270148`-`1270159` plus matching images; left the topbar changelog out
- [deferred] `e8e22624` `2025-09-17` Add New Bonus: Hit Physical Damage
  notes: mixed scope; review later
- [deferred] `1ac34f2f` `2025-09-17` Add Pyroclastic to lv275, Homun Tempering
  notes: formula-only scope; review later with calculator validation
- [deferred] `0f5da0e6` `2025-09-17` Add Hit Physical enchant of Crown Dimension Helm
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `cd23257e` `2025-09-18` KRO: Add Ch1 Armor
  local: `8885eeee`
  notes: selectively imported item IDs `450440`, `450441`, `470333`-`470339`, `480545`, and `480546` plus their images; left parser artifacts out
- [likely-skip] `a8b7b444` `2025-09-18` Update item_parser.py
- [imported] `f9bafd7d` `2025-09-18` Add Chapter1 Enchanct part 1
  local: `e6306df3`
  notes: selectively imported the item-data change
- [imported] `3e6b7b56` `2025-09-18` Add Chapter1 Enchant part 2
  local: `b5898ed2`
  notes: selectively imported `src/app/constants/enchant_item/chapter1.ts` and the `_enchant_table.ts` import wiring needed by the Chapter 1 armor enchant entries; the source commit's item and image payloads were still left out
- [likely-skip] `58b6f6c8` `2025-09-18` 123
- [imported] `2b944406` `2025-09-18` Add Chapter 1 Enchant Part 3
  local: `050efb24`
  notes: selectively imported item IDs `313939`-`313948`, `420220`, and `420269` plus matching images; left the HTML change out
- [likely-skip] `87d26581` `2025-09-18` Add GGT Varmundt Circlet
  notes: reviewed after later imports; its item and image payload were already present on this branch, leaving only a topbar changelog change
- [deferred] `b08dfae8` `2025-09-18` Add Jack Frost Nova , Crystal Impact
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `fa2e323e` `2025-09-18` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [imported] `085405cb` `2025-09-19` Update Monster (Biosphere, Deep F1, Deep Abyss, Oz dungeon)
  local: `091a097a`
  notes: selectively imported the missing monster IDs `21920`-`21943`, `22140`-`22155`, and `22252`-`22259`, `22261`; also imported the Chapter 1 armor enchant-table entries and left the parser-file churn out
- [likely-skip] `f8e44d25` `2025-09-19` Fix duplicate Abyss Salamander
  notes: evaluated during cherry-pick; resolved to an empty change on this branch, so it was skipped
- [likely-skip] `f99803b2` `2025-09-19` update topbar
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [imported] `27b987ab` `2025-09-19` Update monster-spawn-mapper.ts
  local: `2e0feb9f`
  notes: imported the spawn-mapper update without additional app changes
- [imported] `3335cf7e` `2025-09-19` Update monster-spawn-mapper.ts
  local: `a200bc00`
  notes: imported the spawn-mapper update without additional app changes
- [imported] `b3bc7093` `2025-09-19` Fix White Knight Manteau - LT ACD%
  local: `a10bd653`
  notes: selectively imported the item-data change
- [deferred] `b8b53c1e` `2025-09-19` Fix Jupitel Thunderstorm
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `83257090` `2025-09-19` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `6a41eb87` `2025-09-19` Add Breaking Limit / Rule Break
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `f36c4824` `2025-09-20` Fix Triple Laser ACD, VCT, Cooldown
  notes: mixed scope; review later
- [deferred] `7c2dc02e` `2025-09-21` KRO: Add Frontier & Dimension 2nd Weapon+Helm part1
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `37efad09` `2025-09-22` KRO: Add Frontier Weapon , Crown , 2nd Dimension Weapon
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `a38e3868` `2025-09-22` Fix Elemental Spirit Book
  local: `70f4ea51`
  notes: selectively imported the item-data change
- [imported] `fc080467` `2025-09-23` Add clock tower basement monster (GGT)
  local: `a797b62e`
  notes: selectively imported the monster data and spawn-mapper update; left the topbar changelog out
- [deferred] `1a72ec45` `2025-09-23` Add Feedback/Request Button
  notes: mixed scope; review later
- [deferred] `7eb01d85` `2025-09-24` Fix Soul Asceitc Blessing of Fourdirection condition
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `31b127d0` `2025-09-24` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [likely-skip] `5d5f7139` `2025-09-26` Update Monster parser
- [likely-skip] `ac6af331` `2025-09-26` Update monster_parser.py
- [imported] `8c6f4318` `2025-09-26` Fix Nebula Shadow enchant (Size -> element)
  local: `81831fc2`
  notes: selectively imported the item-data change
- [imported] `1a559e1d` `2025-09-27` Update Zero cell monster
  local: `41700d1f`
  notes: selectively imported the monster data and spawn-mapper update; left the topbar changelog out
- [imported] `03d47c39` `2025-09-27` Fix Zero Cell monster to boss
  local: `91431cd6`
  notes: selectively imported the monster-data change
- [deferred] `0bcc8e3c` `2025-09-29` Add Radiant Spear / Dust Explosion / Mystery Powder skill
  notes: formula-only scope; review later with calculator validation
- [likely-skip] `941a0410` `2025-09-29` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `0fa8fb29` `2025-09-29` Fix Radiant Spear
  notes: formula-only scope; review later with calculator validation
- [imported] `297b0776` `2025-09-29` Update item.json
  local: `c662b925`
  notes: selectively imported the item-data change
- [deferred] `8488c509` `2025-09-29` Add Issue Tracking
  notes: mixed scope; review later
- [imported] `56149d36` `2025-09-29` Update item.json
  local: `baf8bcfb`
  notes: selectively imported the item-data change
- [deferred] `7f7ce6aa` `2025-10-01` Update GGT Item
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `397ec121` `2025-10-01` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `c0808eba` `2025-10-01` Fix Rhythm shooting & Mystic Symphony skill
  notes: mixed scope; review later
- [imported] `d65793c5` `2025-10-01` KRO: Add KRO Bamtoli mask
  local: `8c9b3dd3`
  notes: selectively imported the item-data and image change
- [deferred] `c4a956c1` `2025-10-02` Fix Wireless drone LT
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `a2e622a8` `2025-10-03` Increase max job to 60 (KRO)
  notes: mixed scope; review later
- [imported] `f260337d` `2025-10-07` Fix Nebula pendant allstatus
  local: `f9030744`
  notes: selectively imported the item-data change
- [imported] `768045dc` `2025-10-08` Update One One p.1
  local: `abd2d955`
  notes: selectively imported the item-data and image change
- [likely-skip] `6098df46` `2025-10-09` 1
- [deferred] `4bf7f54a` `2025-10-10` Finalize One One Fried Chicken
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `e5d27c04` `2025-10-10` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `e0667683` `2025-10-14` Add Damagetaken System part 1
  notes: mixed monster/app scope; review later after the data-only imports
- [deferred] `f678157b` `2025-10-14` Add DamageTaken System part2 + Betelgeuse Status setting
  notes: mixed monster/app scope; review later after the data-only imports
- [likely-skip] `ac64f977` `2025-10-14` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `6aba9c80` `2025-10-14` Add Windhawk Trap skill
  notes: mixed scope; review later
- [deferred] `9cbfb985` `2025-10-15` Add new GGT item
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `cf0ecaef` `2025-10-15` Fix Ghost Bandana
  local: `5b757ace`
  notes: selectively imported the item-data and image change
- [deferred] `89004bef` `2025-10-17` fix guardian shieldLT
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `3bf55bba` `2025-10-20` Fix metallic fury cooldown (G&E)
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `23f3fe5e` `2025-10-20` ep19 item & Herosria item translate
  notes: evaluated during the item-only pass; resolved to an empty change after prior imports
- [deferred] `e8d3a687` `2025-10-22` Add Sage & Sorcerer Debuff
  notes: mixed scope; review later
- [imported] `1d7a4da7` `2025-10-23` Add KRO Item
  local: `1036352e`
  notes: selectively imported the item-data and image change
- [imported] `dd134124` `2025-10-23` Fix  ".,"
  local: `98248d69`
  notes: selectively imported the item-data change
- [deferred] `d49e4127` `2025-10-23` Add Learning Skill for Enchant stone 41
  notes: formula-only scope; review later with calculator validation
- [deferred] `097f735d` `2025-10-23` Add Soul Collect Learning Skill
  notes: formula-only scope; review later with calculator validation
- [imported] `3f39bc08` `2025-10-23` Fix Soul Reaper stone lower II
  local: `657034ef`
  notes: selectively imported the item-data change
- [likely-skip] `7cab5135` `2025-10-23` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `9864aabe` `2025-10-26` Fix Vit enchant in nebula shadow
  notes: mixed scope; review later
- [imported] `fb48c435` `2025-10-29` Add simulation juncea
  local: `554179a1`
  notes: imported the monster-data and spawn-mapper change
- [deferred] `a2fad9f5` `2025-10-30` Update ASPD + ep19 Boss
  notes: mixed monster/app scope; review later after the data-only imports
- [deferred] `4f507c9f` `2025-10-30` Add compare shield function
  notes: mixed scope; review later
- [deferred] `1ae687dc` `2025-11-05` Add new GGT item 05-11-68
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `ddf4b53f` `2025-11-05` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `017c586e` `2025-11-07` Update Skill All version until KRO
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `ee86de32` `2025-11-07` Update Rework Monster / ep19 monster
  notes: mixed monster/app scope; review later after the data-only imports
- [likely-skip] `81e5464c` `2025-11-07` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `1ff22cdf` `2025-11-09` Fix Gale Storm Cri.dmg /2
  notes: mixed scope; review later
- [deferred] `09b218e8` `2025-11-13` Update item
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `9b277220` `2025-11-13` Fix perfect hit
  notes: mixed scope; review later
- [likely-skip] `45eb4a53` `2025-11-13` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `ef297138` `2025-11-17` Update Venom impress + Add item
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `bb8aaad3` `2025-11-19` Update GGT item
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `6f0c4928` `2025-11-20` Fix ring of good/evil location
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `b6aee24c` `2025-11-25` Update item.json
  local: `66a15de9`
  notes: selectively imported the item-data change
- [likely-skip] `a6985218` `2025-11-25` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [likely-skip] `5e0a3e22` `2025-11-25` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [deferred] `bd28c13f` `2025-11-29` Update GGT Item 26/11/68 , Fix Potent venom formula
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `73b9cd13` `2025-11-29` Add Blue Unicorn pet
  local: `16f0c95f`
  notes: selectively imported the item-data and image change
- [deferred] `e0166ce1` `2025-12-03` Update GGT 03/12/68 , Add Comet5 IB5 to all job
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `45c4dac9` `2025-12-03` Update item.json
  local: `fec45f92`
  notes: selectively imported the item-data change
- [imported] `300d726f` `2025-12-03` Update item.json
  local: `b09053b5`
  notes: selectively imported the item-data change
- [imported] `1dffc2be` `2025-12-03` Update item.json
  local: `8d12749d`
  notes: selectively imported the item-data change
- [deferred] `6f492386` `2025-12-03` fix bug
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `b693a01e` `2025-12-06` Update item.json
  local: `93e2135d`
  notes: selectively imported the item-data change
- [deferred] `3f7de34d` `2025-12-10` Fix Comet & Venom Impression Debuff
  notes: mixed scope; review later
- [deferred] `0f90bcce` `2025-12-10` Update Costume Upper Enchant 2
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `92fc8bf9` `2025-12-14` Update All Bloom Debuff
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `55c1af9e` `2025-12-18` Update GGT Item
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `32603d00` `2025-12-24` Update GGT 24 DEC 2025
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `31d5e838` `2025-12-24` Update item.json
  local: `fbcac02d`
  notes: selectively imported the item-data change
- [imported] `c3cb919d` `2025-12-25` Update item.json
  local: `ef20c30b`
  notes: selectively imported the item-data change
- [deferred] `146949f7` `2025-12-26` Destructive Hurricane Add
  notes: formula-only scope; review later with calculator validation
- [deferred] `6b873b12` `2025-12-30` Add destructive hurricane
  notes: mixed item/app scope; review later after the data-only imports
- [likely-skip] `85de597d` `2025-12-30` 1
- [deferred] `997f2d01` `2026-01-03` Fix Ring of Good EM
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `98bf7428` `2026-01-07` Update GGT Item 7 JAN 2026
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `45ff6ca7` `2026-01-07` fix bug
  local: `f45ab68a`
  notes: selectively imported the item-data change
- [deferred] `2df4d43d` `2026-01-21` Update GGT 21 Jan 2026
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `29bfe224` `2026-02-01` Mega Update
  notes: very mixed scope across enchants, job formulas, UI, and item data
- [deferred] `e97f4ed8` `2026-02-01` Add Enchanting Sky Buff
  notes: mixed scope; review later
- [deferred] `252a9701` `2026-02-07` feat(item.json): Add Aquarius Heart Scroll Item
  notes: mixed item, images, jobs, mapper, enchant table, and topbar
- [imported] `4b51ed46` `2026-02-07` fix(item.json): Fix minor info for issgard supreme
  local: `ef25fd05`
  notes: selectively imported item ID `401237`; matching icon restored from `attackjom/main`
- [deferred] `af344a58` `2026-02-07` Fix power Cardinal
  notes: formula-only scope; review later with calculator validation
- [deferred] `d84294c9` `2026-02-08` Fix Exotic Boots-LT
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `af515f31` `2026-02-08` Update fix item script
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `20de912a` `2026-02-10` Add COP 4F Initial Version
  notes: mixed monster data, spawn mapper, and topbar changes
- [imported] `209f25b6` `2026-02-11` Update monster.json
  local: `6e2184b9`
  notes: selectively imported the Corridor 4 phantom-boss update for monster IDs `21815`-`21834`
- [imported] `5f7c1273` `2026-02-11` Exclude Corridor Betelgeuse from Is_Betelgeuse function
  local: `d0f29de4`
  notes: selectively imported the monster-data change
- [deferred] `a3418aed` `2026-02-14` Fix Master Shadow enchant / Lord Knight Card
  notes: mixed item/app scope; review later after the data-only imports
- [imported] `ecee78be` `2026-02-19` feat(item): Add new COP card
  local: `b81b715d`
  notes: selectively imported item IDs `300754`-`300759` with matching icons
- [likely-skip] `7bfff176` `2026-02-19` Merge pull request #1 from attackjom/GGT_19_2_2026
- [likely-skip] `0a888768` `2026-02-19` Update app.topbar.component.ts
  notes: topbar-only change; low value for this branch relative to our local UI divergence
- [likely-skip] `61593fba` `2026-02-19` Merge pull request #2 from attackjom/GGT_19_2_2026
- [deferred] `9bf2e6f9` `2026-02-23` Fix Upgrde Troubadour
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `c4ea5bc2` `2026-03-04` feat(Add AM Set dim glacial)
  notes: likely mixed item/formula scope; inspect after item-only batch
- [imported] `f7d3dc76` `2026-03-04` Add new item image
  local: `e327c6ec`
  notes: imported the item image update
- [imported] `bb5acd60` `2026-03-04` Update item.json
  local: `20e7bdae`
  notes: selectively imported item IDs `300784`, `490942`, `490943`, `490944`; matching icons added for `300784`, `490942`, and `490944`
- [likely-skip] `f290f6ba` `2026-03-04` 123
- [deferred] `a384d443` `2026-03-04` Update GGT
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `846aea96` `2026-03-04` Update ro-calculator.component.ts
  notes: mixed scope; review later
- [deferred] `eeb2a3e6` `2026-03-06` Fix Bug
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `615391ff` `2026-03-06` Update Skill GGT Verson
  notes: formula-only scope; review later with calculator validation
- [imported] `d573becf` `2026-03-09` Update KRO item
  local: `7d7ad76d`
  notes: selectively imported item IDs `9109`, `300733`, and `550195` with matching icons
- [deferred] `48b40b1f` `2026-03-12` Update
  notes: mixed item/app scope; review later after the data-only imports
- [deferred] `c6df90c5` `2026-03-13` Ring of Frozen Promise
  notes: mixed enchant-table support and topbar changelog; review after the next data-only batch
- [likely-skip] `d4684a67` `2026-03-21` Fix 7 Hit / Sec
  notes: evaluated during the template-only pass; resolved to an empty change because the relevant UI state is already absent or already covered on this branch
- [deferred] `c91c4320` `2026-03-21` Update Enchant Exotic Temporal Armor
  notes: mixed enchant, skill-name, job formula, topbar, and item data scope
