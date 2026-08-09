import type { Difficulty } from './gameEngine.ts';

export interface GamePerformance {
  difficulty: Difficulty;
  moves: number;
  timeSeconds: number;
  usedHints: number;
  usedUndos: number;
  runsCompleted: number;
  sequenceStreaks: number;
  won: boolean;
  isDailyChallenge: boolean;
}

export interface GameReward {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  baseThreads: number;
  bonusThreads: number;
  totalThreads: number;
  streakMultiplier: number;
  efficiencyRating: 'perfect' | 'excellent' | 'good' | 'average' | 'below';
  personalRecords: PersonalRecord[];
  undoCost: number;
}

export interface PersonalRecord {
  type: 'fewest_moves' | 'fastest_time' | 'longest_streak' | 'no_hints' | 'no_undos';
  value: number;
  previousBest: number | null;
}

export interface PlayerProfile {
  version: 1;
  totalXP: number;
  silkThreads: number;
  totalGamesPlayed: number;
  totalWins: number;
  currentWinStreak: number;
  bestWinStreak: number;
  personalBests: Record<string, PersonalBests>;
  lifetimeThreadsEarned: number;
  lifetimeThreadsSpent: number;
  gamesWithoutHints: number;
  gamesWithoutUndos: number;
}

export interface PersonalBests {
  fewestMoves: number | null;
  fastestTime: number | null;
  longestRunStreak: number | null;
}

const BASE_XP: Record<Difficulty, number> = { 1: 100, 2: 180, 4: 300 };
const BASE_THREADS = 10;
const PAR_MOVES: Record<Difficulty, number> = { 1: 100, 2: 140, 4: 200 };

export function createDefaultProfile(): PlayerProfile {
  return {
    version: 1,
    totalXP: 0,
    silkThreads: 0,
    totalGamesPlayed: 0,
    totalWins: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    personalBests: {},
    lifetimeThreadsEarned: 0,
    lifetimeThreadsSpent: 0,
    gamesWithoutHints: 0,
    gamesWithoutUndos: 0,
  };
}

export function getEfficiencyRating(
  moves: number,
  difficulty: Difficulty,
): 'perfect' | 'excellent' | 'good' | 'average' | 'below' {
  const par = PAR_MOVES[difficulty];
  if (moves <= par) return 'perfect';
  if (moves <= par * 1.2) return 'excellent';
  if (moves <= par * 1.5) return 'good';
  if (moves <= par * 2) return 'average';
  return 'below';
}

export function getStreakMultiplier(sequenceStreaks: number): number {
  if (sequenceStreaks >= 4) return 3;
  if (sequenceStreaks === 3) return 2.25;
  if (sequenceStreaks === 2) return 1.5;
  return 1;
}

function getEfficiencyBonusThreads(
  rating: 'perfect' | 'excellent' | 'good' | 'average' | 'below',
): number {
  switch (rating) {
    case 'perfect': return 20;
    case 'excellent': return 10;
    case 'good': return 5;
    default: return 0;
  }
}

function detectPersonalRecords(
  performance: GamePerformance,
  profile: PlayerProfile,
): PersonalRecord[] {
  const records: PersonalRecord[] = [];
  const key = String(performance.difficulty);
  const bests = profile.personalBests[key];

  if (performance.won) {
    if (bests == null || bests.fewestMoves == null || performance.moves < bests.fewestMoves) {
      records.push({
        type: 'fewest_moves',
        value: performance.moves,
        previousBest: bests?.fewestMoves ?? null,
      });
    }

    if (bests == null || bests.fastestTime == null || performance.timeSeconds < bests.fastestTime) {
      records.push({
        type: 'fastest_time',
        value: performance.timeSeconds,
        previousBest: bests?.fastestTime ?? null,
      });
    }

    if (
      bests == null ||
      bests.longestRunStreak == null ||
      performance.sequenceStreaks > bests.longestRunStreak
    ) {
      records.push({
        type: 'longest_streak',
        value: performance.sequenceStreaks,
        previousBest: bests?.longestRunStreak ?? null,
      });
    }
  }

  if (performance.usedHints === 0 && performance.won) {
    records.push({
      type: 'no_hints',
      value: profile.gamesWithoutHints + 1,
      previousBest: profile.gamesWithoutHints > 0 ? profile.gamesWithoutHints : null,
    });
  }

  if (performance.usedUndos === 0 && performance.won) {
    records.push({
      type: 'no_undos',
      value: profile.gamesWithoutUndos + 1,
      previousBest: profile.gamesWithoutUndos > 0 ? profile.gamesWithoutUndos : null,
    });
  }

  return records;
}

