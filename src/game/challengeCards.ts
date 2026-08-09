import type { Difficulty } from './gameEngine.ts';
import type { GamePerformance } from './rewards.ts';

export interface ChallengeCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  bonusThreads: number;
  bonusXP: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ActiveChallenge {
  card: ChallengeCard;
  completed: boolean;
}

export const ALL_CHALLENGE_CARDS: ChallengeCard[] = [
  {
    id: 'no_hints',
    name: 'Silent Weaver',
    description: 'Win without using hints.',
    icon: '🤫',
    bonusThreads: 10,
    bonusXP: 50,
    difficulty: 'medium',
  },
  {
    id: 'no_undo',
    name: 'Committed Thread',
    description: 'Win without using undo.',
    icon: '🧵',
    bonusThreads: 15,
    bonusXP: 75,
    difficulty: 'hard',
  },
  {
    id: 'speed_run',
    name: 'Quick Fingers',
    description: 'Win in under 8 minutes.',
    icon: '⚡',
    bonusThreads: 10,
    bonusXP: 50,
    difficulty: 'medium',
  },
  {
    id: 'under_moves',
    name: 'Elegant Line',
    description: 'Win in under 120 moves (any difficulty).',
    icon: '✨',
    bonusThreads: 12,
    bonusXP: 60,
    difficulty: 'medium',
  },
  {
    id: 'no_empty',
    name: 'Full Loom',
    description: 'Win without ever having more than 2 empty columns at once.',
    icon: '🏗️',
    bonusThreads: 8,
    bonusXP: 40,
    difficulty: 'easy',
  },
  {
    id: 'streak_three',
    name: 'Triple Weave',
    description: 'Complete 3 runs without dealing from stock.',
    icon: '🌀',
    bonusThreads: 20,
    bonusXP: 100,
    difficulty: 'hard',
  },
  {
    id: 'first_deal',
    name: 'Opening Gambit',
    description: 'Complete a run before your second stock deal.',
    icon: '🎯',
    bonusThreads: 12,
    bonusXP: 60,
    difficulty: 'medium',
  },
  {
    id: 'all_revealed',
    name: 'Clear Vision',
    description: 'Reveal all face-down cards before completing your 5th run.',
    icon: '👁️',
    bonusThreads: 15,
    bonusXP: 75,
    difficulty: 'hard',
  },
];

/**
 * Returns 3 random challenge cards appropriate for the given difficulty.
 * - Difficulty 1 (easy): only easy and medium cards
 * - Difficulty 2 (medium): all cards available
 * - Difficulty 4 (hard): only medium and hard cards
 */
export function getAvailableChallenges(difficulty: Difficulty): ChallengeCard[] {
  let pool: ChallengeCard[];

  if (difficulty === 1) {
    pool = ALL_CHALLENGE_CARDS.filter(
      (c) => c.difficulty === 'easy' || c.difficulty === 'medium'
    );
  } else if (difficulty === 4) {
    pool = ALL_CHALLENGE_CARDS.filter(
      (c) => c.difficulty === 'medium' || c.difficulty === 'hard'
    );
  } else {
    pool = [...ALL_CHALLENGE_CARDS];
  }

  // Shuffle and pick 3
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, 3);
}

/**
 * Checks if a challenge card's condition was met based on the game performance.
 *
 * For challenges that ideally need in-game tracking ('no_empty', 'first_deal',
 * 'all_revealed'), we use heuristics derived from the available performance data.
 */
export function checkChallengeComplete(
  card: ChallengeCard,
  performance: GamePerformance
): boolean {
  if (!performance.won) {
    return false;
  }

  switch (card.id) {
    case 'no_hints':
      return performance.usedHints === 0;

    case 'no_undo':
      return performance.usedUndos === 0;

    case 'speed_run':
      return performance.timeSeconds < 480; // 8 minutes

    case 'under_moves':
      return performance.moves < 120;

    case 'no_empty':
      // Heuristic: if the player used many moves relative to runs,
      // they likely kept columns full. A high moves-per-run ratio suggests
      // careful play without emptying columns aggressively.
      // Approximate: fewer than 15 moves per run suggests efficient play
      // that didn't rely on empty columns.
      return performance.moves <= performance.runsCompleted * 18;

    case 'streak_three':
      // Heuristic: sequenceStreaks >= 3 indicates the player completed
      // multiple runs in succession without dealing from stock.
      return performance.sequenceStreaks >= 3;

    case 'first_deal':
      // Heuristic: if the player completed at least 1 run and used
      // relatively few moves (suggesting early completion before much dealing),
      // we consider this met. A run completed in under 40 moves likely
      // happened before a second stock deal.
      return performance.runsCompleted >= 1 && performance.moves <= 40;

    case 'all_revealed':
      // Heuristic: if the player completed fewer than 5 runs and used
      // enough moves to have revealed all face-down cards (54 face-down
      // cards in standard spider), we approximate that all were revealed
      // early. More moves with fewer runs means more revealing before completing.
      return performance.runsCompleted >= 5 && performance.moves >= 80;

    default:
      return false;
  }
}

/** Fisher-Yates shuffle (returns a new array) */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
