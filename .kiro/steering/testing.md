# Testing Requirements — Silk Spider Solitaire

## Test Coverage Requirements

### Must Have Tests (blocking for release)
- Game engine: all move legality, dealing, run completion, win detection
- Rewards: XP/thread calculation, efficiency ratings, streak multipliers
- Mastery: rank promotion, XP multipliers, progress tracking
- Achievements: all 18 achievement condition checks
- Daily challenge: seed determinism, difficulty rotation, streak calculation
- Statistics: win/loss recording, personal bests, per-difficulty tracking
- Auto-complete: detection accuracy, move sequence validity
- Premium gating: difficulty availability, trial counting, feature checks

### Should Have Tests (important but not blocking)
- Settings persistence: load/save roundtrip
- Share text generation: format correctness
- Journey mode: chapter unlocking, star calculation
- Save format migration: old format → new format

### Manual Testing Checklist (before every release)
- [ ] New install: onboarding shows, first game uses favorable seed
- [ ] 1-suit game: play to completion, verify reward summary
- [ ] 2-suit game: verify accessibility with color-blind mode
- [ ] 4-suit free trial: verify trial counter decrements, blocks at 0
- [ ] Daily challenge: verify same seed produces same deal
- [ ] Undo: verify full undo history works
- [ ] Hints: verify hint highlights a valid move
- [ ] Auto-complete: verify triggers when all face-up + stock empty
- [ ] Purchase flow: verify Full Weaver unlock gates correctly
- [ ] Restore purchases: verify previously purchased items restore
- [ ] Share: verify share text generates correctly
- [ ] Kill app mid-game: verify save/resume works
- [ ] Settings: verify all toggles persist across restart
- [ ] Landscape tablet: verify layout doesn't break
- [ ] Small phone (320dp width): verify cards remain tappable

## Test Infrastructure

- **Runner**: `node --experimental-strip-types --test`
- **Assertion**: `node:assert`
- **Pattern**: Pure function tests — no mocks, no DOM, no async (for core logic)
- **Naming**: `src/game/{module}.test.ts` alongside source
- **Command**: `npm test` runs all test files

## Quality Gates

Before any release:
1. `npx tsc --noEmit` — zero TypeScript errors
2. `npm test` — all tests pass
3. `npx expo-doctor` — no critical issues (warnings OK)
4. Manual play-through of the checklist above

## Device Testing Matrix

| Device | Priority | Notes |
|--------|----------|-------|
| Pixel 7 / modern Android | High | Primary dev device |
| Samsung Galaxy A14 (budget) | High | Performance on low-end |
| Pixel Tablet / Galaxy Tab | Medium | Landscape + large screen |
| Foldable (Fold 5) | Low | Verify layout adapts |

## Performance Budgets

- App launch to playable: < 2 seconds
- Card drag response: < 16ms (60fps)
- Memory usage: < 150MB
- APK size: < 25MB
- No frame drops during animations on budget devices
