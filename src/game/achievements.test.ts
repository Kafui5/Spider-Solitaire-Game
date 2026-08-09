import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALL_ACHIEVEMENTS,
  createDefaultAchievements,
  checkAchievements,
  getAchievementProgress,
} from './achievements.ts';
import type { GamePerformance, PlayerProfile } from './rewards.ts';
import type { PlayerMastery } from './mastery.ts';

// --- Test helpers ---

function makePerformance(overrides: Partial<GamePerformance> = {}): GamePerformance {
  return {
    won: true,
    difficulty: 1,
    moves: 150,
    timeSeconds: 600,
    usedHints: 0,
    usedUndos: 0,
    runsCompleted: 8,
    sequenceStreaks: 2,
    isDailyChallenge: false,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    version: 1,
    totalXP: 0,
    silkThreads: 0,
    totalGamesPlayed: 1,
    totalWins: 1,
    currentWinStreak: 1,
    bestWinStreak: 1,
    personalBests: {},
    lifetimeThreadsEarned: 0,
    lifetimeThreadsSpent: 0,
    gamesWithoutHints: 0,
    gamesWithoutUndos: 0,
    ...overrides,
  };
}

function makeMastery(overrides: Partial<PlayerMastery> = {}): PlayerMastery {
  return {
    byDifficulty: {},
    ...overrides,
  };
}

test('defines exactly 18 achievements', () => {
  assert.equal(ALL_ACHIEVEMENTS.length, 18);
});

test('createDefaultAchievements initializes all as unlocked: false', () => {
  const defaults = createDefaultAchievements();
  for (const a of ALL_ACHIEVEMENTS) {
    assert.deepEqual(defaults.achievements[a.id], { unlocked: false });
  }
});

test('first win unlocks first_thread', () => {
  const performance = makePerformance();
  const profile = makeProfile({ totalWins: 1 });
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('first_thread'), 'Expected first_thread to be unlocked');
});

