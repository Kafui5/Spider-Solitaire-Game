import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyLoss,
  applyWin,
  createDefaultStats,
  getWinRate,
  getWinRateForDifficulty,
} from './statistics.ts';

import type { GameStats } from './statistics.ts';
import type { Difficulty } from './gameEngine.ts';

test('initial stats are all zero', () => {
  const stats = createDefaultStats();
  assert.equal(stats.totalGames, 0);
  assert.equal(stats.wins, 0);
  assert.equal(stats.losses, 0);
  assert.equal(stats.currentStreak, 0);
  assert.equal(stats.bestStreak, 0);
  assert.deepEqual(stats.byDifficulty, {});
});

test('recording a win increments correctly', () => {
  const stats = createDefaultStats();
  const updated = applyWin(stats, 1, 120, 300);

  assert.equal(updated.totalGames, 1);
  assert.equal(updated.wins, 1);
  assert.equal(updated.losses, 0);
  assert.equal(updated.currentStreak, 1);
  assert.equal(updated.bestStreak, 1);

  const diff = updated.byDifficulty['1'];
  assert.ok(diff);
  assert.equal(diff.played, 1);
  assert.equal(diff.won, 1);
  assert.equal(diff.bestTime, 300);
  assert.equal(diff.bestMoves, 120);
  assert.equal(diff.averageMoves, 120);
  assert.equal(diff.totalMoves, 120);
});

test('streak tracking: win, win, loss resets current but preserves best', () => {
  let stats = createDefaultStats();

  stats = applyWin(stats, 1, 100, 200);
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.bestStreak, 1);

  stats = applyWin(stats, 1, 110, 210);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.bestStreak, 2);

  stats = applyLoss(stats, 1);
  assert.equal(stats.currentStreak, 0);
  assert.equal(stats.bestStreak, 2);

  // Another win starts a new streak
  stats = applyWin(stats, 1, 90, 180);
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.bestStreak, 2);
});

test('best time tracking keeps the minimum', () => {
  let stats = createDefaultStats();

  stats = applyWin(stats, 2, 80, 500);
  assert.equal(stats.byDifficulty['2'].bestTime, 500);

  stats = applyWin(stats, 2, 90, 300);
  assert.equal(stats.byDifficulty['2'].bestTime, 300);

  // Higher time does not replace best
  stats = applyWin(stats, 2, 85, 400);
  assert.equal(stats.byDifficulty['2'].bestTime, 300);
});

test('best moves tracking keeps the minimum', () => {
  let stats = createDefaultStats();

  stats = applyWin(stats, 4, 150, 600);
  assert.equal(stats.byDifficulty['4'].bestMoves, 150);

  stats = applyWin(stats, 4, 100, 500);
  assert.equal(stats.byDifficulty['4'].bestMoves, 100);

  // Higher moves does not replace best
  stats = applyWin(stats, 4, 200, 400);
  assert.equal(stats.byDifficulty['4'].bestMoves, 100);
});

test('per-difficulty isolation: stats for different difficulties are independent', () => {
  let stats = createDefaultStats();

  stats = applyWin(stats, 1, 100, 200);
  stats = applyWin(stats, 2, 150, 400);
  stats = applyLoss(stats, 4);

  // Global
  assert.equal(stats.totalGames, 3);
  assert.equal(stats.wins, 2);
  assert.equal(stats.losses, 1);

  // Difficulty 1
  const d1 = stats.byDifficulty['1'];
  assert.equal(d1.played, 1);
  assert.equal(d1.won, 1);
  assert.equal(d1.bestMoves, 100);

  // Difficulty 2
  const d2 = stats.byDifficulty['2'];
  assert.equal(d2.played, 1);
  assert.equal(d2.won, 1);
  assert.equal(d2.bestMoves, 150);

  // Difficulty 4
  const d4 = stats.byDifficulty['4'];
  assert.equal(d4.played, 1);
  assert.equal(d4.won, 0);
  assert.equal(d4.bestMoves, null);
});

test('average moves is calculated correctly over multiple wins', () => {
  let stats = createDefaultStats();

  stats = applyWin(stats, 1, 100, 200);
  assert.equal(stats.byDifficulty['1'].averageMoves, 100);

  stats = applyWin(stats, 1, 200, 300);
  assert.equal(stats.byDifficulty['1'].averageMoves, 150); // (100+200)/2

  stats = applyWin(stats, 1, 300, 400);
  assert.equal(stats.byDifficulty['1'].averageMoves, 200); // (100+200+300)/3
});

test('getWinRate returns 0 when no games played', () => {
  const stats = createDefaultStats();
  assert.equal(getWinRate(stats), 0);
});

test('getWinRate calculates correct percentage', () => {
  let stats = createDefaultStats();
  stats = applyWin(stats, 1, 100, 200);
  stats = applyWin(stats, 1, 110, 210);
  stats = applyLoss(stats, 1);

  const rate = getWinRate(stats);
  assert.ok(Math.abs(rate - 66.66666666666667) < 0.001);
});

test('getWinRateForDifficulty returns 0 when no games for that difficulty', () => {
  const stats = createDefaultStats();
  assert.equal(getWinRateForDifficulty(stats, 4), 0);
});

test('getWinRateForDifficulty calculates per-difficulty rate', () => {
  let stats = createDefaultStats();
  stats = applyWin(stats, 2, 100, 200);
  stats = applyLoss(stats, 2);

  assert.equal(getWinRateForDifficulty(stats, 2), 50);
});

test('loss does not affect best time or best moves', () => {
  let stats = createDefaultStats();
  stats = applyWin(stats, 1, 100, 200);
  stats = applyLoss(stats, 1);

  assert.equal(stats.byDifficulty['1'].bestTime, 200);
  assert.equal(stats.byDifficulty['1'].bestMoves, 100);
});

test('applyWin does not mutate the input stats', () => {
  const original = createDefaultStats();
  const updated = applyWin(original, 1, 100, 200);

  assert.equal(original.totalGames, 0);
  assert.equal(original.wins, 0);
  assert.notEqual(original, updated);
});

test('applyLoss does not mutate the input stats', () => {
  const original = createDefaultStats();
  const updated = applyLoss(original, 1);

  assert.equal(original.totalGames, 0);
  assert.equal(original.losses, 0);
  assert.notEqual(original, updated);
});
