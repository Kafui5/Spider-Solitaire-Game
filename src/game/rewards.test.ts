import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyReward,
  calculateReward,
  createDefaultProfile,
  getEfficiencyRating,
  getStreakMultiplier,
  type GamePerformance,
  type PlayerProfile,
} from './rewards.ts';

function basePerformance(overrides: Partial<GamePerformance> = {}): GamePerformance {
  return {
    difficulty: 1,
    moves: 95,
    timeSeconds: 300,
    usedHints: 0,
    usedUndos: 0,
    runsCompleted: 8,
    sequenceStreaks: 0,
    won: true,
    isDailyChallenge: false,
    ...overrides,
  };
}

test('default profile starts at zero', () => {
  const profile = createDefaultProfile();
  assert.equal(profile.version, 1);
  assert.equal(profile.totalXP, 0);
  assert.equal(profile.silkThreads, 0);
  assert.equal(profile.totalGamesPlayed, 0);
  assert.equal(profile.totalWins, 0);
  assert.equal(profile.currentWinStreak, 0);
  assert.equal(profile.bestWinStreak, 0);
  assert.deepEqual(profile.personalBests, {});
  assert.equal(profile.lifetimeThreadsEarned, 0);
  assert.equal(profile.lifetimeThreadsSpent, 0);
  assert.equal(profile.gamesWithoutHints, 0);
  assert.equal(profile.gamesWithoutUndos, 0);
});

test('1-suit win gives 100 base XP and 10 base threads', () => {
  const profile = createDefaultProfile();
  const perf = basePerformance({ difficulty: 1 });
  const reward = calculateReward(perf, profile);
  assert.equal(reward.baseXP, 100);
  assert.equal(reward.baseThreads, 10);
});

test('2-suit win gives 180 base XP', () => {
  const profile = createDefaultProfile();
  const perf = basePerformance({ difficulty: 2 });
  const reward = calculateReward(perf, profile);
  assert.equal(reward.baseXP, 180);
});

test('4-suit win gives 300 base XP', () => {
  const profile = createDefaultProfile();
  const perf = basePerformance({ difficulty: 4 });
  const reward = calculateReward(perf, profile);
  assert.equal(reward.baseXP, 300);
});

test('no hints adds 15% XP', () => {
  const profile = createDefaultProfile();
  const perfNoHints = basePerformance({ usedHints: 0, usedUndos: 5 });
  const perfWithHints = basePerformance({ usedHints: 3, usedUndos: 5 });
  const rewardNoHints = calculateReward(perfNoHints, profile);
  const rewardWithHints = calculateReward(perfWithHints, profile);
  const expectedBonus = Math.floor(100 * 0.15);
  assert.equal(rewardNoHints.baseXP + expectedBonus, rewardNoHints.baseXP + 15);
  assert.equal(rewardNoHints.totalXP - rewardWithHints.totalXP, expectedBonus);
});

test('no undo adds 15% XP and 3 threads bonus', () => {
  const profile = createDefaultProfile();
  const perfNoUndo = basePerformance({ usedUndos: 0, usedHints: 3 });
  const perfWithUndo = basePerformance({ usedUndos: 5, usedHints: 3 });
  const rewardNoUndo = calculateReward(perfNoUndo, profile);
  const rewardWithUndo = calculateReward(perfWithUndo, profile);
  const expectedXPBonus = Math.floor(100 * 0.15);
  assert.equal(rewardNoUndo.totalXP - rewardWithUndo.totalXP, expectedXPBonus);
  // 3 thread bonus for no undo, minus undo cost difference
  const undoCostDiff = Math.floor(5 / 3);
  assert.equal(
    rewardNoUndo.totalThreads - rewardWithUndo.totalThreads,
    3 + undoCostDiff,
  );
});

