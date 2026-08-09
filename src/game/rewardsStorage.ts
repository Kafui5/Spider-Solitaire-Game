import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDefaultProfile } from './rewards';
import type { PlayerProfile } from './rewards';
import { createDefaultMastery } from './mastery';
import type { PlayerMastery } from './mastery';
import type { PlayerAchievements } from './achievements';
import { createDefaultGallery } from './loomGallery';
import type { LoomGalleryState } from './loomGallery';
import type { WebPattern } from './webPatterns';

export type { LoomGalleryState } from './loomGallery';
export type { WebPattern } from './webPatterns';

// --- Core interfaces ---

export interface RewardsData {
  version: 1;
  profile: PlayerProfile;
  mastery: PlayerMastery;
  achievements: PlayerAchievements;
  gallery: LoomGalleryState;
  webPatterns: WebPattern[];
  unlockedCosmetics: string[];
  equippedCosmetics: EquippedCosmetics;
}

export interface EquippedCosmetics {
  cardBack: string;
  tableColor: string;
  background: string;
  dealAnimation: string;
  completionAnimation: string;
}

// --- Constants ---

const STORAGE_KEY = '@silk-spider/rewards-v1';
const MAX_WEB_PATTERNS = 50;

// --- Default data ---

export function createDefaultRewardsData(): RewardsData {
  return {
    version: 1,
    profile: createDefaultProfile(),
    mastery: createDefaultMastery(),
    achievements: { achievements: {} },
    gallery: createDefaultGallery(),
    webPatterns: [],
    unlockedCosmetics: [],
    equippedCosmetics: {
      cardBack: 'woven',
      tableColor: 'felt_green',
      background: 'default_bg',
      dealAnimation: 'standard_deal',
      completionAnimation: 'standard_complete',
    },
  };
}

// --- Persistence ---

export async function loadRewardsData(): Promise<RewardsData> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return createDefaultRewardsData();

    const data = JSON.parse(value) as RewardsData;
    if (data.version !== 1) return createDefaultRewardsData();

    return data;
  } catch {
    return createDefaultRewardsData();
  }
}

export async function saveRewardsData(data: RewardsData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- Mutation helpers (immutable updates) ---

export function addWebPattern(data: RewardsData, pattern: WebPattern): RewardsData {
  const updated = [pattern, ...data.webPatterns].slice(0, MAX_WEB_PATTERNS);
  return { ...data, webPatterns: updated };
}

export function unlockCosmetic(data: RewardsData, cosmeticId: string): RewardsData {
  if (data.unlockedCosmetics.includes(cosmeticId)) return data;
  return {
    ...data,
    unlockedCosmetics: [...data.unlockedCosmetics, cosmeticId],
  };
}

export function equipCosmetic(
  data: RewardsData,
  slot: keyof EquippedCosmetics,
  cosmeticId: string,
): RewardsData {
  return {
    ...data,
    equippedCosmetics: {
      ...data.equippedCosmetics,
      [slot]: cosmeticId,
    },
  };
}

export function purchaseCosmetic(
  data: RewardsData,
  cosmeticId: string,
  cost: number,
): RewardsData | null {
  if (data.profile.silkThreads < cost) return null;

  return {
    ...data,
    profile: {
      ...data.profile,
      silkThreads: data.profile.silkThreads - cost,
      lifetimeThreadsSpent: data.profile.lifetimeThreadsSpent + cost,
    },
    unlockedCosmetics: [...data.unlockedCosmetics, cosmeticId],
  };
}
