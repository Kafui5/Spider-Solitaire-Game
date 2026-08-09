import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GameState } from './game/gameEngine';

const STORAGE_KEY = '@silk-spider/game-v1';

export async function loadSavedGame(): Promise<GameState | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return null;

  try {
    const state = JSON.parse(value) as GameState;
    if (
      state.version !== 1 ||
      !Array.isArray(state.columns) ||
      state.columns.length !== 10 ||
      !Array.isArray(state.stock)
    ) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export async function saveGame(state: GameState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