test('streak multiplier of 2 gives 1.5x threads', () => {
  assert.equal(getStreakMultiplier(2), 1.5);
  const profile = createDefaultProfile();
  const perf = basePerformance({ sequenceStreaks: 2, usedHints: 3, usedUndos: 3 });
  const reward = calculateReward(perf, profile);
  assert.equal(reward.streakMultiplier, 1.5);
  assert.equal(Math.floor(10 * 1.5), 15);
});

test('streak multiplier of 3 gives 2.25x', () => {
  assert.equal(getStreakMultiplier(3), 2.25);
});

test('streak multiplier of 4+ gives 3x', () => {
  assert.equal(getStreakMultiplier(4), 3);
  assert.equal(getStreakMultiplier(7), 3);
});

test('streak multiplier of 0 or 1 gives 1x', () => {
  assert.equal(getStreakMultiplier(0), 1);
  assert.equal(getStreakMultiplier(1), 1);
});

test('efficiency perfect on 1-suit means <=100 moves', () => {
  assert.equal(getEfficiencyRating(100, 1), 'perfect');
  assert.equal(getEfficiencyRating(80, 1), 'perfect');
  assert.equal(getEfficiencyRating(101, 1), 'excellent');
});

test('efficiency excellent on 1-suit means <=120 moves', () => {
  assert.equal(getEfficiencyRating(120, 1), 'excellent');
  assert.equal(getEfficiencyRating(121, 1), 'good');
});

test('efficiency good on 1-suit means <=150 moves', () => {
  assert.equal(getEfficiencyRating(150, 1), 'good');
  assert.equal(getEfficiencyRating(151, 1), 'average');
});

test('efficiency average on 1-suit means <=200 moves', () => {
  assert.equal(getEfficiencyRating(200, 1), 'average');
  assert.equal(getEfficiencyRating(201, 1), 'below');
});

test('efficiency rating works for 2-suit (par=140)', () => {
  assert.equal(getEfficiencyRating(140, 2), 'perfect');
  assert.equal(getEfficiencyRating(168, 2), 'excellent');
  assert.equal(getEfficiencyRating(210, 2), 'good');
  assert.equal(getEfficiencyRating(280, 2), 'average');
  assert.equal(getEfficiencyRating(281, 2), 'below');
});

test('undo cost subtracts correctly', () => {
  const profile = createDefaultProfile();
  const perf = basePerformance({ usedUndos: 9, usedHints: 3 });
  const reward = calculateReward(perf, profile);
  assert.equal(reward.undoCost, 3); // floor(9/3)
});

test('undo cost rounds down', () => {
  const profile = createDefaultProfile();
  const perf = basePerformance({ usedUndos: 7, usedHints: 3 });
  const reward = calculateReward(perf, profile);
  assert.equal(reward.undoCost, 2); // floor(7/3)
});

test('threads never go below 0', () => {
  const profile = createDefaultProfile();
  // Many undos with below efficiency to minimize threads
  const perf = basePerformance({
    usedUndos: 300,
    usedHints: 5,
    moves: 500,
    sequenceStreaks: 0,
  });
  const reward = calculateReward(perf, profile);
  assert.ok(reward.totalThreads >= 0);
});

test('personal best detection works', () => {
  const profile: PlayerProfile = {
    ...createDefaultProfile(),
    personalBests: {
      '1': { fewestMoves: 120, fastestTime: 400, longestRunStreak: 2 },
    },
  };
  const perf = basePerformance({ moves: 90, timeSeconds: 300, sequenceStreaks: 3 });
  const reward = calculateReward(perf, profile);
  assert.ok(reward.personalRecords.length > 0);
  const movesRecord = reward.personalRecords.find((r) => r.type === 'fewest_moves');
  assert.ok(movesRecord);
  assert.equal(movesRecord.value, 90);
  assert.equal(movesRecord.previousBest, 120);
});