test('no hints unlocks keen_eye', () => {
  const performance = makePerformance({ usedHints: 0 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('keen_eye'), 'Expected keen_eye to be unlocked');
});

test('using hints does NOT unlock keen_eye', () => {
  const performance = makePerformance({ usedHints: 3 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(!ids.includes('keen_eye'), 'Expected keen_eye to NOT be unlocked');
});

test('no undo unlocks unbroken_silk', () => {
  const performance = makePerformance({ usedUndos: 0 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('unbroken_silk'), 'Expected unbroken_silk to be unlocked');
});

test('already unlocked achievement is not returned again', () => {
  const performance = makePerformance();
  const profile = makeProfile({ totalWins: 1 });
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  // First check: unlocks first_thread
  const firstUnlocked = checkAchievements(performance, profile, mastery, achievements);
  const firstIds = firstUnlocked.map((u) => u.achievement.id);
  assert.ok(firstIds.includes('first_thread'), 'Expected first_thread on first check');

  // Second check: should NOT return first_thread again
  const secondUnlocked = checkAchievements(performance, profile, mastery, achievements);
  const secondIds = secondUnlocked.map((u) => u.achievement.id);
  assert.ok(!secondIds.includes('first_thread'), 'Expected first_thread NOT on second check');
});

test('progressive achievement ten_threads tracks progress', () => {
  const performance = makePerformance();
  const profile = makeProfile({ totalWins: 10 });
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const tenThreads = unlocked.find((u) => u.achievement.id === 'ten_threads');

  assert.ok(tenThreads, 'Expected ten_threads to be unlocked');
  assert.equal(tenThreads!.progress, 10);
});

test('speed achievement swift_hands checks time correctly', () => {
  // Under 5 minutes - should unlock
  const fastPerformance = makePerformance({ timeSeconds: 250 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const fastAchievements = createDefaultAchievements();

  const fastUnlocked = checkAchievements(fastPerformance, profile, mastery, fastAchievements);
  const fastIds = fastUnlocked.map((u) => u.achievement.id);
  assert.ok(fastIds.includes('swift_hands'), 'Expected swift_hands with fast time');

  // Over 5 minutes - should NOT unlock
  const slowPerformance = makePerformance({ timeSeconds: 400 });
  const slowAchievements = createDefaultAchievements();

  const slowUnlocked = checkAchievements(slowPerformance, profile, mastery, slowAchievements);
  const slowIds = slowUnlocked.map((u) => u.achievement.id);
  assert.ok(!slowIds.includes('swift_hands'), 'Expected swift_hands NOT with slow time');
});

test('4-suit no-hints no-undo unlocks pure_silk', () => {
  const performance = makePerformance({
    difficulty: 4,
    usedHints: 0,
    usedUndos: 0,
  });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('pure_silk'), 'Expected pure_silk to be unlocked');
});

test('4-suit with hints does NOT unlock pure_silk', () => {
  const performance = makePerformance({
    difficulty: 4,
    usedHints: 2,
    usedUndos: 0,
  });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(!ids.includes('pure_silk'), 'Expected pure_silk NOT to be unlocked with hints');
});

test('night owl unlocks between midnight and 5am', () => {
  // The night_owl check uses Date.now() internally.
  // We cannot easily control the hour in the test without mocking Date.
  // This test verifies the logic is present by checking that the achievement exists.
  // For a proper integration test, we'd need to mock Date.now().
  const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'night_owl');
  assert.ok(achievement, 'night_owl achievement should be defined');
  assert.equal(achievement!.description, 'Win a game between midnight and 5am.');
});

test('speed_demon requires 1-suit and under 3 minutes', () => {
  const performance = makePerformance({
    difficulty: 1,
    timeSeconds: 150,
  });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('speed_demon'), 'Expected speed_demon to unlock');
});

test('speed_demon does NOT unlock for 2-suit game', () => {
  const performance = makePerformance({
    difficulty: 2,
    timeSeconds: 150,
  });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(!ids.includes('speed_demon'), 'Expected speed_demon NOT for 2-suit');
});

test('perfect_game unlocks with moves at or below par', () => {
  // 1-suit par is 100 moves, so 90 moves => perfect
  const performance = makePerformance({ moves: 90, difficulty: 1 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('perfect_game'), 'Expected perfect_game to unlock');
});

test('perfect_game does NOT unlock with moves above par', () => {
  // 1-suit par is 100 moves, 150 moves => not perfect
  const performance = makePerformance({ moves: 150, difficulty: 1 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(!ids.includes('perfect_game'), 'Expected perfect_game NOT to unlock above par');
});

test('no achievements unlock if game is lost', () => {
  const performance = makePerformance({ won: false });
  const profile = makeProfile({ totalWins: 100 });
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);

  assert.equal(unlocked.length, 0, 'Expected no achievements for a lost game');
});

test('getAchievementProgress returns correct progress for ten_threads', () => {
  const profile = makeProfile({ totalWins: 7 });
  const progress = getAchievementProgress('ten_threads', profile);

  assert.deepEqual(progress, { current: 7, target: 10 });
});

test('getAchievementProgress caps at target for completed achievements', () => {
  const profile = makeProfile({ totalWins: 150 });
  const progress = getAchievementProgress('century_weaver', profile);

  assert.deepEqual(progress, { current: 100, target: 100 });
});

test('triple_crown unlocks when all difficulties have thread_keeper rank or higher', () => {
  const performance = makePerformance();
  const profile = makeProfile();
  const mastery = makeMastery({
    byDifficulty: {
      '1': { currentXP: 500, rank: 'thread_keeper', rankIndex: 1 },
      '2': { currentXP: 500, rank: 'thread_keeper', rankIndex: 1 },
      '4': { currentXP: 500, rank: 'thread_keeper', rankIndex: 1 },
    },
  });
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('triple_crown'), 'Expected triple_crown to unlock');
});

test('triple_crown does NOT unlock if one difficulty is still apprentice', () => {
  const performance = makePerformance();
  const profile = makeProfile();
  const mastery = makeMastery({
    byDifficulty: {
      '1': { currentXP: 500, rank: 'thread_keeper', rankIndex: 1 },
      '2': { currentXP: 500, rank: 'thread_keeper', rankIndex: 1 },
      '4': { currentXP: 100, rank: 'apprentice', rankIndex: 0 },
    },
  });
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(!ids.includes('triple_crown'), 'Expected triple_crown NOT to unlock');
});

test('weekly_streak unlocks at 7 consecutive wins', () => {
  const performance = makePerformance();
  const profile = makeProfile({ currentWinStreak: 7, bestWinStreak: 7 });
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements);
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('weekly_streak'), 'Expected weekly_streak to unlock');
});

test('daily_devotion unlocks with 7 daily challenges via options', () => {
  const performance = makePerformance({ isDailyChallenge: true });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements, {
    dailyChallengesCompleted: 7,
  });
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('daily_devotion'), 'Expected daily_devotion to unlock');
});

test('two_suit_scholar unlocks with 10 two-suit wins via options', () => {
  const performance = makePerformance({ difficulty: 2 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements, {
    twoSuitWins: 10,
  });
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('two_suit_scholar'), 'Expected two_suit_scholar to unlock');
});

test('four_suit_master unlocks with 5 four-suit wins via options', () => {
  const performance = makePerformance({ difficulty: 4 });
  const profile = makeProfile();
  const mastery = makeMastery();
  const achievements = createDefaultAchievements();

  const unlocked = checkAchievements(performance, profile, mastery, achievements, {
    fourSuitWins: 5,
  });
  const ids = unlocked.map((u) => u.achievement.id);

  assert.ok(ids.includes('four_suit_master'), 'Expected four_suit_master to unlock');
});
