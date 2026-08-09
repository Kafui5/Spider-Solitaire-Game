import assert from 'node:assert/strict';
import test from 'node:test';

import {
  computeStreaks,
  getDailyDifficulty,
  getDailySeed,
  getTodayString,
  getTodaysChallenge,
  type DailyChallenge,
} from './dailyChallengeCore.ts';

test('getTodayString returns YYYY-MM-DD format', () => {
  const today = getTodayString();
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
});

test('getDailySeed produces same number for same date', () => {
  const seed1 = getDailySeed('2026-08-09');
  const seed2 = getDailySeed('2026-08-09');
  assert.equal(seed1, seed2);
});

test('getDailySeed produces different numbers for different dates', () => {
  const seed1 = getDailySeed('2026-08-09');
  const seed2 = getDailySeed('2026-08-10');
  const seed3 = getDailySeed('2025-01-01');
  assert.notEqual(seed1, seed2);
  assert.notEqual(seed1, seed3);
  assert.notEqual(seed2, seed3);
});

test('getDailySeed returns a positive 32-bit integer', () => {
  const seed = getDailySeed('2026-08-09');
  assert.ok(seed >= 0);
  assert.ok(seed <= 0xffffffff);
  assert.equal(seed, Math.floor(seed));
});

test('getDailySeed is deterministic across many calls', () => {
  const results = new Set<number>();
  for (let i = 0; i < 100; i += 1) {
    results.add(getDailySeed('2026-08-09'));
  }
  assert.equal(results.size, 1);
});

test('getDailyDifficulty returns 1 suit on Monday', () => {
  // 2026-08-10 is a Monday
  assert.equal(getDailyDifficulty('2026-08-10'), 1);
});

test('getDailyDifficulty returns 1 suit on Thursday', () => {
  // 2026-08-13 is a Thursday
  assert.equal(getDailyDifficulty('2026-08-13'), 1);
});

test('getDailyDifficulty returns 2 suits on Tuesday', () => {
  // 2026-08-11 is a Tuesday
  assert.equal(getDailyDifficulty('2026-08-11'), 2);
});

test('getDailyDifficulty returns 2 suits on Friday', () => {
  // 2026-08-14 is a Friday
  assert.equal(getDailyDifficulty('2026-08-14'), 2);
});

test('getDailyDifficulty returns 4 suits on Wednesday', () => {
  // 2026-08-12 is a Wednesday
  assert.equal(getDailyDifficulty('2026-08-12'), 4);
});

test('getDailyDifficulty returns 4 suits on Saturday', () => {
  // 2026-08-15 is a Saturday
  assert.equal(getDailyDifficulty('2026-08-15'), 4);
});

test('getDailyDifficulty returns 4 suits on Sunday', () => {
  // 2026-08-09 is a Sunday
  assert.equal(getDailyDifficulty('2026-08-09'), 4);
});

test('getDailyDifficulty covers full week correctly', () => {
  const expected: [string, 1 | 2 | 4][] = [
    ['2026-08-09', 4], // Sunday
    ['2026-08-10', 1], // Monday
    ['2026-08-11', 2], // Tuesday
    ['2026-08-12', 4], // Wednesday
    ['2026-08-13', 1], // Thursday
    ['2026-08-14', 2], // Friday
    ['2026-08-15', 4], // Saturday
  ];

  for (const [date, difficulty] of expected) {
    assert.equal(getDailyDifficulty(date), difficulty, `${date} should have difficulty ${difficulty}`);
  }
});

test('getTodaysChallenge returns a valid challenge object', () => {
  const challenge = getTodaysChallenge();
  assert.equal(challenge.date, getTodayString());
  assert.equal(challenge.seed, getDailySeed(challenge.date));
  assert.equal(challenge.difficulty, getDailyDifficulty(challenge.date));
  assert.equal(challenge.completed, false);
  assert.equal(challenge.completedAt, undefined);
});

// --- Streak calculation tests ---

function challenge(date: string, completed = true): DailyChallenge {
  return {
    date,
    seed: getDailySeed(date),
    difficulty: getDailyDifficulty(date),
    completed,
    completedAt: completed ? Date.now() : undefined,
  };
}

test('computeStreaks: empty history returns zero streaks', () => {
  const result = computeStreaks([], '2026-08-09');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.longestStreak, 0);
});

test('computeStreaks: single completed day gives streak of 1', () => {
  const result = computeStreaks([challenge('2026-08-09')], '2026-08-09');
  assert.equal(result.currentStreak, 1);
  assert.equal(result.longestStreak, 1);
});

test('computeStreaks: consecutive days increase streak', () => {
  const challenges = [
    challenge('2026-08-06'),
    challenge('2026-08-07'),
    challenge('2026-08-08'),
    challenge('2026-08-09'),
  ];
  const result = computeStreaks(challenges, '2026-08-09');
  assert.equal(result.currentStreak, 4);
  assert.equal(result.longestStreak, 4);
});

test('computeStreaks: gap breaks current streak', () => {
  const challenges = [
    challenge('2026-08-05'),
    challenge('2026-08-06'),
    challenge('2026-08-07'),
    // gap on 2026-08-08
    challenge('2026-08-09'),
  ];
  const result = computeStreaks(challenges, '2026-08-09');
  assert.equal(result.currentStreak, 1);
  assert.equal(result.longestStreak, 3);
});

test('computeStreaks: streak from yesterday still counts', () => {
  const challenges = [
    challenge('2026-08-07'),
    challenge('2026-08-08'),
  ];
  // Today is 2026-08-09 but not yet completed
  const result = computeStreaks(challenges, '2026-08-09');
  assert.equal(result.currentStreak, 2);
  assert.equal(result.longestStreak, 2);
});

test('computeStreaks: streak breaks if last completion was 2+ days ago', () => {
  const challenges = [
    challenge('2026-08-05'),
    challenge('2026-08-06'),
    challenge('2026-08-07'),
  ];
  // Today is 2026-08-09, last completion was 2026-08-07 (2 days ago)
  const result = computeStreaks(challenges, '2026-08-09');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.longestStreak, 3);
});

test('computeStreaks: incomplete challenges do not count', () => {
  const challenges = [
    challenge('2026-08-07', true),
    challenge('2026-08-08', false), // started but not completed
    challenge('2026-08-09', true),
  ];
  const result = computeStreaks(challenges, '2026-08-09');
  // 08-08 is not completed so streak from today is just 1
  assert.equal(result.currentStreak, 1);
  assert.equal(result.longestStreak, 1);
});

test('computeStreaks: longest streak in the past exceeds current', () => {
  const challenges = [
    challenge('2026-08-01'),
    challenge('2026-08-02'),
    challenge('2026-08-03'),
    challenge('2026-08-04'),
    challenge('2026-08-05'),
    // gap
    challenge('2026-08-08'),
    challenge('2026-08-09'),
  ];
  const result = computeStreaks(challenges, '2026-08-09');
  assert.equal(result.currentStreak, 2);
  assert.equal(result.longestStreak, 5);
});
