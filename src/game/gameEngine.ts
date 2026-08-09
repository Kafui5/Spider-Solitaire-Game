export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Difficulty = 1 | 2 | 4;

export interface Card {
  id: string;
  rank: number;
  suit: Suit;
  faceUp: boolean;
}

export interface GameState {
  version: 1;
  difficulty: Difficulty;
  columns: Card[][];
  stock: Card[];
  completed: number;
  moves: number;
  status: 'playing' | 'won';
  startedAt: number;
}

export interface MoveSelection {
  column: number;
  cardIndex: number;
}

export interface Hint extends MoveSelection {
  destination: number;
}

const ALL_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const random = seededRandom(seed);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
}

function buildDeck(difficulty: Difficulty): Card[] {
  const suits = ALL_SUITS.slice(0, difficulty);
  const copiesPerSuit = 8 / difficulty;
  const cards: Card[] = [];

  for (const suit of suits) {
    for (let copy = 0; copy < copiesPerSuit; copy += 1) {
      for (let rank = 1; rank <= 13; rank += 1) {
        cards.push({
          id: `${suit}-${copy}-${rank}`,
          rank,
          suit,
          faceUp: false,
        });
      }
    }
  }
  return cards;
}

export function createGame(
  difficulty: Difficulty,
  seed = Date.now(),
): GameState {
  const deck = shuffle(buildDeck(difficulty), seed);
  const columns: Card[][] = Array.from({ length: 10 }, () => []);
  let cursor = 0;

  for (let round = 0; round < 6; round += 1) {
    for (let column = 0; column < 10; column += 1) {
      if (round === 5 && column >= 4) continue;
      const isLastTableauCard = round === (column < 4 ? 5 : 4);
      columns[column].push({
        ...deck[cursor],
        faceUp: isLastTableauCard,
      });
      cursor += 1;
    }
  }

  return {
    version: 1,
    difficulty,
    columns,
    stock: deck.slice(cursor),
    completed: 0,
    moves: 0,
    status: 'playing',
    startedAt: Date.now(),
  };
}

export function cloneGame(state: GameState): GameState {
  return {
    ...state,
    columns: state.columns.map((column) => column.map((card) => ({ ...card }))),
    stock: state.stock.map((card) => ({ ...card })),
  };
}

export function isMovableRun(column: Card[], cardIndex: number): boolean {
  if (cardIndex < 0 || cardIndex >= column.length || !column[cardIndex].faceUp) {
    return false;
  }

  for (let index = cardIndex; index < column.length - 1; index += 1) {
    const current = column[index];
    const next = column[index + 1];
    if (!next.faceUp || current.suit !== next.suit || current.rank !== next.rank + 1) {
      return false;
    }
  }
  return true;
}

export function canMove(
  state: GameState,
  fromColumn: number,
  cardIndex: number,
  destination: number,
): boolean {
  if (
    state.status !== 'playing' ||
    fromColumn === destination ||
    fromColumn < 0 ||
    fromColumn >= 10 ||
    destination < 0 ||
    destination >= 10
  ) {
    return false;
  }

  const source = state.columns[fromColumn];
  const target = state.columns[destination];
  if (!isMovableRun(source, cardIndex)) return false;
  if (target.length === 0) return true;

  return target[target.length - 1].rank === source[cardIndex].rank + 1;
}

function revealTop(column: Card[]): void {
  const top = column[column.length - 1];
  if (top && !top.faceUp) top.faceUp = true;
}

function hasCompleteRun(column: Card[]): boolean {
  if (column.length < 13) return false;
  const start = column.length - 13;
  const suit = column[start].suit;
  for (let offset = 0; offset < 13; offset += 1) {
    const card = column[start + offset];
    if (!card.faceUp || card.suit !== suit || card.rank !== 13 - offset) {
      return false;
    }
  }
  return true;
}

function collectCompletedRuns(state: GameState): void {
  for (const column of state.columns) {
    while (hasCompleteRun(column)) {
      column.splice(column.length - 13, 13);
      state.completed += 1;
      revealTop(column);
    }
  }
  if (state.completed === 8) state.status = 'won';
}

export function moveCards(
  state: GameState,
  fromColumn: number,
  cardIndex: number,
  destination: number,
): GameState | null {
  if (!canMove(state, fromColumn, cardIndex, destination)) return null;

  const next = cloneGame(state);
  const movingCards = next.columns[fromColumn].splice(cardIndex);
  next.columns[destination].push(...movingCards);
  revealTop(next.columns[fromColumn]);
  next.moves += 1;
  collectCompletedRuns(next);
  return next;
}

export function canDeal(state: GameState): boolean {
  return (
    state.status === 'playing' &&
    state.stock.length >= 10 &&
    state.columns.every((column) => column.length > 0)
  );
}

export function dealStock(state: GameState): GameState | null {
  if (!canDeal(state)) return null;
  const next = cloneGame(state);
  const deal = next.stock.splice(0, 10);
  for (let column = 0; column < 10; column += 1) {
    next.columns[column].push({ ...deal[column], faceUp: true });
  }
  next.moves += 1;
  collectCompletedRuns(next);
  return next;
}

export function findHint(state: GameState): Hint | null {
  const candidates: Hint[] = [];

  for (let from = 0; from < state.columns.length; from += 1) {
    const column = state.columns[from];
    for (let cardIndex = 0; cardIndex < column.length; cardIndex += 1) {
      if (!isMovableRun(column, cardIndex)) continue;
      for (let destination = 0; destination < state.columns.length; destination += 1) {
        if (canMove(state, from, cardIndex, destination)) {
          candidates.push({ column: from, cardIndex, destination });
        }
      }
    }
  }

  candidates.sort((left, right) => {
    const leftCard = state.columns[left.column][left.cardIndex];
    const rightCard = state.columns[right.column][right.cardIndex];
    const leftTarget = state.columns[left.destination].at(-1);
    const rightTarget = state.columns[right.destination].at(-1);
    const leftScore =
      (leftTarget?.suit === leftCard.suit ? 4 : 0) +
      (left.cardIndex > 0 && !state.columns[left.column][left.cardIndex - 1].faceUp ? 3 : 0) +
      (leftTarget ? 1 : 0);
    const rightScore =
      (rightTarget?.suit === rightCard.suit ? 4 : 0) +
      (right.cardIndex > 0 && !state.columns[right.column][right.cardIndex - 1].faceUp ? 3 : 0) +
      (rightTarget ? 1 : 0);
    return rightScore - leftScore;
  });

  return candidates[0] ?? null;
}

export function rankLabel(rank: number): string {
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return String(rank);
}

export function suitSymbol(suit: Suit): string {
  return { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }[suit];
}
