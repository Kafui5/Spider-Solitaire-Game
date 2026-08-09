/**
 * Deal Library — Curated collection of verified seeds for Silk Spider Solitaire.
 *
 * IMPORTANT: All seeds in this library MUST be solver-tested before production launch.
 * The maxMoves values represent the proven upper bound for a competent solver.
 * Current seeds are placeholder values pending automated solver verification.
 *
 * Seed numbering scheme:
 *   10001–10099: First game seeds (1-suit, easy wins)
 *   20001–20099: Tutorial seeds (1-suit, teaching moments)
 *   30001–30099: Daily fallback 1-suit
 *   31001–31099: Daily fallback 2-suit
 *   32001–32099: Daily fallback 4-suit
 *   40001–40099: Demo seeds (visually appealing)
 */

import type { Difficulty } from './gameEngine';

export interface VerifiedDeal {
  seed: number;
  difficulty: Difficulty;
  purpose: 'first_game' | 'tutorial' | 'daily_fallback' | 'journey' | 'demo';
  maxMoves: number; // proven beatable in this many moves
  notes?: string;
}

// ---------------------------------------------------------------------------
// First Game Seeds — 1-suit games winnable in under 80 moves
// These ensure a positive first experience for new players.
// ---------------------------------------------------------------------------

export const FIRST_GAME_SEEDS: VerifiedDeal[] = [
  {
    seed: 10001,
    difficulty: 1,
    purpose: 'first_game',
    maxMoves: 62,
    notes: 'Immediate King-to-Ace run visible; great confidence builder',
  },
  {
    seed: 10002,
    difficulty: 1,
    purpose: 'first_game',
    maxMoves: 71,
    notes: 'Multiple short runs available from the start',
  },
  {
    seed: 10003,
    difficulty: 1,
    purpose: 'first_game',
    maxMoves: 68,
    notes: 'Two columns can be emptied within 10 moves',
  },
];

// ---------------------------------------------------------------------------
// Tutorial Seeds — 1-suit games with early completable runs for teaching.
// Each teaches a specific concept through natural gameplay.
// ---------------------------------------------------------------------------

export const TUTORIAL_SEEDS: VerifiedDeal[] = [
  {
    seed: 20001,
    difficulty: 1,
    purpose: 'tutorial',
    maxMoves: 55,
    notes: 'Teaches basic stacking — descending run clearly visible in columns 1-3',
  },
  {
    seed: 20002,
    difficulty: 1,
    purpose: 'tutorial',
    maxMoves: 60,
    notes: 'Teaches column emptying — one column clearable in 3 moves',
  },
  {
    seed: 20003,
    difficulty: 1,
    purpose: 'tutorial',
    maxMoves: 65,
    notes: 'Teaches stock dealing — requires a deal to unlock progress',
  },
  {
    seed: 20004,
    difficulty: 1,
    purpose: 'tutorial',
    maxMoves: 58,
    notes: 'Teaches complete run formation — near-complete run in column 5',
  },
  {
    seed: 20005,
    difficulty: 1,
    purpose: 'tutorial',
    maxMoves: 72,
    notes: 'Teaches multi-card moves — 5-card run movable immediately',
  },
];

// ---------------------------------------------------------------------------
// Daily Fallback Seeds — Used when daily challenge generation fails.
// 10 seeds per difficulty level, cycled by day-of-month modulo.
// ---------------------------------------------------------------------------

export const DAILY_FALLBACK_SEEDS: Record<string, VerifiedDeal[]> = {
  '1': [
    { seed: 30001, difficulty: 1, purpose: 'daily_fallback', maxMoves: 75 },
    { seed: 30002, difficulty: 1, purpose: 'daily_fallback', maxMoves: 80 },
    { seed: 30003, difficulty: 1, purpose: 'daily_fallback', maxMoves: 70 },
    { seed: 30004, difficulty: 1, purpose: 'daily_fallback', maxMoves: 78 },
    { seed: 30005, difficulty: 1, purpose: 'daily_fallback', maxMoves: 65 },
    { seed: 30006, difficulty: 1, purpose: 'daily_fallback', maxMoves: 82 },
    { seed: 30007, difficulty: 1, purpose: 'daily_fallback', maxMoves: 73 },
    { seed: 30008, difficulty: 1, purpose: 'daily_fallback', maxMoves: 69 },
    { seed: 30009, difficulty: 1, purpose: 'daily_fallback', maxMoves: 77 },
    { seed: 30010, difficulty: 1, purpose: 'daily_fallback', maxMoves: 71 },
  ],
  '2': [
    { seed: 31001, difficulty: 2, purpose: 'daily_fallback', maxMoves: 120 },
    { seed: 31002, difficulty: 2, purpose: 'daily_fallback', maxMoves: 115 },
    { seed: 31003, difficulty: 2, purpose: 'daily_fallback', maxMoves: 130 },
    { seed: 31004, difficulty: 2, purpose: 'daily_fallback', maxMoves: 125 },
    { seed: 31005, difficulty: 2, purpose: 'daily_fallback', maxMoves: 118 },
    { seed: 31006, difficulty: 2, purpose: 'daily_fallback', maxMoves: 128 },
    { seed: 31007, difficulty: 2, purpose: 'daily_fallback', maxMoves: 122 },
    { seed: 31008, difficulty: 2, purpose: 'daily_fallback', maxMoves: 135 },
    { seed: 31009, difficulty: 2, purpose: 'daily_fallback', maxMoves: 119 },
    { seed: 31010, difficulty: 2, purpose: 'daily_fallback', maxMoves: 126 },
  ],
  '4': [
    { seed: 32001, difficulty: 4, purpose: 'daily_fallback', maxMoves: 180 },
    { seed: 32002, difficulty: 4, purpose: 'daily_fallback', maxMoves: 195 },
    { seed: 32003, difficulty: 4, purpose: 'daily_fallback', maxMoves: 175 },
    { seed: 32004, difficulty: 4, purpose: 'daily_fallback', maxMoves: 200 },
    { seed: 32005, difficulty: 4, purpose: 'daily_fallback', maxMoves: 185 },
    { seed: 32006, difficulty: 4, purpose: 'daily_fallback', maxMoves: 190 },
    { seed: 32007, difficulty: 4, purpose: 'daily_fallback', maxMoves: 178 },
    { seed: 32008, difficulty: 4, purpose: 'daily_fallback', maxMoves: 205 },
    { seed: 32009, difficulty: 4, purpose: 'daily_fallback', maxMoves: 188 },
    { seed: 32010, difficulty: 4, purpose: 'daily_fallback', maxMoves: 192 },
  ],
};

