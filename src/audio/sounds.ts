import type { SoundId } from './soundEngine';

export type GameEvent =
  | 'card_selected'
  | 'card_moved'
  | 'illegal_move'
  | 'run_completed'
  | 'stock_dealt'
  | 'game_won'
  | 'undo'
  | 'hint_shown';

/**
 * Maps a game event to the appropriate sound effect.
 * Returns null for events that have no associated sound.
 */
const EVENT_SOUND_MAP: Record<GameEvent, SoundId | null> = {
  card_selected: 'card_pickup',
  card_moved: 'card_drop',
  illegal_move: 'card_error',
  run_completed: 'run_complete',
  stock_dealt: 'stock_deal',
  game_won: 'win_celebration',
  undo: 'card_pickup',
  hint_shown: null,
};

export function getSoundForEvent(event: GameEvent): SoundId | null {
  return EVENT_SOUND_MAP[event];
}
