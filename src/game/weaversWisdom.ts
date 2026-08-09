import { type Card, type GameState, rankLabel, suitSymbol } from './gameEngine';

export interface WisdomTip {
  message: string;
  category: 'sequence' | 'reveal' | 'empty' | 'planning' | 'stock';
}

/**
 * Analyze a move and return a context-sensitive tip explaining why it's beneficial.
 */
export function getWisdomForMove(
  state: GameState,
  fromColumn: number,
  cardIndex: number,
  toColumn: number,
): WisdomTip | null {
  const sourceColumn = state.columns[fromColumn];
  const targetColumn = state.columns[toColumn];

  if (!sourceColumn || cardIndex < 0 || cardIndex >= sourceColumn.length) {
    return null;
  }

  const movingCard = sourceColumn[cardIndex];
  const cardLabel = `${rankLabel(movingCard.rank)}${suitSymbol(movingCard.suit)}`;

  // Check if moving to an empty column
  if (targetColumn.length === 0) {
    return {
      message: `Placing ${cardLabel} in an empty column gives you a workspace — useful for reorganizing.`,
      category: 'empty',
    };
  }

  const targetCard = targetColumn[targetColumn.length - 1];
  const targetLabel = `${rankLabel(targetCard.rank)}${suitSymbol(targetCard.suit)}`;

  // Check if same-suit placement
  if (movingCard.suit === targetCard.suit && targetCard.rank === movingCard.rank + 1) {
    // Check if this builds toward a complete run (King-to-Ace)
    const sameSuitRunLength = countSameSuitRun(targetColumn, movingCard.suit) + countCardsBeingMoved(sourceColumn, cardIndex);
    if (sameSuitRunLength >= 8) {
      const cardsToGo = 13 - sameSuitRunLength;
      return {
        message: `This extends a run toward King-to-Ace — ${cardsToGo} cards to go.`,
        category: 'planning',
      };
    }

    return {
      message: `Moving ${cardLabel} onto ${targetLabel} builds a same-suit sequence — these move together later.`,
      category: 'sequence',
    };
  }

  // Check if reveals a face-down card
  if (cardIndex > 0 && !sourceColumn[cardIndex - 1].faceUp) {
    return {
      message: `This reveals a hidden card in column ${fromColumn + 1} — information is power.`,
      category: 'reveal',
    };
  }

  // Check if moving all cards from a column (frees it for dealing)
  if (cardIndex === 0 && state.stock.length > 0) {
    return {
      message: `Moving cards out of this column makes room for the next stock deal.`,
      category: 'stock',
    };
  }

  return null;
}

/**
 * Count consecutive same-suit cards from the bottom of a column going up.
 */
function countSameSuitRun(column: Card[], suit: string): number {
  let count = 0;
  for (let i = column.length - 1; i >= 0; i--) {
    if (column[i].suit === suit && column[i].faceUp) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Count cards being moved (from cardIndex to end of column).
 */
function countCardsBeingMoved(column: Card[], cardIndex: number): number {
  return column.length - cardIndex;
}

/**
 * Provide a general tip based on the current game state.
 */
export function getGeneralWisdom(state: GameState): WisdomTip {
  // Count face-down cards
  let faceDownCount = 0;
  let longestSameSuitRun = 0;

  for (const column of state.columns) {
    let currentRun = 0;
    for (let i = column.length - 1; i >= 0; i--) {
      if (!column[i].faceUp) {
        faceDownCount++;
      } else if (i < column.length - 1 && column[i].suit === column[i + 1].suit && column[i].rank === column[i + 1].rank + 1) {
        currentRun++;
      } else {
        currentRun = 1;
      }
      longestSameSuitRun = Math.max(longestSameSuitRun, currentRun);
    }
  }

  // Check if close to completing a run
  if (longestSameSuitRun >= 10) {
    return {
      message: "You're close to completing a full run! Prioritize same-suit sequences.",
      category: 'planning',
    };
  }

  // Check if no empty columns
  const hasEmptyColumn = state.columns.some((col) => col.length === 0);
  if (!hasEmptyColumn) {
    return {
      message: 'Try to create an empty column — it acts as a temporary workspace for rearranging.',
      category: 'empty',
    };
  }

  // Check if stock is low
  if (state.stock.length > 0 && state.stock.length <= 20) {
    return {
      message: 'Stock deals are limited — plan carefully before using them.',
      category: 'stock',
    };
  }

  // Default: many face-down cards
  if (faceDownCount > 10) {
    return {
      message: 'Focus on uncovering face-down cards — each revealed card opens new possibilities.',
      category: 'reveal',
    };
  }

  // Fallback
  return {
    message: 'Focus on uncovering face-down cards — each revealed card opens new possibilities.',
    category: 'reveal',
  };
}

/**
 * Pool of general strategy tips.
 */
const WISDOM_POOL: WisdomTip[] = [
  { message: 'Same-suit sequences are king — they move as a unit and unlock flexibility.', category: 'sequence' },
  { message: 'An empty column is your best tool — protect it until you need it.', category: 'empty' },
  { message: 'Revealing face-down cards should be your top priority early on.', category: 'reveal' },
  { message: 'Avoid dealing from stock until you have no other productive moves.', category: 'stock' },
  { message: 'Plan two moves ahead — where will the card you uncover go?', category: 'planning' },
  { message: 'Mixed-suit stacks block progress — try to sort by suit when possible.', category: 'sequence' },
  { message: 'Kings can only go in empty columns — don\'t fill empties without a plan.', category: 'empty' },
  { message: 'A complete run (King to Ace, same suit) clears automatically — build toward it.', category: 'planning' },
  { message: 'Short columns are easier to empty — target them for creating workspace.', category: 'empty' },
  { message: 'Before dealing stock, make sure every column has at least one card.', category: 'stock' },
  { message: 'Moving a long same-suit sequence frees multiple cards at once.', category: 'sequence' },
  { message: 'Sometimes a "bad" move reveals a critical card — weigh the trade-off.', category: 'reveal' },
];

/**
 * Returns a random general strategy tip from the pool.
 */
export function getRandomWisdom(): WisdomTip {
  const index = Math.floor(Math.random() * WISDOM_POOL.length);
  return WISDOM_POOL[index];
}
