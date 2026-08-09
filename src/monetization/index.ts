export { ALL_PRODUCTS, FULL_WEAVER, FOUR_SUIT_FREE_TRIALS, FREE_TIER_FEATURES, PREMIUM_FEATURES, PRODUCT_IDS } from './products';
export type { Product, ProductId, ProductType, PremiumFeature } from './products';

export {
  createDefaultPurchaseState,
  dismissUpgradePrompt,
  fourSuitTrialsRemaining,
  getLockedFeatures,
  hasFeature,
  hasPack,
  isDifficultyAvailable,
  isPremium,
  isPurchasedCosmetic,
  loadPurchaseState,
  recordGameCompleted,
  recordPurchase,
  savePurchaseState,
  shouldShowUpgradePrompt,
  useFourSuitTrial,
} from './premiumContext';
export type { PurchaseState } from './premiumContext';

export {
  endIAP,
  finishTransaction,
  getProductPrice,
  getProducts,
  initIAP,
  isIAPAvailable,
  onPurchaseComplete,
  onPurchaseError,
  requestPurchase,
  restorePurchases,
} from './iapService';
