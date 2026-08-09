import type { Difficulty } from './gameEngine.ts';

export type MasteryRank =
  | 'apprentice'
  | 'thread_keeper'
  | 'pattern_maker'
  | 'web_weaver'
  | 'silk_master'
  | 'grand_weaver';

export interface MasteryLevel {
  rank: MasteryRank;
  displayName: string;
  xpRequired: number; // cumulative XP needed to reach this rank
  icon: string; // emoji
}

export interface PlayerMastery {
  // Per-difficulty mastery tracked separately
  byDifficulty: Record<string, DifficultyMastery>;
}

export interface DifficultyMastery {
  currentXP: number;
  rank: MasteryRank;
  rankIndex: number; // 0-5
}

export const MASTERY_LEVELS: MasteryLevel[] = [
  { rank: 'apprentice', displayName: 'Apprentice', xpRequired: 0, icon: '🕸️' },
  { rank: 'thread_keeper', displayName: 'Thread Keeper', xpRequired: 500, icon: '🧵' },
  { rank: 'pattern_maker', displayName: 'Pattern Maker', xpRequired: 1500, icon: '🔮' },
  { rank: 'web_weaver', displayName: 'Web Weaver', xpRequired: 4000, icon: '🌐' },
  { rank: 'silk_master', displayName: 'Silk Master', xpRequired: 8000, icon: '✨' },
  { rank: 'grand_weaver', displayName: 'Grand Weaver', xpRequired: 15000, icon: '👑' },
];

const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.8,
  4: 3,
};

export function createDefaultMastery(): PlayerMastery {
  return {
    byDifficulty: {},
  };
}

function getDefaultDifficultyMastery(): DifficultyMastery {
  return {
    currentXP: 0,
    rank: 'apprentice',
    rankIndex: 0,
  };
}

export function getRankForXP(xp: number): { rank: MasteryRank; rankIndex: number } {
  let rankIndex = 0;
  for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= MASTERY_LEVELS[i].xpRequired) {
      rankIndex = i;
      break;
    }
  }
  return { rank: MASTERY_LEVELS[rankIndex].rank, rankIndex };
}

export function addMasteryXP(
  mastery: PlayerMastery,
  difficulty: Difficulty,
  xpEarned: number
): PlayerMastery {
  const key = String(difficulty);
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] ?? 1;
  const effectiveXP = Math.round(xpEarned * multiplier);

  const current = mastery.byDifficulty[key] ?? getDefaultDifficultyMastery();
  const newXP = current.currentXP + effectiveXP;
  const { rank, rankIndex } = getRankForXP(newXP);

  return {
    ...mastery,
    byDifficulty: {
      ...mastery.byDifficulty,
      [key]: {
        currentXP: newXP,
        rank,
        rankIndex,
      },
    },
  };
}

export function getProgressToNextRank(
  mastery: DifficultyMastery
): { current: number; required: number; percentage: number } {
  const { rankIndex, currentXP } = mastery;

  // At max rank
  if (rankIndex >= MASTERY_LEVELS.length - 1) {
    const lastThreshold = MASTERY_LEVELS[MASTERY_LEVELS.length - 1].xpRequired;
    return { current: currentXP - lastThreshold, required: 1, percentage: 100 };
  }

  const currentThreshold = MASTERY_LEVELS[rankIndex].xpRequired;
  const nextThreshold = MASTERY_LEVELS[rankIndex + 1].xpRequired;
  const xpIntoCurrentRank = currentXP - currentThreshold;
  const xpNeededForNextRank = nextThreshold - currentThreshold;
  const percentage = Math.min(
    100,
    Math.round((xpIntoCurrentRank / xpNeededForNextRank) * 100)
  );

  return {
    current: xpIntoCurrentRank,
    required: xpNeededForNextRank,
    percentage,
  };
}

export function getMasteryDisplayName(rank: MasteryRank): string {
  const level = MASTERY_LEVELS.find((l) => l.rank === rank);
  return level?.displayName ?? 'Unknown';
}

export function getMasteryIcon(rank: MasteryRank): string {
  const level = MASTERY_LEVELS.find((l) => l.rank === rank);
  return level?.icon ?? '❓';
}
