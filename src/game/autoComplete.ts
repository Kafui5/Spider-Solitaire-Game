import { canMove, moveCards, cloneGame, type GameState } from './gameEngine';

export interface AutoCompleteMove {
  fromColumn: number;
  cardIndex: number;
  toColumn: number;
}

/**
 * Returns true when all cards are face-up, the stock is empty,
 * and the game is still in progress.
 */
export function canAutoComplete(state: GameState): boolean {
  if (state.status !== 'playing') return false;
  if (state.stock.length > 0) return false;

  for (const column of state.columns) {
    for (const card of column) {
      if (!card.faceUp) return false;
    }
  }

  return true;
}

/**
 * Alias for canAutoComplete — if all cards are face-up and stock is empty,
 * the player has earned the auto-complete offer.
 */
export function shouldOfferAutoComplete(state: GameState): boolean {
  return canAutoComplete(state);
}

/**
 * Computes a sequence of moves that will complete all remaining runs.
 * Strategy: repeatedly find valid moves that extend same-suit descending
 * sequences, execute them on a clone, and record them until all 8 runs
 * are completed or no further progress can be made.
 */
export function getAutoCompleteMoves(state: GameState): AutoCompleteMove[] {
  if (!canAutoComplete(state)) return [];

  const moves: AutoCompleteMove[] = [];
  let current = cloneGame(state);
  let maxIterations = 1000;

  while (current.status === 'playing' && maxIterations > 0) {
    maxIterations -= 1;
    const move = findBestConsolidationMove(current);

    if (move === null) {
      // Try moving cards to empty columns to unblock
      const emptyMove = findEmptyColumnMove(current);
      if (emptyMove === null) break;

      const next = moveCards(current, emptyMove.fromColumn, emptyMove.cardIndex, emptyMove.toColumn);
      if (next === null) break;

      moves.push(emptyMove);
      current = next;
      continue;
    }

    const next = moveCards(current, move.fromColumn, move.cardIndex, move.toColumn);
    if (next === null) break;

    moves.push(move);
    current = next;
  }

  return moves;
}

/**
 * Finds the best move that consolidates same-suit cards into longer
 * descending sequences. Prioritizes moves that:
 * 1. Match the suit of the destination card (extends a same-suit run)
 * 2. Move larger groups of cards
 */
function findBestConsolidationMove(state: GameState): AutoCompleteMove | null {
  let bestMove: AutoCompleteMove | null = null;
  let bestScore = -1;

  for (let fromCol = 0; fromCol < state.columns.length; fromCol += 1) {
    const column = state.columns[fromCol];
    if (column.length === 0) continue;

    for (let cardIndex = 0; cardIndex < column.length; cardIndex += 1) {
      const card = column[cardIndex];
      if (!card.faceUp) continue;

      // Check if this starts a valid same-suit run to the bottom
      let isValidRun = true;
      for (let i = cardIndex; i < column.length - 1; i += 1) {
        if (
          column[i].suit !== column[i + 1].suit ||
          column[i].rank !== column[i + 1].rank + 1
        ) {
          isValidRun = false;
          break;
        }
      }
      if (!isValidRun) continue;

      for (let toCol = 0; toCol < state.columns.length; toCol += 1) {
        if (!canMove(state, fromCol, cardIndex, toCol)) continue;

        const target = state.columns[toCol];
        if (target.length === 0) continue; // Skip empty columns for consolidation

        const topOfTarget = target[target.length - 1];
        const movingCard = column[cardIndex];

        // Score: heavily prefer same-suit connections
        let score = 0;
        if (topOfTarget.suit === movingCard.suit) {
          score += 100;
          // Bonus for longer resulting same-suit run at destination
          let runLength = 1;
          for (let i = target.length - 1; i > 0; i -= 1) {
            if (
              target[i].suit === target[i - 1].suit &&
              target[i].rank === target[i - 1].rank - 1
            ) {
              runLength += 1;
            } else {
              break;
            }
          }
          score += runLength * 10;
        }

        // Bonus for moving more cards (bigger group)
        score += (column.length - cardIndex) * 2;

        // Bonus for emptying a column
        if (cardIndex === 0) score += 50;

        if (score > bestScore) {
          bestScore = score;
          bestMove = { fromColumn: fromCol, cardIndex, toColumn: toCol };
        }
      }
    }
  }

  // Only return same-suit moves to avoid creating mixed sequences
  if (bestScore < 100) return null;

  return bestMove;
}

/**
 * When no same-suit consolidation move exists, try to move a card group
 * to an empty column to free up space and unblock other moves.
 */
function findEmptyColumnMove(state: GameState): AutoCompleteMove | null {
  const emptyCol = state.columns.findIndex((col) => col.length === 0);
  if (emptyCol === -1) return null;

  // Find a column with mixed suits at the break point and move the bottom segment
  let bestMove: AutoCompleteMove | null = null;
  let bestSize = 0;

  for (let fromCol = 0; fromCol < state.columns.length; fromCol += 1) {
    const column = state.columns[fromCol];
    if (column.length <= 1) continue;

    // Find the topmost break in suit-sequence from the bottom
    let breakIndex = column.length - 1;
    for (let i = column.length - 1; i > 0; i -= 1) {
      if (
        column[i].suit !== column[i - 1].suit ||
        column[i].rank !== column[i - 1].rank - 1
      ) {
        breakIndex = i;
        break;
      }
    }

    // Move the segment below the break to an empty column
    if (breakIndex > 0 && canMove(state, fromCol, breakIndex, emptyCol)) {
      const size = column.length - breakIndex;
      if (size > bestSize) {
        bestSize = size;
        bestMove = { fromColumn: fromCol, cardIndex: breakIndex, toColumn: emptyCol };
      }
    }
  }

  return bestMove;
}
