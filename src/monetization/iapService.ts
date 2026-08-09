/**
 * IAP service wrapper for react-native-iap.
 *
 * Handles: connection, product fetching, purchase flow, restore, receipt finishing.
 * Gracefully degrades on web/dev where IAP is unavailable.
 */

import { Platform } from 'react-native';
import type { ProductId } from './products';
import { PRODUCT_IDS } from './products';

// Types from react-native-iap (we import dynamically to avoid crashes on web)
interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  localizedPrice: string;
  currency: string;
}

interface IAPPurchase {
  productId: string;
  transactionId?: string;
  transactionReceipt?: string;
  purchaseToken?: string;
}

type PurchaseListener = (purchase: IAPPurchase) => void;
type ErrorListener = (error: Error) => void;

// --- Service state ---
let isConnected = false;
let purchaseListeners: PurchaseListener[] = [];
let errorListeners: ErrorListener[] = [];
let iapModule: any = null;

// --- Initialization ---

/**
 * Initialize the IAP connection.
 * Call this once when the app starts.
 * Returns false if IAP is not available (web, dev mode without billing).
 */
export async function initIAP(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[IAP] Web platform — IAP disabled');
    return false;
  }

  try {
    iapModule = await import('react-native-iap');
    await iapModule.initConnection();
    isConnected = true;

    // Set up purchase listener
    iapModule.purchaseUpdatedListener((purchase: IAPPurchase) => {
      for (const listener of purchaseListeners) {
        listener(purchase);
      }
    });

    iapModule.purchaseErrorListener((error: Error) => {
      for (const listener of errorListeners) {
        listener(error);
      }
    });

    return true;
  } catch (error) {
    console.warn('[IAP] Failed to initialize:', error);
    isConnected = false;
    return false;
  }
}

/**
 * Clean up IAP connection.
 * Call when app is unmounting.
 */
export async function endIAP(): Promise<void> {
  if (!isConnected || !iapModule) return;
  try {
    await iapModule.endConnection();
  } catch {
    // Silent cleanup
  }
  isConnected = false;
}

// --- Products ---

/**
 * Fetch available products from the store.
 * Returns product info with localized pricing.
 */
export async function getProducts(): Promise<IAPProduct[]> {
  if (!isConnected || !iapModule) return [];

  try {
    const products = await iapModule.getProducts({ skus: PRODUCT_IDS });
    return products;
  } catch (error) {
    console.warn('[IAP] Failed to fetch products:', error);
    return [];
  }
}

/**
 * Get localized price for a specific product.
 * Returns the fallback price string if store price isn't available.
 */
export async function getProductPrice(productId: ProductId): Promise<string | null> {
  const products = await getProducts();
  const product = products.find((p) => p.productId === productId);
  return product?.localizedPrice ?? null;
}

// --- Purchase flow ---

/**
 * Request a purchase for a product.
 * The result comes async via the purchase listener.
 */
export async function requestPurchase(productId: ProductId): Promise<void> {
  if (!isConnected || !iapModule) {
    throw new Error('IAP not available');
  }

  try {
    await iapModule.requestPurchase({ sku: productId });
  } catch (error) {
    throw error;
  }
}

/**
 * Finish/acknowledge a transaction.
 * MUST be called after processing a purchase to avoid refund.
 */
export async function finishTransaction(purchase: IAPPurchase): Promise<void> {
  if (!iapModule) return;

  try {
    await iapModule.finishTransaction({
      purchase,
      isConsumable: isConsumableProduct(purchase.productId as ProductId),
    });
  } catch (error) {
    console.warn('[IAP] Failed to finish transaction:', error);
  }
}

/**
 * Restore previous purchases (for users reinstalling or switching devices).
 */
export async function restorePurchases(): Promise<IAPPurchase[]> {
  if (!isConnected || !iapModule) return [];

  try {
    const purchases = await iapModule.getAvailablePurchases();
    return purchases;
  } catch (error) {
    console.warn('[IAP] Failed to restore purchases:', error);
    return [];
  }
}

// --- Listeners ---

export function onPurchaseComplete(listener: PurchaseListener): () => void {
  purchaseListeners.push(listener);
  return () => {
    purchaseListeners = purchaseListeners.filter((l) => l !== listener);
  };
}

export function onPurchaseError(listener: ErrorListener): () => void {
  errorListeners.push(listener);
  return () => {
    errorListeners = errorListeners.filter((l) => l !== listener);
  };
}

// --- Helpers ---

function isConsumableProduct(productId: ProductId): boolean {
  // Supporter packs are one-time (non-consumable) — they unlock cosmetics
  // All products in this app are non-consumable (one-time purchases)
  return false;
}

/**
 * Check if IAP is available on this platform/device.
 */
export function isIAPAvailable(): boolean {
  return isConnected;
}
