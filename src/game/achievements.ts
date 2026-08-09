import type { Difficulty } from './gameEngine';
import type { GamePerformance, PlayerProfile } from './rewards';
import type { PlayerMastery } from './mastery';

// --- Achievement interfaces ---

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  threadReward: number;
  xpReward: number;
  category: 'skill' | 'dedication' | 'mastery' | 'special';
  unlockCardBack?: string;
}

export interface AchievementProgress {
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  progress?: number; // for progressive achievements
  target?: number;
}

export interface PlayerAchievements {
  achievements: Record<string, AchievementProgress>;
}

export interface NewlyUnlocked {
  achievement: Achievement;
  progress?: number;
}

// --- Par moves for efficiency calculation ---

const PAR_MOVES: Record<Difficulty, number> = { 1: 100, 2: 140, 4: 200 };

function computeEfficiencyRating(
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

// --- All 18 Achievements ---

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Skill category
  {
    id: 'first_thread',
    name: 'First Thread',
    description: 'Win your first game.',
    icon: '🧵',
    threadReward: 5,
    xpReward: 10,
    category: 'skill',
  },
  {
    id: 'keen_eye',
    name: 'Keen Eye',
    description: 'Win without using a hint.',
    icon: '👁️',
    threadReward: 10,
    xpReward: 20,
    category: 'skill',
  },
  {
    id: 'unbroken_silk',
    name: 'Unbroken Silk',
    description: 'Win without using undo.',
    icon: '🪡',
    threadReward: 15,
    xpReward: 25,
    category: 'skill',
  },
  {
    id: 'swift_hands',
    name: 'Swift Hands',
    description: 'Win in under 5 minutes.',
    icon: '⚡',
    threadReward: 15,
    xpReward: 25,
    category: 'skill',
  },
  {
    id: 'patient_weaver',
    name: 'Patient Weaver',
    description: 'Win a game lasting over 30 minutes.',
    icon: '🕰️',
    threadReward: 10,
    xpReward: 15,
    category: 'skill',
  },
  {
    id: 'minimal_touch',
    name: 'Minimal Touch',
    description: 'Win with under 100 moves (1-suit).',
    icon: '🎯',
    threadReward: 20,
    xpReward: 30,
    category: 'skill',
  },

  // Dedication category
  {
    id: 'ten_threads',
    name: 'Ten Threads',
    description: 'Win 10 games.',
    icon: '🔟',
    threadReward: 20,
    xpReward: 30,
    category: 'dedication',
  },
  {
    id: 'century_weaver',
    name: 'Century Weaver',
    description: 'Win 100 games.',
    icon: '💯',
    threadReward: 100,
    xpReward: 200,
    category: 'dedication',
    unlockCardBack: 'century',
  },
  {
    id: 'daily_devotion',
    name: 'Daily Devotion',
    description: 'Complete 7 daily challenges.',
    icon: '☀️',
    threadReward: 30,
    xpReward: 50,
    category: 'dedication',
  },
  {
    id: 'weekly_streak',
    name: 'Weekly Streak',
    description: 'Win 7 games in a row.',
    icon: '🔥',
    threadReward: 25,
    xpReward: 40,
    category: 'dedication',
  },
  {
    id: 'monthly_tapestry',
    name: 'Monthly Tapestry',
    description: 'Complete 20 daily challenges.',
    icon: '🗓️',
    threadReward: 50,
    xpReward: 80,
    category: 'dedication',
  },

  // Mastery category
  {
    id: 'two_suit_scholar',
    name: 'Two-Suit Scholar',
    description: 'Win 10 two-suit games.',
    icon: '📚',
    threadReward: 25,
    xpReward: 40,
    category: 'mastery',
  },
  {
    id: 'four_suit_master',
    name: 'Four-Suit Master',
    description: 'Win 5 four-suit games.',
    icon: '👑',
    threadReward: 40,
    xpReward: 60,
    category: 'mastery',
    unlockCardBack: 'master',
  },
  {
    id: 'pure_silk',
    name: 'Pure Silk',
    description: 'Win a 4-suit game with no hints and no undo.',
    icon: '✨',
    threadReward: 100,
    xpReward: 200,
    category: 'mastery',
    unlockCardBack: 'pure_silk',
  },
  {
    id: 'triple_crown',
    name: 'Triple Crown',
    description: 'Reach Thread Keeper rank in all 3 difficulties.',
    icon: '👑',
    threadReward: 50,
    xpReward: 100,
    category: 'mastery',
  },

  // Special category
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Win a game between midnight and 5am.',
    icon: '🦉',
    threadReward: 10,
    xpReward: 15,
    category: 'special',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win a 1-suit game in under 3 minutes.',
    icon: '🏎️',
    threadReward: 30,
    xpReward: 50,
    category: 'special',
  },
  {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: "Win with efficiency rating 'perfect'.",
    icon: '💎',
    threadReward: 50,
    xpReward: 100,
    category: 'special',
    unlockCardBack: 'diamond',
  },
];

