import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme';
import { SUPPORTER_BRONZE, SUPPORTER_GOLD, SUPPORTER_SILVER } from '../monetization/products';
import type { ProductId } from '../monetization/products';

interface SupporterPacksProps {
  visible: boolean;
  supporterLevel: number;
  purchasedPacks: ProductId[];
  onPurchase: (productId: ProductId) => void;
  onClose: () => void;
}

const packs = [
  { product: SUPPORTER_BRONZE, color: '#CD7F32' },
  { product: SUPPORTER_SILVER, color: '#C0C0C0' },
  { product: SUPPORTER_GOLD, color: '#FFD700' },
];

export function SupporterPacks({
  visible,
  supporterLevel,
  purchasedPacks,
  onPurchase,
  onClose,
}: SupporterPacksProps) {
  const [purchasing, setPurchasing] = useState<ProductId | null>(null);

  const handlePurchase = (productId: ProductId) => {
    setPurchasing(productId);
    onPurchase(productId);
    setTimeout(() => setPurchasing(null), 8000);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Supporter Packs</Text>
            <Text style={styles.subtitle}>
              Support development and receive{'\n'}exclusive cosmetics with each purchase.
            </Text>

            {supporterLevel > 0 && (
              <View style={styles.thankYou}>
                <Text style={styles.thankYouText}>
                  🙏 Thank you for your support! Level {supporterLevel} Supporter
                </Text>
              </View>
            )}

            <View style={styles.packsColumn}>
              {packs.map(({ product, color }) => {
                const owned = purchasedPacks.includes(product.id);
                return (
                  <View
                    key={product.id}
                    style={[styles.packCard, { borderColor: color }]}
                  >
                    <View style={styles.packLeft}>
                      <Text style={styles.packIcon}>{product.icon}</Text>
                    </View>
                    <View style={styles.packCenter}>
                      <Text style={styles.packName}>{product.name}</Text>
                      <Text style={styles.packDesc}>{product.description}</Text>
                    </View>
                    <View style={styles.packRight}>
                      {owned ? (
                        <Text style={styles.ownedText}>✓ Owned</Text>
                      ) : purchasing === product.id ? (
                        <ActivityIndicator color={color} size="small" />
                      ) : (
                        <Pressable
                          onPress={() => handlePurchase(product.id)}
                          style={[styles.buyBtn, { backgroundColor: color }]}
                        >
                          <Text style={styles.buyBtnText}>{product.priceFallback}</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={styles.note}>
              Each purchase includes guaranteed cosmetic items.{'\n'}
              No random rewards. Available to all players.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(7, 19, 15, 0.92)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: colors.background,
    borderColor: '#1C4C3E',
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: 560,
    overflow: 'hidden',
    padding: 24,
  },
  header: { alignItems: 'flex-end' },
  closeButton: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  closeText: { color: colors.muted, fontSize: 18 },
  content: { alignItems: 'center' },
  title: { color: colors.cream, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'center' },
  thankYou: {
    backgroundColor: '#0C2B23',
    borderColor: colors.gold,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  thankYouText: { color: colors.goldSoft, fontSize: 12, fontWeight: '700' },
  packsColumn: { gap: 12, marginTop: 20, width: '100%' },
  packCard: {
    alignItems: 'center',
    backgroundColor: '#0C2B23',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    padding: 14,
  },
  packLeft: { marginRight: 12, width: 36 },
  packIcon: { fontSize: 26 },
  packCenter: { flex: 1 },
  packName: { color: colors.cream, fontSize: 15, fontWeight: '800' },
  packDesc: { color: colors.muted, fontSize: 11, marginTop: 2 },
  packRight: { alignItems: 'center', minWidth: 60 },
  ownedText: { color: colors.success, fontSize: 12, fontWeight: '700' },
  buyBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  buyBtnText: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  note: { color: colors.muted, fontSize: 10, marginTop: 18, opacity: 0.7, textAlign: 'center' },
});
