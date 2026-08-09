import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canDeal,
  createGame,
  dealStock,
  isMovableRun,
  moveCards,
  type Card,
  type GameState,
} from './gameEngine.ts';

function card(rank: number, suit: Card['suit'] = 'spades', faceUp = true): Card {
  return { id: `${suit}-${rank}-${Math.random()}`, rank, suit, faceUp };
}

function stateWith(columns: Card[][]): GameState {
  return {
    version: 1,
    difficulty: 1,
    columns: [...columns, ...Array.from({ length: 10 - columns.length }, () => [card(6)])],
    stock: Array.from({ length: 50 }, (_, index) => card((index % 13) + 1)),
    completed: 0,
    moves: 0,
    status: 'playing',
    startedAt: 0,
  };
}

test('creates the standard 54-card tableau and 50-card stock', () => {
  const game = createGame(4, 1234);
  assert.equal(game.columns.reduce((sum, column) => sum + column.length, 0), 54);
  assert.deepEqual(game.columns.map((column) => column.length), [6, 6, 6, 6, 5, 5, 5, 5, 5, 5]);
  assert.equal(game.stock.length, 50);
  assert.ok(game.columns.every((column) => column.at(-1)?.faceUp));
});

test('only same-suit descending groups move together', () => {
  assert.equal(isMovableRun([card(8), card(7), card(6)], 0), true);
  assert.equal(isMovableRun([card(8), card(7, 'hearts'), card(6, 'hearts')], 0), false);
});

test('moves a valid sequence and reveals the source card', () => {
  const game = stateWith([
    [card(10, 'clubs', false), card(8), card(7)],
    [card(9, 'hearts')],
  ]);
  const moved = moveCards(game, 0, 1, 1);
  assert.ok(moved);
  assert.equal(moved.columns[0][0].faceUp, true);
  assert.deepEqual(moved.columns[1].map((item) => item.rank), [9, 8, 7]);
  assert.equal(moved.moves, 1);
});

test('rejects dealing while any tableau column is empty', () => {
  const game = stateWith([[], [card(8)]]);
  assert.equal(canDeal(game), false);
  assert.equal(dealStock(game), null);
});

test('collects a complete king-to-ace same-suit run', () => {
  const run = Array.from({ length: 12 }, (_, index) => card(12 - index));
  const game = stateWith([run, [card(13)]]);
  const moved = moveCards(game, 0, 0, 1);
  assert.ok(moved);
  assert.equal(moved.completed, 1);
  assert.equal(moved.columns[1].length, 0);
});
