/**
 * Hardened Save System for Silk Spider Solitaire.
 *
 * Features:
 * - Versioned save envelopes with schema migration support
 * - Dual-write (primary + backup) for crash recovery
 * - Checksum validation to detect corruption
 * - Graceful fallback chain: primary → backup → v1 migration → null
 * - Complete reset capability for all app storage keys
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GameState } from './gameEngine';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Current save format version */
export const SAVE_VERSION = 2;

/** Primary storage key */
const PRIMARY_KEY = '@silk-spider/game-v2';

/** Backup storage key (written after primary succeeds) */
const BACKUP_KEY = '@silk-spider/game-v2-backup';

/** Legacy v1 storage key (for migration) */
const LEGACY_V1_KEY = '@silk-spider/game-v1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SaveEnvelope {
  version: number; // schema version for migrations
  savedAt: number; // timestamp ms
  checksum: string; // simple hash to detect corruption
  data: GameState;
}

// ---------------------------------------------------------------------------
// All known storage keys used by the app
// ---------------------------------------------------------------------------

/**
 * Returns every AsyncStorage key the app may have written.
 * Used by resetAllProgress and debugging tools.
 */
export function getKnownStorageKeys(): string[] {
  return [
    PRIMARY_KEY,
    BACKUP_KEY,
    LEGACY_V1_KEY,
    '@silk-spider/statistics',
    '@silk-spider/daily-challenge',
    '@silk-spider/achievements',
    '@silk-spider/rewards',
    '@silk-spider/rewards-storage',
    '@silk-spider/mastery',
    '@silk-spider/journey',
    '@silk-spider/settings',
    '@silk-spider/card-back',
    '@silk-spider/loom-gallery',
    '@silk-spider/web-patterns',
    '@silk-spider/challenge-cards',
    '@silk-spider/premium',
    '@silk-spider/founding-weaver',
    '@silk-spider/review-prompt',
    '@silk-spider/unlockables',
    '@silk-spider/onboarding',
  ];
}

// ---------------------------------------------------------------------------
// Checksum
// ---------------------------------------------------------------------------

/**
 * Compute a simple non-cryptographic checksum of the game state.
 *
 * This is NOT a security measure — it detects accidental corruption
 * (partial writes, storage glitches) rather than intentional tampering.
 *
 * The checksum is a base-36 hash of key state properties concatenated.
 */
export function computeChecksum(state: GameState): string {
  const parts = [
    String(state.moves),
    String(state.completed),
    String(state.difficulty),
    String(state.columns.length),
    String(state.stock.length),
    state.status,
    String(state.startedAt),
  ];

  const raw = parts.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // bitwise OR coerces to 32-bit int
  }

  return Math.abs(hash).toString(36);
}

// ---------------------------------------------------------------------------
// Envelope creation
// ---------------------------------------------------------------------------

/**
 * Wraps a GameState in a SaveEnvelope with version, timestamp, and checksum.
 */
export function createSaveEnvelope(state: GameState): SaveEnvelope {
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    checksum: computeChecksum(state),
    data: state,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a save envelope for structural integrity.
 *
 * Checks:
 * 1. Version matches current SAVE_VERSION
 * 2. Checksum matches recomputed value
 * 3. Required fields are present and well-typed
 */
export function validateSave(envelope: SaveEnvelope): boolean {
  if (!envelope || typeof envelope !== 'object') return false;
  if (envelope.version !== SAVE_VERSION) return false;
  if (typeof envelope.savedAt !== 'number' || envelope.savedAt <= 0) return false;
  if (typeof envelope.checksum !== 'string' || envelope.checksum.length === 0) return false;

  const { data } = envelope;
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.columns) || data.columns.length !== 10) return false;
  if (!Array.isArray(data.stock)) return false;
  if (typeof data.moves !== 'number') return false;
  if (typeof data.completed !== 'number') return false;
  if (typeof data.difficulty !== 'number') return false;
  if (data.status !== 'playing' && data.status !== 'won') return false;
  if (typeof data.startedAt !== 'number') return false;

  // Verify checksum matches
  const expected = computeChecksum(data);
  if (envelope.checksum !== expected) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/**
 * Attempt to migrate a raw parsed object into a valid SaveEnvelope.
 *
 * Handles:
 * - v1 format: raw GameState stored directly (no envelope)
 * - v2 format with missing fields: repairs where possible
 *
 * @returns A valid SaveEnvelope or null if migration is impossible
 */