export function calculateReward(
  performance: GamePerformance,
  profile: PlayerProfile,
): GameReward {
  const baseXP = BASE_XP[performance.difficulty];
  const baseThreads = BASE_THREADS;

  let bonusXP = 0;
  let bonusThreads = 0;

  // No hints bonus
  if (performance.usedHints === 0) {
    bonusXP += Math.floor(baseXP * 0.15);
    bonusThreads += 3;
  }

  // No undo bonus
  if (performance.usedUndos === 0) {
    bonusXP += Math.floor(baseXP * 0.15);
    bonusThreads += 3;
  }

  // Personal records
  const personalRecords = detectPersonalRecords(performance, profile);
  if (personalRecords.length > 0) {
    bonusXP += Math.floor(baseXP * 0.1);
    bonusThreads += 2;
  }

  // Daily challenge bonus
  if (performance.isDailyChallenge) {
    bonusXP += 150;
    bonusThreads += 20;
  }

  // Streak multiplier (applied to base threads)
  const streakMultiplier = getStreakMultiplier(performance.sequenceStreaks);

  // Efficiency rating
  const efficiencyRating = getEfficiencyRating(performance.moves, performance.difficulty);
  bonusThreads += getEfficiencyBonusThreads(efficiencyRating);

  // Undo cost
  const undoCost = Math.floor(performance.usedUndos / 3);

  // Calculate total threads: base * streakMultiplier + bonus - undoCost, min 0
  const totalThreads = Math.max(
    0,
    Math.floor(baseThreads * streakMultiplier) + bonusThreads - undoCost,
  );

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    baseThreads,
    bonusThreads,
    totalThreads,
    streakMultiplier,
    efficiencyRating,
    personalRecords,
    undoCost,
  };
}

export function applyReward(
  profile: PlayerProfile,
  reward: GameReward,
  performance: GamePerformance,
): PlayerProfile {
  const updated: PlayerProfile = {
    ...profile,
    totalXP: profile.totalXP + reward.totalXP,
    silkThreads: profile.silkThreads + reward.totalThreads,
    totalGamesPlayed: profile.totalGamesPlayed + 1,
    totalWins: profile.totalWins + (performance.won ? 1 : 0),
    currentWinStreak: performance.won ? profile.currentWinStreak + 1 : 0,
    bestWinStreak: performance.won
      ? Math.max(profile.bestWinStreak, profile.currentWinStreak + 1)
      : profile.bestWinStreak,
    personalBests: { ...profile.personalBests },
    lifetimeThreadsEarned: profile.lifetimeThreadsEarned + reward.totalThreads,
    lifetimeThreadsSpent: profile.lifetimeThreadsSpent,
    gamesWithoutHints: performance.usedHints === 0 && performance.won
      ? profile.gamesWithoutHints + 1
      : profile.gamesWithoutHints,
    gamesWithoutUndos: performance.usedUndos === 0 && performance.won
      ? profile.gamesWithoutUndos + 1
      : profile.gamesWithoutUndos,
  };

  // Update personal bests
  if (performance.won) {
    const key = String(performance.difficulty);
    const current = updated.personalBests[key] ?? {
      fewestMoves: null,
      fastestTime: null,
      longestRunStreak: null,
    };

    updated.personalBests[key] = {
      fewestMoves:
        current.fewestMoves == null || performance.moves < current.fewestMoves
          ? performance.moves
          : current.fewestMoves,
      fastestTime:
        current.fastestTime == null || performance.timeSeconds < current.fastestTime
          ? performance.timeSeconds
          : current.fastestTime,
      longestRunStreak:
        current.longestRunStreak == null || performance.sequenceStreaks > current.longestRunStreak
          ? performance.sequenceStreaks
          : current.longestRunStreak,
    };
  }

  return updated;
}
