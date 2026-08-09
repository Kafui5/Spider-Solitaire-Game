import type { Difficulty } from './gameEngine.ts';

const STATS_KEY = '@silk-spider/stats-v1';

export interface DifficultyStats {
  played: number;
  won: number;
  bestTime: number | null; // seconds
  bestMoves: number | null;
  averageMoves: number; // running average
  totalMoves: number;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number; // abandoned games
  currentStreak: number;
  bestStreak: number;
  byDifficulty: Record<string, DifficultyStats>;
}

function defaultDifficultyStats(): DifficultyStats {
  return {
    played: 0,
    won: 0,
    bestTime: null,
    bestMoves: null,
    averageMoves: 0,
    totalMoves: 0,
  };
}

export function createDefaultStats(): GameStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    byDifficulty: {},
  };
}

// --- Pure logic helpers (exported for testing) ---

export function applyWin(
  stats: GameStats,
  difficulty: Difficulty,
  moves: number,
  timeSeconds: number,
): GameStats {
  const updated: GameStats = {
    ...stats,
    totalGames: stats.totalGames + 1,
    wins: stats.wins + 1,
    losses: stats.losses,
    currentStreak: stats.currentStreak + 1,
    bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1),
    byDifficulty: { ...stats.byDifficulty },
  };

  const key = String(difficulty);
  const prev = stats.byDifficulty[key] ?? defaultDifficultyStats();
  const newTotalMoves = prev.totalMoves + moves;

  updated.byDifficulty[key] = {
    played: prev.played + 1,
    won: prev.won + 1,
    bestTime: prev.bestTime === null ? timeSeconds : Math.min(prev.bestTime, timeSeconds),
    bestMoves: prev.bestMoves === null ? moves : Math.min(prev.bestMoves, moves),
    averageMoves: newTotalMoves / (prev.played + 1),
    totalMoves: newTotalMoves,
  };

  return updated;
}

export function applyLoss(stats: GameStats, difficulty: Difficulty): GameStats {
  const updated: GameStats = {
    ...stats,
    totalGames: stats.totalGames + 1,
    wins: stats.wins,
    losses: stats.losses + 1,
    currentStreak: 0,
    bestStreak: stats.bestStreak,
    byDifficulty: { ...stats.byDifficulty },
  };

  const key = String(difficulty);
  const prev = stats.byDifficulty[key] ?? defaultDifficultyStats();

  updated.byDifficulty[key] = {
    ...prev,
    played: prev.played + 1,
  };

  return updated;
}

// --- Win rate helpers ---

export function getWinRate(stats: GameStats): number {
  if (stats.totalGames === 0) return 0;
  return (stats.wins / stats.totalGames) * 100;
}

export function getWinRateForDifficulty(stats: GameStats, difficulty: Difficulty): number {
  const key = String(difficulty);
  const diffStats = stats.byDifficulty[key];
  if (!diffStats || diffStats.played === 0) return 0;
  return (diffStats.won / diffStats.played) * 100;
}

// --- Async persistence functions ---

async function getStorage() {
  const mod = await import('@react-native-async-storage/async-storage');
  return mod.default;
}

export async function loadStats(): Promise<GameStats> {
  const AsyncStorage = await getStorage();
  const value = await AsyncStorage.getItem(STATS_KEY);
  if (!value) return createDefaultStats();

  try {
    const parsed = JSON.parse(value) as GameStats;
    if (typeof parsed.totalGames !== 'number' || typeof parsed.wins !== 'number') {
      return createDefaultStats();
    }
    return parsed;
  } catch {
    return createDefaultStats();
  }
}

export async function saveStats(stats: GameStats): Promise<void> {
  const AsyncStorage = await getStorage();
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function recordWin(
  difficulty: Difficulty,
  moves: number,
  timeSeconds: number,
): Promise<GameStats> {
  const stats = await loadStats();
  const updated = applyWin(stats, difficulty, moves, timeSeconds);
  await saveStats(updated);
  return updated;
}

export async function recordLoss(difficulty: Difficulty): Promise<GameStats> {
  const stats = await loadStats();
  const updated = applyLoss(stats, difficulty);
  await saveStats(updated);
  return updated;
}

export async function resetStats(): Promise<GameStats> {
  const defaults = createDefaultStats();
  await saveStats(defaults);
  return defaults;
}
