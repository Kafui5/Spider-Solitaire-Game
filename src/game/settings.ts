import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@silk-spider/settings-v1';

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  cardSize: 'small' | 'medium' | 'large';
  leftHandedMode: boolean;
  autoCompleteEnabled: boolean;
  colorBlindMode: boolean;
  showWisdomTips: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  cardSize: 'medium',
  leftHandedMode: false,
  autoCompleteEnabled: true,
  colorBlindMode: false,
  showWisdomTips: true,
};

/**
 * Load settings from AsyncStorage.
 * Returns DEFAULT_SETTINGS if nothing is stored or data is corrupt.
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(value) as Partial<AppSettings>;

    // Merge with defaults to handle new settings added in future versions
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Persist settings to AsyncStorage.
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Immutable update helper — returns a new settings object with the specified key changed.
 */
export function updateSetting<K extends keyof AppSettings>(
  settings: AppSettings,
  key: K,
  value: AppSettings[K],
): AppSettings {
  return { ...settings, [key]: value };
}
