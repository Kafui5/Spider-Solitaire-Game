import type { Difficulty } from './gameEngine.ts';

export interface DailyChallenge {
  date: string; // 'YYYY-MM-DD'
  seed: number;
  difficulty: Difficulty;
  completed: boolean;
  completedAt?: number;
  moves?: number;
  timeSeconds?: number;
}

export interface DailyChallengeHistory {
  challenges: DailyChallenge[];
  currentStreak: number;
  longestStreak: number;
}

/** Returns today's date as 'YYYY-MM-DD' in UTC. */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Deterministic seed from a date string using FNV-1a hash. */
export function getDailySeed(dateString: string): number {
  let hash = 0x811c9dc5; // FNV-1a offset basis
  for (let i = 0; i < dateString.length; i += 1) {
    hash ^= dateString.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV-1a prime
  }
  return hash >>> 0; // ensure unsigned 32-bit integer
}

/**
 * Rotates difficulty by day of week:
 * Mon/Thu = 1 suit, Tue/Fri = 2 suits, Wed/Sat/Sun = 4 suits
 */
export function getDailyDifficulty(dateString: string): Difficulty {
  const date = new Date(`${dateString}T00:00:00Z`);
  const dayOfWeek = date.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  switch (dayOfWeek) {
    case 1: // Monday
    case 4: // Thursday
      return 1;
    case 2: // Tuesday
    case 5: // Friday
      return 2;
    default: // Wednesday(3), Saturday(6), Sunday(0)
      return 4;
  }
}

/** Creates today's challenge info (without completion data). */
export function getTodaysChallenge(): DailyChallenge {
  const date = getTodayString();
  return {
    date,
    seed: getDailySeed(date),
    difficulty: getDailyDifficulty(date),
    completed: false,
  };
}

/** Compute streak values from the challenge list. */
export function computeStreaks(
  challenges: DailyChallenge[],
  today?: string,
): { currentStreak: number; longestStreak: number } {
  const referenceDate = today ?? getTodayString();

  const completedDates = challenges
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort()
    .reverse(); // most recent first

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate longest streak by walking dates in ascending order
  const sortedAsc = [...completedDates].reverse();
  let longestStreak = 1;
  let streak = 1;

  for (let i = 1; i < sortedAsc.length; i += 1) {
    const prev = new Date(`${sortedAsc[i - 1]}T00:00:00Z`);
    const curr = new Date(`${sortedAsc[i]}T00:00:00Z`);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak += 1;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  // Current streak: count consecutive days ending at most yesterday or today
  let currentStreak = 0;
  const lastCompleted = completedDates[0];
  const lastDate = new Date(`${lastCompleted}T00:00:00Z`);
  const todayDate = new Date(`${referenceDate}T00:00:00Z`);
  const daysSinceLast = (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLast <= 1) {
    currentStreak = 1;
    for (let i = 1; i < completedDates.length; i += 1) {
      const prev = new Date(`${completedDates[i - 1]}T00:00:00Z`);
      const curr = new Date(`${completedDates[i]}T00:00:00Z`);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}
