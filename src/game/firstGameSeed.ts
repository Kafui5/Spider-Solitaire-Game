/**
 * A curated seed that produces a 1-suit game winnable in under 80 moves.
 * Used only for the player's very first game to ensure a positive first experience.
 * Tested manually to confirm winnability.
 */
export const FIRST_GAME_SEED = 42_7891;

/**
 * Check if this is the player's first ever game.
 * Uses a simple flag in the game performance tracking.
 *
 * @param gamesPlayed - Total number of games the player has started.
 * @returns The first game seed if gamesPlayed is 0, otherwise undefined.
 */
export function getFirstGameSeed(gamesPlayed: number): number | undefined {
  if (gamesPlayed === 0) return FIRST_GAME_SEED;
  return undefined;
}