// --- Helper: lookup achievement by ID ---

const achievementMap = new Map<string, Achievement>(
  ALL_ACHIEVEMENTS.map((a) => [a.id, a]),
);

export function getAchievementById(id: string): Achievement | undefined {
  return achievementMap.get(id);
}

// --- Create default achievements state ---

export function createDefaultAchievements(): PlayerAchievements {
  const achievements: Record<string, AchievementProgress> = {};
  for (const a of ALL_ACHIEVEMENTS) {
    achievements[a.id] = { unlocked: false };
  }
  return { achievements };
}

// --- Progressive achievement targets ---

const PROGRESSIVE_TARGETS: Record<string, number> = {
  first_thread: 1,
  ten_threads: 10,
  century_weaver: 100,
  daily_devotion: 7,
  weekly_streak: 7,
  monthly_tapestry: 20,
  two_suit_scholar: 10,
  four_suit_master: 5,
};

// --- Get achievement progress for progressive achievements ---

export function getAchievementProgress(
  id: string,
  profile: PlayerProfile,
  mastery?: PlayerMastery,
  dailyChallengesCompleted?: number,
): { current: number; target: number } {
  const target = PROGRESSIVE_TARGETS[id] ?? 1;

  switch (id) {
    case 'first_thread':
      return { current: Math.min(profile.totalWins, 1), target };
    case 'ten_threads':
      return { current: Math.min(profile.totalWins, target), target };
    case 'century_weaver':
      return { current: Math.min(profile.totalWins, target), target };
    case 'daily_devotion':
      return { current: Math.min(dailyChallengesCompleted ?? 0, target), target };
    case 'weekly_streak':
      return { current: Math.min(profile.bestWinStreak, target), target };
    case 'monthly_tapestry':
      return { current: Math.min(dailyChallengesCompleted ?? 0, target), target };
    case 'two_suit_scholar':
    case 'four_suit_master':
      // Without per-difficulty win counts on PlayerProfile, return 0
      // Callers can pass additional context if needed
      return { current: 0, target };
    default:
      return { current: 0, target: 1 };
  }
}

// --- Check which achievements are newly unlocked ---