export function migrateSave(raw: any): SaveEnvelope | null {
  if (!raw || typeof raw !== 'object') return null;

  // Case 1: Already a v2 envelope (maybe just failed validation for checksum)
  if (raw.version === SAVE_VERSION && raw.data) {
    const repaired: SaveEnvelope = {
      version: SAVE_VERSION,
      savedAt: raw.savedAt ?? Date.now(),
      checksum: computeChecksum(raw.data),
      data: raw.data,
    };
    if (validateSave(repaired)) return repaired;
    return null;
  }

  // Case 2: v1 format — raw GameState stored directly
  // v1 GameState has: version: 1, columns, stock, completed, moves, status, startedAt, difficulty
  if (
    raw.version === 1 &&
    Array.isArray(raw.columns) &&
    raw.columns.length === 10 &&
    Array.isArray(raw.stock) &&
    typeof raw.moves === 'number' &&
    typeof raw.completed === 'number' &&
    typeof raw.difficulty === 'number'
  ) {
    const gameState: GameState = {
      version: 1,
      difficulty: raw.difficulty,
      columns: raw.columns,
      stock: raw.stock,
      completed: raw.completed,
      moves: raw.moves,
      status: raw.status === 'won' ? 'won' : 'playing',
      startedAt: raw.startedAt ?? Date.now(),
    };

    const envelope: SaveEnvelope = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      checksum: computeChecksum(gameState),
      data: gameState,
    };

    return envelope;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Save (dual-write)
// ---------------------------------------------------------------------------

/**
 * Safely save game state with dual-write strategy.
 *
 * Write order:
 * 1. Primary key — always attempted first
 * 2. Backup key — written only after primary succeeds
 *
 * If primary write fails, the error propagates (caller should handle).
 * If backup write fails, we silently continue (primary is still valid).
 */
export async function saveGameSafe(state: GameState): Promise<void> {
  const envelope = createSaveEnvelope(state);
  const serialized = JSON.stringify(envelope);

  // Write primary — let errors propagate
  await AsyncStorage.setItem(PRIMARY_KEY, serialized);

  // Write backup — swallow errors to avoid losing a successful primary save
  try {
    await AsyncStorage.setItem(BACKUP_KEY, serialized);
  } catch {
    // Backup write failed; primary is still valid
    // In production, this could be logged to telemetry
  }
}

// ---------------------------------------------------------------------------
// Load (fallback chain)
// ---------------------------------------------------------------------------

/**
 * Safely load game state with fallback chain.
 *
 * Fallback order:
 * 1. Primary key → parse → validate
 * 2. Backup key → parse → validate
 * 3. Legacy v1 key → parse → migrate → validate
 * 4. Return null (no recoverable save found)
 */
export async function loadGameSafe(): Promise<GameState | null> {
  // Attempt 1: Primary
  const primary = await tryLoadAndValidate(PRIMARY_KEY);
  if (primary) return primary;

  // Attempt 2: Backup
  const backup = await tryLoadAndValidate(BACKUP_KEY);
  if (backup) return backup;

  // Attempt 3: Legacy v1 migration
  const migrated = await tryMigrateV1();
  if (migrated) {
    // Upgrade storage: save in new format so future loads are fast
    try {
      await saveGameSafe(migrated);
      // Clean up legacy key after successful migration
      await AsyncStorage.removeItem(LEGACY_V1_KEY);
    } catch {
      // Migration save failed — still return the data
    }
    return migrated;
  }

  return null;
}

/**
 * Attempt to load and validate a save from a specific key.
 */
async function tryLoadAndValidate(key: string): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Direct validation
    if (validateSave(parsed)) {
      return parsed.data;
    }

    // Try migration/repair
    const migrated = migrateSave(parsed);
    if (migrated && validateSave(migrated)) {
      return migrated.data;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Attempt to read and migrate a v1 save.
 */
async function tryMigrateV1(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(LEGACY_V1_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const envelope = migrateSave(parsed);
    if (envelope && validateSave(envelope)) {
      return envelope.data;
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

/**
 * Clear ALL app data from AsyncStorage.
 *
 * WARNING: This is destructive and irreversible.
 * The caller is responsible for confirming with the user before invoking.
 *
 * Clears all known keys to ensure a complete fresh start.
 */
export async function resetAllProgress(): Promise<void> {
  const keys = getKnownStorageKeys();
  await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
}
