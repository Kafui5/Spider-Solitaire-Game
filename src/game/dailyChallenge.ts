import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  computeStreaks,
  getTodayString,
  getTodaysChallenge,
} from './dailyChallengeCore.ts';

export type {
  DailyChallenge,
  DailyChallengeHistory,
} from './dailyChallengeCore.ts';

export {
  computeStreaks,
  getDailyDifficulty,
  getDailySeed,
  getTodayString,
  getTodaysChallenge,
} from './dailyChallengeCore.ts';

import type { DailyChallengeHistory } from './dailyChallengeCore.ts';

const STORAGE_KEY = '@silk-spider/daily-v1';

/** Load challenge history from AsyncStorage. */
export async function loadChallengeHistory(): Promise<DailyChallengeHistory> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { challenges: [], currentStreak: 0, longestStreak: 0 };
  }
  return JSON.parse(raw) as DailyChallengeHistory;
}

/** Save challenge history to AsyncStorage. */
export async function saveChallengeHistory(history: DailyChallengeHistory): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/** Marks today's challenge as complete and updates streaks. */
export async function markChallengeComplete(
  moves: number,
  timeSeconds: number,
): Promise<DailyChallengeHistory> {
  const history = await loadChallengeHistory();
  const today = getTodayString();

  const existing = history.challenges.find((c) => c.date === today);
  if (existing) {
    existing.completed = true;
    existing.completedAt = Date.now();
    existing.moves = moves;
    existing.timeSeconds = timeSeconds;
  } else {
    history.challenges.push({
      ...getTodaysChallenge(),
      completed: true,
      completedAt: Date.now(),
      moves,
      timeSeconds,
    });
  }

  const { currentStreak, longestStreak } = computeStreaks(history.challenges);
  history.currentStreak = currentStreak;
  history.longestStreak = longestStreak;

  await saveChallengeHistory(history);
  return history;
}

/** Quick check whether today's challenge has been completed. */
export async function isTodayChallengeCompleted(): Promise<boolean> {
  const history = await loadChallengeHistory();
  const today = getTodayString();
  return history.challenges.some((c) => c.date === today && c.completed);
}