export function checkAchievements(
  performance: GamePerformance,
  profile: PlayerProfile,
  mastery: PlayerMastery,
  currentAchievements: PlayerAchievements,
  options?: {
    dailyChallengesCompleted?: number;
    twoSuitWins?: number;
    fourSuitWins?: number;
  },
): NewlyUnlocked[] {
  const newlyUnlocked: NewlyUnlocked[] = [];

  // Only check if the game was won
  if (!performance.won) return newlyUnlocked;

  const now = Date.now();
  const hour = new Date(now).getHours();

  // Compute efficiency from moves and difficulty
  const efficiencyRating = computeEfficiencyRating(
    performance.moves,
    performance.difficulty,
  );

  // Derive daily challenge count - increment if this game is a daily challenge
  const dailyChallengesCompleted = options?.dailyChallengesCompleted ?? 0;

  // Derive per-difficulty wins from options or default to 0
  const twoSuitWins = options?.twoSuitWins ?? 0;
  const fourSuitWins = options?.fourSuitWins ?? 0;

  // Helper to try unlocking an achievement
  function tryUnlock(id: string, condition: boolean, progress?: number): void {
    const existing = currentAchievements.achievements[id];
    if (existing?.unlocked) return;

    if (condition) {
      const achievement = achievementMap.get(id);
      if (achievement) {
        newlyUnlocked.push({ achievement, progress });
        // Mark as unlocked in currentAchievements so subsequent checks in
        // this same call won't double-trigger
        currentAchievements.achievements[id] = {
          unlocked: true,
          unlockedAt: now,
          progress,
          target: PROGRESSIVE_TARGETS[id],
        };
      }
    }
  }

  // --- Skill achievements ---

  // first_thread: Win your first game
  tryUnlock('first_thread', profile.totalWins >= 1);

  // keen_eye: Win without using a hint
  tryUnlock('keen_eye', performance.usedHints === 0);

  // unbroken_silk: Win without using undo
  tryUnlock('unbroken_silk', performance.usedUndos === 0);

  // swift_hands: Win in under 5 minutes (300 seconds)
  tryUnlock('swift_hands', performance.timeSeconds < 300);

  // patient_weaver: Win a game lasting over 30 minutes (1800 seconds)
  tryUnlock('patient_weaver', performance.timeSeconds > 1800);

  // minimal_touch: Win with under 100 moves (1-suit)
  tryUnlock(
    'minimal_touch',
    performance.difficulty === 1 && performance.moves < 100,
  );

  // --- Dedication achievements ---

  // ten_threads: Win 10 games
  tryUnlock('ten_threads', profile.totalWins >= 10, profile.totalWins);

  // century_weaver: Win 100 games
  tryUnlock('century_weaver', profile.totalWins >= 100, profile.totalWins);

  // daily_devotion: Complete 7 daily challenges
  tryUnlock(
    'daily_devotion',
    dailyChallengesCompleted >= 7,
    dailyChallengesCompleted,
  );

  // weekly_streak: Win 7 games in a row
  tryUnlock(
    'weekly_streak',
    profile.currentWinStreak >= 7 || profile.bestWinStreak >= 7,
    Math.max(profile.currentWinStreak, profile.bestWinStreak),
  );

  // monthly_tapestry: Complete 20 daily challenges
  tryUnlock(
    'monthly_tapestry',
    dailyChallengesCompleted >= 20,
    dailyChallengesCompleted,
  );

  // --- Mastery achievements ---

  // two_suit_scholar: Win 10 two-suit games
  tryUnlock('two_suit_scholar', twoSuitWins >= 10, twoSuitWins);

  // four_suit_master: Win 5 four-suit games
  tryUnlock('four_suit_master', fourSuitWins >= 5, fourSuitWins);

  // pure_silk: Win a 4-suit game with no hints and no undo
  tryUnlock(
    'pure_silk',
    performance.difficulty === 4 &&
      performance.usedHints === 0 &&
      performance.usedUndos === 0,
  );

  // triple_crown: Reach Thread Keeper rank in all 3 difficulties
  const threadKeeperRank = 'thread_keeper';
  const rank1 = mastery.byDifficulty['1']?.rank;
  const rank2 = mastery.byDifficulty['2']?.rank;
  const rank4 = mastery.byDifficulty['4']?.rank;
  const RANK_ORDER = ['apprentice', 'thread_keeper', 'pattern_maker', 'web_weaver', 'silk_master', 'grand_weaver'];
  const hasTripleCrown =
    rank1 != null && RANK_ORDER.indexOf(rank1) >= RANK_ORDER.indexOf(threadKeeperRank) &&
    rank2 != null && RANK_ORDER.indexOf(rank2) >= RANK_ORDER.indexOf(threadKeeperRank) &&
    rank4 != null && RANK_ORDER.indexOf(rank4) >= RANK_ORDER.indexOf(threadKeeperRank);
  tryUnlock('triple_crown', hasTripleCrown);

  // --- Special achievements ---

  // night_owl: Win a game between midnight and 5am
  tryUnlock('night_owl', hour >= 0 && hour < 5);

  // speed_demon: Win a 1-suit game in under 3 minutes (180 seconds)
  tryUnlock(
    'speed_demon',
    performance.difficulty === 1 && performance.timeSeconds < 180,
  );

  // perfect_game: Win with efficiency rating 'perfect'
  tryUnlock('perfect_game', efficiencyRating === 'perfect');

  return newlyUnlocked;
}