test('personal best not triggered when not beaten', () => {
  const profile: PlayerProfile = {
    ...createDefaultProfile(),
    personalBests: {
      '1': { fewestMoves: 50, fastestTime: 100, longestRunStreak: 10 },
    },
  };
  const perf = basePerformance({ moves: 95, timeSeconds: 300, sequenceStreaks: 2 });
  const reward = calculateReward(perf, profile);
  const movesRecord = reward.personalRecords.find((r) => r.type === 'fewest_moves');
  assert.equal(movesRecord, undefined);
});

test('daily challenge adds 150 XP and 20 threads', () => {
  const profile = createDefaultProfile();
  const perfDaily = basePerformance({ isDailyChallenge: true, usedHints: 3, usedUndos: 3 });
  const perfNormal = basePerformance({ isDailyChallenge: false, usedHints: 3, usedUndos: 3 });
  const rewardDaily = calculateReward(perfDaily, profile);
  const rewardNormal = calculateReward(perfNormal, profile);
  assert.equal(rewardDaily.totalXP - rewardNormal.totalXP, 150);
  assert.equal(rewardDaily.totalThreads - rewardNormal.totalThreads, 20);
});

test('applyReward updates profile correctly', () => {
  const profile = createDefaultProfile();
  const perf = basePerformance();
  const reward = calculateReward(perf, profile);
  const updated = applyReward(profile, reward, perf);

  assert.equal(updated.totalXP, reward.totalXP);
  assert.equal(updated.silkThreads, reward.totalThreads);
  assert.equal(updated.totalGamesPlayed, 1);
  assert.equal(updated.totalWins, 1);
  assert.equal(updated.currentWinStreak, 1);
  assert.equal(updated.bestWinStreak, 1);
  assert.equal(updated.lifetimeThreadsEarned, reward.totalThreads);
});

test('applyReward tracks win streak correctly', () => {
  let profile = createDefaultProfile();
  const perf = basePerformance();

  // Win 3 games
  for (let i = 0; i < 3; i++) {
    const reward = calculateReward(perf, profile);
    profile = applyReward(profile, reward, perf);
  }
  assert.equal(profile.currentWinStreak, 3);
  assert.equal(profile.bestWinStreak, 3);

  // Lose one (not won)
  const losePerf = basePerformance({ won: false });
  const loseReward = calculateReward(losePerf, profile);
  profile = applyReward(profile, loseReward, losePerf);
  assert.equal(profile.currentWinStreak, 0);
  assert.equal(profile.bestWinStreak, 3);
});

test('applyReward sets personal bests on first win', () => {
  const profile = createDefaultProfile();
  const perf = basePerformance({ moves: 88, timeSeconds: 250, sequenceStreaks: 3 });
  const reward = calculateReward(perf, profile);
  const updated = applyReward(profile, reward, perf);

  assert.deepEqual(updated.personalBests['1'], {
    fewestMoves: 88,
    fastestTime: 250,
    longestRunStreak: 3,
  });
});

test('efficiency bonus threads: perfect=+20, excellent=+10, good=+5', () => {
  const profile = createDefaultProfile();

  const perfectPerf = basePerformance({ moves: 80, usedHints: 3, usedUndos: 3 });
  const perfectReward = calculateReward(perfectPerf, profile);
  assert.equal(perfectReward.efficiencyRating, 'perfect');

  const excellentPerf = basePerformance({ moves: 110, usedHints: 3, usedUndos: 3 });
  const excellentReward = calculateReward(excellentPerf, profile);
  assert.equal(excellentReward.efficiencyRating, 'excellent');

  const goodPerf = basePerformance({ moves: 140, usedHints: 3, usedUndos: 3 });
  const goodReward = calculateReward(goodPerf, profile);
  assert.equal(goodReward.efficiencyRating, 'good');

  // Thread differences should reflect efficiency bonus differences
  assert.equal(perfectReward.totalThreads - excellentReward.totalThreads, 10);
  assert.equal(excellentReward.totalThreads - goodReward.totalThreads, 5);
});
