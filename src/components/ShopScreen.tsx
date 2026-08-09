import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ALL_COSMETICS,
  getCosmeticsByCategory,
  isUnlocked,
  type Cosmetic,
  type CosmeticCategory,
} from '../unlockables';
import { ALL_ACHIEVEMENTS } from '../game/achievements';
import { colors } from '../theme';

interface ShopScreenProps {
  visible: boolean;
  threadBalance: number;
  unlockedCosmetics: string[];
  onPurchase: (cosmeticId: string, cost: number) => void;
  onClose: () => void;
}

interface CategoryTab {
  key: CosmeticCategory;
  label: string;
}

const CATEGORIES: CategoryTab[] = [
  { key: 'card_back', label: 'Card Backs' },
  { key: 'table_color', label: 'Tables' },
  { key: 'background', label: 'Backgrounds' },
  { key: 'deal_animation', label: 'Animations' },
];

function getAchievementName(achievementId: string): string {
  const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === achievementId);
  return achievement?.name ?? achievementId;
}

function isColorPreview(preview: string): boolean {
  return preview.startsWith('#');
}

export function ShopScreen({
  visible,
  threadBalance,
  unlockedCosmetics,
  onPurchase,
  onClose,
}: ShopScreenProps) {
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('card_back');

  const items = getCosmeticsByCategory(activeCategory);

  const handlePurchase = (item: Cosmetic) => {
    Alert.alert(
      'Confirm Purchase',
      `Buy ${item.name} for ${item.cost} threads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: () => onPurchase(item.id, item.cost),
        },
      ],
    );
  };

  const renderItem = (item: Cosmetic) => {
    const owned = isUnlocked(item.id, unlockedCosmetics);
    const lockedByAchievement = !owned && item.unlockedBy != null;
    const canAfford = threadBalance >= item.cost;
    const purchasable = !owned && !lockedByAchievement && item.cost > 0;

    return (
      <View key={item.id} style={styles.itemCard}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          {isColorPreview(item.preview) ? (
            <View
              style={[styles.colorSwatch, { backgroundColor: item.preview }]}
            />
          ) : (
            <Text style={styles.previewEmoji}>{item.preview}</Text>
          )}
        </View>

        {/* Name */}
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Status */}
        {owned ? (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>✓ Owned</Text>
          </View>
        ) : lockedByAchievement ? (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText} numberOfLines={2}>
              Unlock: {getAchievementName(item.unlockedBy!)}
            </Text>
          </View>
        ) : purchasable ? (
          <Pressable
            style={[
              styles.buyButton,
              !canAfford && styles.buyButtonDisabled,
            ]}
            onPress={() => canAfford && handlePurchase(item)}
            disabled={!canAfford}
            accessibilityRole="button"
            accessibilityLabel={`Buy ${item.name} for ${item.cost} threads`}
          >
            <Text
              style={[
                styles.buyButtonText,
                !canAfford && styles.buyButtonTextDisabled,
              ]}
            >
              {item.cost} 🧵
            </Text>
          </Pressable>
        ) : (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>✓ Owned</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>THREAD SHOP</Text>
            <View style={styles.headerRight}>
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceText}>🧵 {threadBalance}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close">
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* Category tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.tab,
                    activeCategory === cat.key && styles.tabActive,
                  ]}
                  onPress={() => setActiveCategory(cat.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeCategory === cat.key }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeCategory === cat.key && styles.tabTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Items grid */}
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.itemsGrid}>
              {items.map(renderItem)}
            </View>
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  modal: {
    backgroundColor: colors.background,
    borderColor: '#1C4C3E',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    maxHeight: 720,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#1C4C3E',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  balanceBadge: {
    backgroundColor: 'rgba(230, 185, 92, 0.12)',
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  balanceText: {
    color: colors.gold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeText: {
    color: colors.muted,
    fontSize: 18,
  },
  tabsContainer: {
    borderBottomColor: '#1C4C3E',
    borderBottomWidth: 1,
  },
  tabsContent: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: colors.felt,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.cream,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  itemCard: {
    alignItems: 'center',
    backgroundColor: '#0C2B23',
    borderColor: '#1C4C3E',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 14,
    width: '47.5%',
  },
  previewContainer: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  colorSwatch: {
    borderColor: '#1C4C3E',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    width: 40,
  },
  previewEmoji: {
    fontSize: 32,
  },
  itemName: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  ownedBadge: {
    backgroundColor: 'rgba(115, 210, 161, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ownedText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  lockedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  lockedText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.7,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: 'rgba(230, 185, 92, 0.15)',
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buyButtonDisabled: {
    borderColor: '#1C4C3E',
    opacity: 0.4,
  },
  buyButtonText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  buyButtonTextDisabled: {
    color: colors.muted,
  },
});
