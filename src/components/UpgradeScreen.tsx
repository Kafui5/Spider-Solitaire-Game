import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme';
import { FREE_TIER_FEATURES, FULL_WEAVER, PREMIUM_FEATURES } from '../monetization/products';

interface UpgradeScreenProps {
  visible: boolean;
  localizedPrice: string | null;
  onPurchase: () => void;
  onRestore: () => void;
  onClose: () => void;
}

export function UpgradeScreen({
  visible,
  localizedPrice,
  onPurchase,
  onRestore,
  onClose,
}: UpgradeScreenProps) {
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = () => {
    setPurchasing(true);
    onPurchase();
    // The purchasing state will be reset when the modal closes after success
    setTimeout(() => setPurchasing(false), 10000); // Safety timeout
  };

  const price = localizedPrice ?? FULL_WEAVER.priceFallback;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.heroIcon}>🕷️</Text>
              <Text style={styles.heroTitle}>Full Weaver</Text>
              <Text style={styles.heroSubtitle}>Unlock the complete experience</Text>
            </View>

            {/* Kente divider */}
            <View style={styles.kente}>
              {[colors.gold, colors.clay, colors.indigo, colors.gold, colors.clay].map((c, i) => (
                <View key={i} style={{ backgroundColor: c, flex: 1, height: 4 }} />
              ))}
            </View>

            {/* What you get */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EVERYTHING INCLUDED</Text>
              {PREMIUM_FEATURES.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* What's already free */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleMuted}>ALREADY FREE FOREVER</Text>
              {FREE_TIER_FEATURES.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={styles.freeCheck}>♠</Text>
                  <Text style={styles.featureTextMuted}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Purchase area */}
            <View style={styles.purchaseArea}>
              <Text style={styles.oneTime}>One-time purchase · No subscriptions</Text>
              <Text style={styles.noAds}>No ads, ever. No data collection.</Text>

              <Pressable
                onPress={handlePurchase}
                disabled={purchasing}
                style={[styles.buyButton, purchasing && styles.buyButtonDisabled]}
              >
                {purchasing ? (
                  <ActivityIndicator color={colors.ink} />
                ) : (
                  <>
                    <Text style={styles.buyText}>Unlock Full Weaver</Text>
                    <Text style={styles.buyPrice}>{price}</Text>
                  </>
                )}
              </Pressable>

              <Pressable onPress={onRestore} style={styles.restoreButton}>
                <Text style={styles.restoreText}>Restore previous purchase</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(7, 19, 15, 0.95)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  modal: {
    backgroundColor: colors.background,
    borderColor: colors.gold,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    maxHeight: 700,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'flex-end',
  },
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeText: { color: colors.muted, fontSize: 18 },
  hero: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  heroIcon: { fontSize: 48 },
  heroTitle: {
    color: colors.cream,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  heroSubtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  kente: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionTitleMuted: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
    opacity: 0.7,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  checkmark: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 12,
    width: 20,
  },
  freeCheck: {
    color: colors.muted,
    fontSize: 14,
    marginRight: 12,
    opacity: 0.6,
    width: 20,
  },
  featureText: {
    color: colors.cream,
    flex: 1,
    fontSize: 14,
  },
  featureTextMuted: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    opacity: 0.7,
  },
  purchaseArea: {
    alignItems: 'center',
    borderTopColor: '#1C4C3E',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 20,
  },
  oneTime: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  noAds: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  buyButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 52,
    paddingHorizontal: 24,
    width: '100%',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  buyPrice: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  restoreButton: {
    marginTop: 14,
    paddingVertical: 8,
  },
  restoreText: {
    color: colors.muted,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
