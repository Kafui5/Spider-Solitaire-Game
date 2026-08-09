import type { EquippedCosmetics } from './game/rewardsStorage';

export type CosmeticCategory =
  | 'card_back'
  | 'table_color'
  | 'background'
  | 'deal_animation'
  | 'completion_animation';

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  category: CosmeticCategory;
  preview: string; // emoji or color hex for preview
  cost: number; // Silk Threads cost, 0 if earned by achievement/gallery
  unlockedBy?: string; // achievement ID or artwork ID that unlocks it for free
  isDefault?: boolean;
}

// --- Full Cosmetics Catalog ---

export const ALL_COSMETICS: Cosmetic[] = [
  // ===== Card Backs (12) =====
  {
    id: 'woven',
    name: 'Woven Silk',
    description: 'A classic woven silk pattern.',
    category: 'card_back',
    preview: '🕸️',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'spider',
    name: 'Spider Web',
    description: 'Intricate spider web design.',
    category: 'card_back',
    preview: '🕷️',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Bold geometric shapes.',
    category: 'card_back',
    preview: '🔷',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep midnight blue elegance.',
    category: 'card_back',
    preview: '🌙',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Regal purple and gold.',
    category: 'card_back',
    preview: '👑',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'ember',
    name: 'Ember Glow',
    description: 'Warm red/orange pattern like glowing embers.',
    category: 'card_back',
    preview: '🔥',
    cost: 50,
  },
  {
    id: 'ocean',
    name: 'Ocean Depth',
    description: 'Deep blue waves rolling across the card.',
    category: 'card_back',
    preview: '🌊',
    cost: 50,
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    description: 'Delicate pink petals drifting gently.',
    category: 'card_back',
    preview: '🌸',
    cost: 75,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Glossy black volcanic glass.',
    category: 'card_back',
    preview: '#1a1a2e',
    cost: 100,
  },
  {
    id: 'century',
    name: 'Century Gold',
    description: 'Awarded for 100 wins. A golden masterpiece.',
    category: 'card_back',
    preview: '🏆',
    cost: 0,
    unlockedBy: 'century_weaver',
  },
  {
    id: 'master',
    name: "Master's Mark",
    description: 'Earned by mastering 4-suit difficulty.',
    category: 'card_back',
    preview: '🎖️',
    cost: 0,
    unlockedBy: 'four_suit_master',
  },
  {
    id: 'pure_silk',
    name: 'Pure Silk',
    description: 'Flawless silk — earned through pure dedication.',
    category: 'card_back',
    preview: '🤍',
    cost: 0,
    unlockedBy: 'pure_silk',
  },
  {
    id: 'diamond',
    name: 'Diamond Cut',
    description: 'Precision cut — awarded for a perfect game.',
    category: 'card_back',
    preview: '💎',
    cost: 0,
    unlockedBy: 'perfect_game',
  },

  // ===== Table Colors (6) =====
  {
    id: 'felt_green',
    name: 'Classic Felt',
    description: 'Traditional green felt table.',
    category: 'table_color',
    preview: '#2d5a27',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'deep_navy',
    name: 'Deep Navy',
    description: 'Rich navy blue surface.',
    category: 'table_color',
    preview: '#1a2744',
    cost: 40,
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Warm burgundy wine tone.',
    category: 'table_color',
    preview: '#5c1a2a',
    cost: 40,
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    description: 'Sleek dark charcoal surface.',
    category: 'table_color',
    preview: '#2c2c2c',
    cost: 60,
  },
  {
    id: 'ivory',
    name: 'Ivory',
    description: 'Elegant light ivory finish.',
    category: 'table_color',
    preview: '#f5f0e8',
    cost: 80,
  },
  {
    id: 'dawn_table',
    name: 'Dawn Gold',
    description: 'Golden hues of dawn — unlocked through the Loom Gallery.',
    category: 'table_color',
    preview: '#c9a84c',
    cost: 0,
    unlockedBy: 'volta_dawn',
  },

  // ===== Backgrounds (6) =====
  {
    id: 'default_bg',
    name: 'Dark Forest',
    description: 'Deep forest green backdrop.',
    category: 'background',
    preview: '#1a2f1a',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'starfield',
    name: 'Starfield',
    description: 'A shimmering field of distant stars.',
    category: 'background',
    preview: '✨',
    cost: 60,
  },
  {
    id: 'gradient_warm',
    name: 'Warm Gradient',
    description: 'Smooth warm tones from amber to coral.',
    category: 'background',
    preview: '#e67e22',
    cost: 40,
  },
  {
    id: 'gradient_cool',
    name: 'Cool Gradient',
    description: 'Calming cool tones from teal to indigo.',
    category: 'background',
    preview: '#2980b9',
    cost: 40,
  },
  {
    id: 'savannah_bg',
    name: 'Savannah Sunset',
    description: 'Golden savannah at dusk — unlocked through the Loom Gallery.',
    category: 'background',
    preview: '🌅',
    cost: 0,
    unlockedBy: 'savannah_gold',
  },
  {
    id: 'festival_bg',
    name: 'Festival Lights',
    description: 'Vibrant festival lanterns — unlocked through the Loom Gallery.',
    category: 'background',
    preview: '🎆',
    cost: 0,
    unlockedBy: 'festival_colours',
  },

  // ===== Deal Animations (4) =====
  {
    id: 'standard_deal',
    name: 'Standard',
    description: 'Classic card deal animation.',
    category: 'deal_animation',
    preview: '🃏',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'cascade',
    name: 'Cascade',
    description: 'Cards cascade down like a waterfall.',
    category: 'deal_animation',
    preview: '💧',
    cost: 80,
  },
  {
    id: 'spiral',
    name: 'Spiral',
    description: 'Cards spiral outward from center.',
    category: 'deal_animation',
    preview: '🌀',
    cost: 100,
  },
  {
    id: 'rain_deal',
    name: 'Rainfall',
    description: 'Cards fall gently like rain — unlocked through the Loom Gallery.',
    category: 'deal_animation',
    preview: '🌧️',
    cost: 0,
    unlockedBy: 'forest_rain',
  },

  // ===== Completion Animations (4) =====
  {
    id: 'standard_complete',
    name: 'Standard',
    description: 'Classic win celebration.',
    category: 'completion_animation',
    preview: '🎉',
    cost: 0,
    isDefault: true,
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    description: 'Brilliant fireworks burst across the screen.',
    category: 'completion_animation',
    preview: '🎆',
    cost: 80,
  },
  {
    id: 'silk_burst',
    name: 'Silk Burst',
    description: 'Silk threads explode in a dazzling display.',
    category: 'completion_animation',
    preview: '💫',
    cost: 100,
  },
  {
    id: 'moonlit_complete',
    name: 'Moonbeam',
    description: 'Soft moonbeams illuminate the victory — unlocked through the Loom Gallery.',
    category: 'completion_animation',
    preview: '🌙',
    cost: 0,
    unlockedBy: 'moonlit_web',
  },
];

// --- Helper functions ---

export function getCosmeticsByCategory(category: CosmeticCategory): Cosmetic[] {
  return ALL_COSMETICS.filter((c) => c.category === category);
}

export function getDefaultCosmetics(): EquippedCosmetics {
  return {
    cardBack: 'woven',
    tableColor: 'felt_green',
    background: 'default_bg',
    dealAnimation: 'standard_deal',
    completionAnimation: 'standard_complete',
  };
}

export function getCosmeticById(id: string): Cosmetic | undefined {
  return ALL_COSMETICS.find((c) => c.id === id);
}

export function getUnlockableCosmetics(unlockedList: string[]): Cosmetic[] {
  return ALL_COSMETICS.filter(
    (c) =>
      !c.isDefault &&
      !c.unlockedBy &&
      c.cost > 0 &&
      !unlockedList.includes(c.id),
  );
}

export function isUnlocked(cosmeticId: string, unlockedList: string[]): boolean {
  const cosmetic = getCosmeticById(cosmeticId);
  if (!cosmetic) return false;
  if (cosmetic.isDefault) return true;
  return unlockedList.includes(cosmeticId);
}