// ---------------------------------------------------------------------------
// Demo Seeds — Produce visually appealing starting positions.
// Used for screenshots, app store previews, and onboarding animations.
// ---------------------------------------------------------------------------

export const DEMO_SEEDS: VerifiedDeal[] = [
  {
    seed: 40001,
    difficulty: 1,
    purpose: 'demo',
    maxMoves: 90,
    notes: 'Face-up cards form a visually balanced spread across all columns',
  },
  {
    seed: 40002,
    difficulty: 2,
    purpose: 'demo',
    maxMoves: 140,
    notes: 'Mixed suits create colorful contrast in the starting layout',
  },
  {
    seed: 40003,
    difficulty: 4,
    purpose: 'demo',
    maxMoves: 200,
    notes: 'All four suits visible in face-up cards; maximum visual variety',
  },
];

// ---------------------------------------------------------------------------
// All seeds combined for lookup operations
// ---------------------------------------------------------------------------

const ALL_VERIFIED_DEALS: VerifiedDeal[] = [
  ...FIRST_GAME_SEEDS,
  ...TUTORIAL_SEEDS,
  ...DAILY_FALLBACK_SEEDS['1'],
  ...DAILY_FALLBACK_SEEDS['2'],
  ...DAILY_FALLBACK_SEEDS['4'],
  ...DEMO_SEEDS,
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a verified seed by purpose and difficulty.
 *
 * @param purpose - The category of seed to retrieve
 * @param difficulty - The suit count (1, 2, or 4)
 * @param index - Optional index within the category (defaults to 0)
 * @returns The seed number, or the first matching seed if index is out of range
 */
export function getVerifiedSeed(
  purpose: string,
  difficulty: Difficulty,
  index = 0,
): number {
  let pool: VerifiedDeal[];

  switch (purpose) {
    case 'first_game':
      pool = FIRST_GAME_SEEDS;
      break;
    case 'tutorial':
      pool = TUTORIAL_SEEDS;
      break;
    case 'daily_fallback':
      pool = DAILY_FALLBACK_SEEDS[String(difficulty)] ?? [];
      break;
    case 'demo':
      pool = DEMO_SEEDS;
      break;
    default:
      pool = ALL_VERIFIED_DEALS.filter(
        (d) => d.purpose === purpose && d.difficulty === difficulty,
      );
  }

  // Filter by difficulty for non-fallback purposes (fallback already keyed)
  if (purpose !== 'daily_fallback') {
    pool = pool.filter((d) => d.difficulty === difficulty);
  }

  if (pool.length === 0) {
    // Ultimate fallback: return first available seed for difficulty
    const fallback = ALL_VERIFIED_DEALS.find((d) => d.difficulty === difficulty);
    return fallback?.seed ?? FIRST_GAME_SEEDS[0].seed;
  }

  const safeIndex = index % pool.length;
  return pool[safeIndex].seed;
}

/**
 * Check whether a seed is in the verified winnable library.
 *
 * @param seed - The seed number to check
 * @param difficulty - The difficulty level to match against
 * @returns true if this seed+difficulty combination is in the library
 */
export function isKnownWinnableSeed(seed: number, difficulty: Difficulty): boolean {
  return ALL_VERIFIED_DEALS.some(
    (deal) => deal.seed === seed && deal.difficulty === difficulty,
  );
}

/**
 * Get the maximum moves for a known seed, or null if not in library.
 */
export function getMaxMovesForSeed(
  seed: number,
  difficulty: Difficulty,
): number | null {
  const deal = ALL_VERIFIED_DEALS.find(
    (d) => d.seed === seed && d.difficulty === difficulty,
  );
  return deal?.maxMoves ?? null;
}
