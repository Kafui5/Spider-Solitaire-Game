/**
 * In-App Purchase product catalog for Silk Spider Solitaire.
 *
 * Revenue model:
 * - No ads, no subscriptions, no loot boxes
 * - One-time "Full Weaver" unlock for premium features
 * - Optional cosmetic collections (available to all players)
 * - Supporter Packs with guaranteed cosmetic items (not donations)
 *
 * Product IDs must match Google Play Console configuration.
 */

export type ProductId =
  | 'full_weaver'
  | 'pack_midnight'
  | 'pack_festival'
  | 'pack_artisan'
  | 'supporter_bronze'
  | 'supporter_silver'
  | 'supporter_gold';

export type ProductType = 'unlock' | 'cosmetic_pack' | 'supporter';

export interface Product {
  id: ProductId;
  type: ProductType;
  name: string;
  description: string;
  icon: string;
  /** Fallback price display (actual localized price from Play Store preferred) */
  priceFallback: string;
  /** What this product unlocks (cosmetic IDs, feature flags) */
  unlocks: string[];
  /** Whether this is available to free-tier players too */
  availableToAll: boolean;
}

// --- The main premium unlock ---
export const FULL_WEAVER: Product = {
  id: 'full_weaver',
  type: 'unlock',
  name: 'Full Weaver',
  description: 'Unlock the complete Silk Spider experience',
  icon: '🕷️',
  priceFallback: '$3.99',
  availableToAll: true,
  unlocks: [
    'feature:four_suit',
    'feature:challenge_cards',
    'feature:full_mastery',
    'feature:loom_gallery',
    'feature:all_card_backs',
    'feature:all_tables',
    'feature:premium_animations',
    'feature:full_stats',
  ],
};

// --- Cosmetic packs (available to ALL players, free or premium) ---
export const PACK_MIDNIGHT: Product = {
  id: 'pack_midnight',
  type: 'cosmetic_pack',
  name: 'Midnight Collection',
  description: '3 exclusive card backs, 1 table, 1 background',
  icon: '🌙',
  priceFallback: '$1.49',
  availableToAll: true,
  unlocks: ['cardback:midnight_premium', 'cardback:starweave', 'cardback:eclipse', 'table:obsidian_table', 'bg:nebula'],
};

export const PACK_FESTIVAL: Product = {
  id: 'pack_festival',
  type: 'cosmetic_pack',
  name: 'Festival Pack',
  description: '3 animated celebration effects + 1 deal animation',
  icon: '🎊',
  priceFallback: '$1.49',
  availableToAll: true,
  unlocks: ['anim:confetti_gold', 'anim:silk_ribbons', 'anim:lanterns', 'deal:festival_fan'],
};

export const PACK_ARTISAN: Product = {
  id: 'pack_artisan',
  type: 'cosmetic_pack',
  name: 'Artisan Bundle',
  description: '5 hand-crafted premium card backs',
  icon: '🎨',
  priceFallback: '$1.99',
  availableToAll: true,
  unlocks: ['cardback:kintsugi', 'cardback:batik', 'cardback:origami', 'cardback:mosaic', 'cardback:calligraphy'],
};

// --- Supporter Packs (guaranteed cosmetics, not donations) ---
export const SUPPORTER_BRONZE: Product = {
  id: 'supporter_bronze',
  type: 'supporter',
  name: 'Bronze Thread',
  description: 'Supporter badge and exclusive bronze card back',
  icon: '🥉',
  priceFallback: '$0.99',
  availableToAll: true,
  unlocks: ['badge:supporter_bronze', 'cardback:bronze_weave'],
};

export const SUPPORTER_SILVER: Product = {
  id: 'supporter_silver',
  type: 'supporter',
  name: 'Silver Loom',
  description: 'Silver badge and exclusive silver table theme',
  icon: '🥈',
  priceFallback: '$2.99',
  availableToAll: true,
  unlocks: ['badge:supporter_silver', 'table:silver_felt'],
};

export const SUPPORTER_GOLD: Product = {
  id: 'supporter_gold',
  type: 'supporter',
  name: 'Golden Weaver',
  description: 'Gold badge, exclusive card back, and celebration animation',
  icon: '🥇',
  priceFallback: '$4.99',
  availableToAll: true,
  unlocks: ['badge:supporter_gold', 'cardback:golden_silk', 'anim:golden_burst'],
};

export const ALL_PRODUCTS: Product[] = [
  FULL_WEAVER,
  PACK_MIDNIGHT,
  PACK_FESTIVAL,
  PACK_ARTISAN,
  SUPPORTER_BRONZE,
  SUPPORTER_SILVER,
  SUPPORTER_GOLD,
];

export const PRODUCT_IDS: ProductId[] = ALL_PRODUCTS.map((p) => p.id);

// --- Premium feature definitions ---

export type PremiumFeature =
  | 'four_suit'
  | 'challenge_cards'
  | 'full_mastery'
  | 'loom_gallery'
  | 'all_card_backs'
  | 'all_tables'
  | 'premium_animations'
  | 'full_stats';

/**
 * FREE WEAVER — generous free tier:
 * - One-suit AND two-suit modes (full gameplay)
 * - Three free trials of four-suit mode
 * - Daily challenge (any difficulty that day)
 * - Undo and hints (unlimited)
 * - Basic statistics (games, wins, time)
 * - Three card back designs
 * - One table theme
 * - Local game saving
 */
export const FREE_TIER_FEATURES = [
  'One-suit and two-suit modes',
  'Three free trials of four-suit',
  'Daily challenge',
  'Undo and hints',
  'Basic statistics',
  'Three card back designs',
  'Game auto-save',
] as const;

/**
 * FULL WEAVER — one-time purchase adds:
 */
export const PREMIUM_FEATURES = [
  'Unlimited four-suit Master mode',
  'Challenge cards for bonus rewards',
  'Full mastery rank system',
  'Loom Gallery artwork collections',
  'Thirteen premium card back designs',
  'All table themes',
  'Premium completion animations',
  'Complete statistics and records',
] as const;

/** Maximum free trials of 4-suit mode before requiring purchase */
export const FOUR_SUIT_FREE_TRIALS = 3;
