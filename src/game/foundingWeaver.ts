import AsyncStorage from '@react-native-async-storage/async-storage';

const FOUNDING_STORAGE_KEY = '@silk-spider/founding-v1';

/** Exclusive card back identifier for Founding Weavers — cannot be purchased. */
export const FOUNDING_WEAVER_CARD_BACK = 'founding_weaver';

/** Exclusive badge identifier for Founding Weavers — cannot be purchased. */
export const FOUNDING_WEAVER_BADGE = 'badge:founding_weaver';

export interface FoundingWeaverConfig {
  isFoundingWeaver: boolean;
  joinedAt: number | null;
  exclusiveCardBack: string;
  exclusiveBadge: string;
}

/**
 * Create the default Founding Weaver configuration for new players.
 */
export function createDefaultFoundingConfig(): FoundingWeaverConfig {
  return {
    isFoundingWeaver: false,
    joinedAt: null,
    exclusiveCardBack: FOUNDING_WEAVER_CARD_BACK,
    exclusiveBadge: FOUNDING_WEAVER_BADGE,
  };
}

/**
 * Activate Founding Weaver status for a player.
 * Grants the exclusive card back and badge.
 */
export function activateFoundingWeaver(config: FoundingWeaverConfig): FoundingWeaverConfig {
  return {
    ...config,
    isFoundingWeaver: true,
    joinedAt: Date.now(),
    exclusiveCardBack: FOUNDING_WEAVER_CARD_BACK,
    exclusiveBadge: FOUNDING_WEAVER_BADGE,
  };
}

/**
 * Load the Founding Weaver configuration from AsyncStorage.
 * Returns default config if nothing is stored.
 */
export async function loadFoundingConfig(): Promise<FoundingWeaverConfig> {
  try {
    const raw = await AsyncStorage.getItem(FOUNDING_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as FoundingWeaverConfig;
    }
  } catch {
    // If loading fails, return default config
  }
  return createDefaultFoundingConfig();
}

/**
 * Save the Founding Weaver configuration to AsyncStorage.
 */
export async function saveFoundingConfig(config: FoundingWeaverConfig): Promise<void> {
  await AsyncStorage.setItem(FOUNDING_STORAGE_KEY, JSON.stringify(config));
}
