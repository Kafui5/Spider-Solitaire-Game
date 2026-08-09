/**
 * Premium state management.
 *
 * Free Weaver: 1+2 suit, 3 free 4-suit trials, daily challenge, basic stats, 3 card backs.
 * Full Weaver: unlimited 4-suit, challenge cards, full mastery, gallery, all cosmetics.
 *
 * Upgrade prompt appears after 5 completed games (not app opens).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from '../game/gameEngine';
import type { PremiumFeature, ProductId } from './products';
import { ALL_PRODUCTS, FOUR_SUIT_FREE_TRIALS } from './products';

const STORAGE_KEY = '@silk-spider/purchases-v1';

export interface PurchaseState {
  /** Products that have been purchased (by product ID) */
  purchased: ProductId[];
  /** Cosmetic IDs unlocked via purchases */
  unlockedItems: string[];
  /** Number of supporter packs purchased (for badge display) */
  supporterLevel: number;
  /** How many 4-suit free trials have been used */
  fourSuitTrialsUsed: number;
  /** Total games completed (for upgrade prompt timing) */
  gamesCompleted: number;
  /** Whether the upgrade prompt has been dismissed at least once */
  upgradePromptDismissed: boolean;
}

// --- Defaults ---

export function createDefaultPurchaseState(): PurchaseState {
  return {
    purchased: [],
    unlockedItems: [],
    supporterLevel: 0,
    fourSuitTrialsUsed: 0,
    gamesCompleted: 0,
    upgradePromptDismissed: false,
  };
}

// --- Persistence ---

export async function loadPurchaseState(): Promise<PurchaseState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPurchaseState();
    const state = JSON.parse(raw) as PurchaseState;
    if (!Array.isArray(state.purchased)) return createDefaultPurchaseState();
    return state;
  } catch {
    return createDefaultPurchaseState();
  }
}

export async function savePurchaseState(state: PurchaseState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- State mutations (pure, return new state) ---

export function recordPurchase(state: PurchaseState, productId: ProductId): PurchaseState {
  const product = ALL_PRODUCTS.find((p) => p.id === productId);
  if (!product) return state;

  const purchased = state.purchased.includes(productId)
    ? state.purchased
    : [...state.purchased, productId];

  const newItems = product.unlocks.filter((item) => !state.unlockedItems.includes(item));
  const unlockedItems = [...state.unlockedItems, ...newItems];

  const supporterLevel = product.type === 'supporter'
    ? state.supporterLevel + 1
    : state.supporterLevel;

  return { ...state, purchased, unlockedItems, supporterLevel };
}

export function recordGameCompleted(state: PurchaseState): PurchaseState {
  return { ...state, gamesCompleted: state.gamesCompleted + 1 };
}

export function useFourSuitTrial(state: PurchaseState): PurchaseState {
  return { ...state, fourSuitTrialsUsed: state.fourSuitTrialsUsed + 1 };
}

export function dismissUpgradePrompt(state: PurchaseState): PurchaseState {
  return { ...state, upgradePromptDismissed: true };
}

// --- Feature gating queries ---

/** Has the user purchased Full Weaver? */
export function isPremium(state: PurchaseState): boolean {
  return state.purchased.includes('full_weaver');
}

/** Check if a specific premium feature is unlocked */
export function hasFeature(state: PurchaseState, feature: PremiumFeature): boolean {
  if (isPremium(state)) return true;
  return state.unlockedItems.includes(`feature:${feature}`);
}

/**
 * Check if a difficulty level is available.
 * - 1-suit: always free
 * - 2-suit: always free
 * - 4-suit: premium OR has remaining free trials
 */
export function isDifficultyAvailable(state: PurchaseState, difficulty: Difficulty): boolean {
  if (difficulty === 1 || difficulty === 2) return true;
  if (isPremium(state)) return true;
  // 4-suit allowed if trials remain
  return state.fourSuitTrialsUsed < FOUR_SUIT_FREE_TRIALS;
}

/** How many 4-suit free trials remain? */
export function fourSuitTrialsRemaining(state: PurchaseState): number {
  if (isPremium(state)) return Infinity;
  return Math.max(0, FOUR_SUIT_FREE_TRIALS - state.fourSuitTrialsUsed);
}

/** Check if a cosmetic item (by ID) is unlocked via purchase */
export function isPurchasedCosmetic(state: PurchaseState, cosmeticId: string): boolean {
  return state.unlockedItems.includes(cosmeticId);
}

/**
 * Should we show the upgrade prompt?
 * Appears after 5 completed games, only for non-premium users.
 * Does NOT require consecutive days or app opens — just game completions.
 */
export function shouldShowUpgradePrompt(state: PurchaseState): boolean {
  if (isPremium(state)) return false;
  return state.gamesCompleted >= 5;
}

/**
 * Get a list of features that are locked for the current state.
 */
export function getLockedFeatures(state: PurchaseState): PremiumFeature[] {
  if (isPremium(state)) return [];
  return [
    'four_suit',
    'challenge_cards',
    'full_mastery',
    'loom_gallery',
    'all_card_backs',
    'all_tables',
    'premium_animations',
    'full_stats',
  ];
}

/** Check if a cosmetic pack was purchased */
export function hasPack(state: PurchaseState, productId: ProductId): boolean {
  return state.purchased.includes(productId);
}
