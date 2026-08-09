import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addMasteryXP,
  createDefaultMastery,
  getMasteryDisplayName,
  getMasteryIcon,
  getProgressToNextRank,
  getRankForXP,
  MASTERY_LEVELS,
} from './mastery.ts';

import type { DifficultyMastery, PlayerMastery } from './mastery.ts';
import type { Difficulty } from './gameEngine.ts';

test('default mastery starts at apprentice with 0 XP', () => {
  const mastery = createDefaultMastery();
  assert.deepEqual(mastery.byDifficulty, {});

  // After first XP addition, should start at apprentice base
  const updated = addMasteryXP(mastery, 1, 0);
  assert.equal(updated.byDifficulty['1'].rank, 'apprentice');
  assert.equal(updated.byDifficulty['1'].currentXP, 0);
  assert.equal(updated.byDifficulty['1'].rankIndex, 0);
});

test('adding 500 XP to 1-suit promotes to thread_keeper', () => {
  let mastery = createDefaultMastery();
  mastery = addMasteryXP(mastery, 1, 500);

  assert.equal(mastery.byDifficulty['1'].rank, 'thread_keeper');
  assert.equal(mastery.byDifficulty['1'].rankIndex, 1);
  assert.equal(mastery.byDifficulty['1'].currentXP, 500);
});

test('4-suit gets 3x multiplier (100 XP earned = 300 mastery XP)', () => {
  let mastery = createDefaultMastery();
  mastery = addMasteryXP(mastery, 4, 100);

  assert.equal(mastery.byDifficulty['4'].currentXP, 300);
});

test('2-suit gets 1.8x multiplier (100 XP earned = 180 mastery XP)', () => {
  let mastery = createDefaultMastery();
  mastery = addMasteryXP(mastery, 2, 100);

  assert.equal(mastery.byDifficulty['2'].currentXP, 180);
});

test('progress calculation is correct mid-rank', () => {
  // At 250 XP in apprentice rank (next rank at 500)
  const diffMastery: DifficultyMastery = {
    currentXP: 250,
    rank: 'apprentice',
    rankIndex: 0,
  };

  const progress = getProgressToNextRank(diffMastery);
  assert.equal(progress.current, 250); // 250 XP into current rank
  assert.equal(progress.required, 500); // 500 XP needed for next rank
  assert.equal(progress.percentage, 50);
});

test('progress at thread_keeper with partial XP toward pattern_maker', () => {
  // At 1000 XP — thread_keeper starts at 500, pattern_maker at 1500
  const diffMastery: DifficultyMastery = {
    currentXP: 1000,
    rank: 'thread_keeper',
    rankIndex: 1,
  };

  const progress = getProgressToNextRank(diffMastery);
  assert.equal(progress.current, 500); // 1000 - 500 = 500 XP into this rank
  assert.equal(progress.required, 1000); // 1500 - 500 = 1000 needed
  assert.equal(progress.percentage, 50);
});

test('cannot exceed grand_weaver', () => {
  let mastery = createDefaultMastery();
  // Add massive XP to 1-suit
  mastery = addMasteryXP(mastery, 1, 99999);

  assert.equal(mastery.byDifficulty['1'].rank, 'grand_weaver');
  assert.equal(mastery.byDifficulty['1'].rankIndex, 5);
  assert.equal(mastery.byDifficulty['1'].currentXP, 99999);
});

test('grand_weaver progress returns 100%', () => {
  const diffMastery: DifficultyMastery = {
    currentXP: 20000,
    rank: 'grand_weaver',
    rankIndex: 5,
  };

  const progress = getProgressToNextRank(diffMastery);
  assert.equal(progress.percentage, 100);
});

test('different difficulties are independent', () => {
  let mastery = createDefaultMastery();
  mastery = addMasteryXP(mastery, 1, 600);
  mastery = addMasteryXP(mastery, 4, 50);

  // 1-suit: 600 XP (thread_keeper)
  assert.equal(mastery.byDifficulty['1'].rank, 'thread_keeper');
  assert.equal(mastery.byDifficulty['1'].currentXP, 600);

  // 4-suit: 50 * 3 = 150 XP (still apprentice)
  assert.equal(mastery.byDifficulty['4'].rank, 'apprentice');
  assert.equal(mastery.byDifficulty['4'].currentXP, 150);

  // 2-suit should not exist
  assert.equal(mastery.byDifficulty['2'], undefined);
});

test('getRankForXP returns correct ranks at thresholds', () => {
  assert.deepEqual(getRankForXP(0), { rank: 'apprentice', rankIndex: 0 });
  assert.deepEqual(getRankForXP(499), { rank: 'apprentice', rankIndex: 0 });
  assert.deepEqual(getRankForXP(500), { rank: 'thread_keeper', rankIndex: 1 });
  assert.deepEqual(getRankForXP(1500), { rank: 'pattern_maker', rankIndex: 2 });
  assert.deepEqual(getRankForXP(4000), { rank: 'web_weaver', rankIndex: 3 });
  assert.deepEqual(getRankForXP(8000), { rank: 'silk_master', rankIndex: 4 });
  assert.deepEqual(getRankForXP(15000), { rank: 'grand_weaver', rankIndex: 5 });
  assert.deepEqual(getRankForXP(99999), { rank: 'grand_weaver', rankIndex: 5 });
});

test('MASTERY_LEVELS has 6 entries with correct order', () => {
  assert.equal(MASTERY_LEVELS.length, 6);
  assert.equal(MASTERY_LEVELS[0].rank, 'apprentice');
  assert.equal(MASTERY_LEVELS[5].rank, 'grand_weaver');

  // Verify thresholds are ascending
  for (let i = 1; i < MASTERY_LEVELS.length; i++) {
    assert.ok(MASTERY_LEVELS[i].xpRequired > MASTERY_LEVELS[i - 1].xpRequired);
  }
});

test('getMasteryDisplayName returns correct names', () => {
  assert.equal(getMasteryDisplayName('apprentice'), 'Apprentice');
  assert.equal(getMasteryDisplayName('thread_keeper'), 'Thread Keeper');
  assert.equal(getMasteryDisplayName('grand_weaver'), 'Grand Weaver');
});

test('getMasteryIcon returns correct icons', () => {
  assert.equal(getMasteryIcon('apprentice'), '🕸️');
  assert.equal(getMasteryIcon('silk_master'), '✨');
  assert.equal(getMasteryIcon('grand_weaver'), '👑');
});

test('cumulative XP additions promote through multiple ranks', () => {
  let mastery = createDefaultMastery();
  mastery = addMasteryXP(mastery, 1, 200);
  assert.equal(mastery.byDifficulty['1'].rank, 'apprentice');

  mastery = addMasteryXP(mastery, 1, 300);
  assert.equal(mastery.byDifficulty['1'].rank, 'thread_keeper');

  mastery = addMasteryXP(mastery, 1, 1000);
  assert.equal(mastery.byDifficulty['1'].rank, 'pattern_maker');
  assert.equal(mastery.byDifficulty['1'].currentXP, 1500);
});

test('large single XP addition can skip ranks', () => {
  let mastery = createDefaultMastery();
  mastery = addMasteryXP(mastery, 1, 8000);

  assert.equal(mastery.byDifficulty['1'].rank, 'silk_master');
  assert.equal(mastery.byDifficulty['1'].rankIndex, 4);
});
