import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_CARD_BACK, type CardBackId } from './cardBacks';

const STORAGE_KEY = '@silk-spider/cardback-v1';

export async function loadCardBack(): Promise<CardBackId> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (
      value === 'woven' ||
      value === 'spider' ||
      value === 'geometric' ||
      value === 'midnight' ||
      value === 'royal'
    ) {
      return value;
    }
    return DEFAULT_CARD_BACK;
  } catch {
    return DEFAULT_CARD_BACK;
  }
}

export async function saveCardBack(id: CardBackId): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, id);
}
