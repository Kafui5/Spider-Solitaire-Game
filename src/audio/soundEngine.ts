import { Audio, AVPlaybackSource } from 'expo-av';
import { Platform } from 'react-native';

export type SoundId =
  | 'card_pickup'
  | 'card_drop'
  | 'card_error'
  | 'run_complete'
  | 'stock_deal'
  | 'win_celebration';

interface SoundEngineState {
  enabled: boolean;
  volume: number; // 0-1
  loaded: boolean;
}

/**
 * Sound asset mapping.
 * When real sound files are added to assets/sounds/, uncomment the require() lines.
 * The engine will automatically pick them up — no other changes needed.
 */
const SOUND_SOURCES: Record<SoundId, AVPlaybackSource | null> = {
  // card_pickup: require('../../assets/sounds/card_pickup.wav'),
  // card_drop: require('../../assets/sounds/card_drop.wav'),
  // card_error: require('../../assets/sounds/card_error.wav'),
  // run_complete: require('../../assets/sounds/run_complete.wav'),
  // stock_deal: require('../../assets/sounds/stock_deal.wav'),
  // win_celebration: require('../../assets/sounds/win_celebration.wav'),
  card_pickup: null,
  card_drop: null,
  card_error: null,
  run_complete: null,
  stock_deal: null,
  win_celebration: null,
};

const state: SoundEngineState = {
  enabled: true,
  volume: 0.7,
  loaded: false,
};

/** Cache of loaded Sound objects to avoid re-loading on every play */
const loadedSounds: Map<SoundId, Audio.Sound> = new Map();

/**
 * Initialize the sound engine.
 * Sets audio mode for background compatibility and marks engine as ready.
 */
export async function initSoundEngine(): Promise<void> {
  if (Platform.OS === 'web') {
    state.loaded = true;
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    state.loaded = true;
  } catch {
    // Audio init can fail in some environments (e.g. simulator without audio)
    // Engine remains functional but sounds won't play
    state.loaded = true;
  }
}

/**
 * Enable or disable all sound effects.
 */
export function setSoundEnabled(enabled: boolean): void {
  state.enabled = enabled;
}

/**
 * Set master volume for sound effects.
 * @param volume - Value between 0 (silent) and 1 (full volume)
 */
export function setSoundVolume(volume: number): void {
  state.volume = Math.max(0, Math.min(1, volume));
}

/**
 * Check if sound effects are currently enabled.
 */
export function isSoundEnabled(): boolean {
  return state.enabled;
}

/**
 * Play a sound effect by ID.
 * Silently skips if:
 * - Sound is disabled
 * - Engine isn't loaded
 * - No asset source is configured for the given sound ID
 * - Platform is web (web audio not supported via expo-av in this context)
 */
export async function playSound(soundId: SoundId): Promise<void> {
  if (!state.enabled || !state.loaded) return;
  if (Platform.OS === 'web') return;

  const source = SOUND_SOURCES[soundId];
  if (!source) return; // No asset loaded yet — stub mode, silently skip

  try {
    // Check if we have a cached sound object
    let sound = loadedSounds.get(soundId);

    if (sound) {
      // Rewind and replay
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(state.volume);
      await sound.playAsync();
    } else {
      // Load and play for the first time
      const { sound: newSound } = await Audio.Sound.createAsync(source, {
        volume: state.volume,
        shouldPlay: true,
      });
      loadedSounds.set(soundId, newSound);
    }
  } catch {
    // Swallow playback errors — sound is non-critical
  }
}

/**
 * Unload all cached sounds and free resources.
 * Call this when the app is backgrounded or unmounting.
 */
export async function cleanup(): Promise<void> {
  const unloadPromises: Promise<void>[] = [];

  for (const [, sound] of loadedSounds) {
    unloadPromises.push(
      sound.unloadAsync().catch(() => undefined) as Promise<void>
    );
  }

  await Promise.all(unloadPromises);
  loadedSounds.clear();
  state.loaded = false;
}
