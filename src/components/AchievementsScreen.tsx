import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { PlayerAchievements } from '../game/achievements';
import type { PlayerProfile } from '../game/rewards';
import { ALL_ACHIEVEMENTS, getAchievementProgress } from '../game/achievements';
import { colors } from '../theme';

interface AchievementsScreenProps {
  visible: boolean;
  achievements: PlayerAchievements;
  profile: PlayerProfile;
  onClose: () => void;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AchievementsScreen({
  visible,
  achievements,
  profile,
  onClose,
}: AchievementsScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unlockedCount = ALL_ACHIEVEMENTS.filter(
    (a) => achievements.achievements[a.id]?.unlocked,
  ).length;

  const selectedAchievement = selectedId
    ? ALL_ACHIEVEMENTS.find((a) => a.id === selectedId)
    : null;
  const selectedProgress = selectedId
    ? achievements.achievements[selectedId]
    : null;

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
            <Text style={styles.title}>ACHIEVEMENTS</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Progress summary */}
          <View style={styles.progressSummary}>
            <Text style={styles.progressText}>
              {unlockedCount}/{ALL_ACHIEVEMENTS.length} unlocked
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(unlockedCount / ALL_ACHIEVEMENTS.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Achievement grid */}
            <View style={styles.grid}>
              {ALL_ACHIEVEMENTS.map((achievement) => {
                const progress = achievements.achievements[achievement.id];
                const isUnlocked = progress?.unlocked ?? false;
                const isSelected = selectedId === achievement.id;
                const progressInfo = getAchievementProgress(
                  achievement.id,
                  profile as any,
                );
                const isProgressive = progressInfo.target > 1;

                return (
                  <Pressable
                    key={achievement.id}
                    style={[
                      styles.badge,
                      isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
                      isSelected && styles.badgeSelected,
                    ]}
                    onPress={() =>
                      setSelectedId(isSelected ? null : achievement.id)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${achievement.name}${isUnlocked ? ', unlocked' : ', locked'}`}
                  >
                    <Text
                      style={[
                        styles.badgeIcon,
                        !isUnlocked && styles.badgeIconLocked,
                      ]}
                    >
                      {achievement.icon}
                    </Text>
                    <Text
                      style={[
                        styles.badgeName,
                        !isUnlocked && styles.badgeNameLocked,
                      ]}
                      numberOfLines={2}
                    >
                      {achievement.name}
                    </Text>
                    {isProgressive && !isUnlocked && (
                      <Text style={styles.badgeProgress}>
                        {progressInfo.current}/{progressInfo.target}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Detail section */}
            {selectedAchievement && (
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailIcon}>
                    {selectedAchievement.icon}
                  </Text>
                  <View style={styles.detailHeaderText}>
                    <Text style={styles.detailName}>
                      {selectedAchievement.name}
                    </Text>
                    <Text style={styles.detailCategory}>
                      {selectedAchievement.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailDescription}>
                  {selectedAchievement.description}
                </Text>

                <View style={styles.detailRewards}>
                  <Text style={styles.detailRewardText}>
                    🧵 {selectedAchievement.threadReward} threads
                  </Text>
                  <Text style={styles.detailRewardText}>
                    ✦ {selectedAchievement.xpReward} XP
                  </Text>
                  {selectedAchievement.unlockCardBack && (
                    <Text style={styles.detailRewardText}>
                      🎴 Unlocks card back
                    </Text>
                  )}
                </View>

                {selectedProgress?.unlocked && selectedProgress.unlockedAt && (
                  <Text style={styles.detailUnlockedDate}>
                    Unlocked on {formatDate(selectedProgress.unlockedAt)}
                  </Text>
                )}

                {!selectedProgress?.unlocked && (() => {
                  const prog = getAchievementProgress(
                    selectedAchievement.id,
                    profile as any,
                  );
                  if (prog.target <= 1) return null;
                  const pct = (prog.current / prog.target) * 100;
                  return (
                    <View style={styles.detailProgressSection}>
                      <Text style={styles.detailProgressLabel}>
                        Progress: {prog.current}/{prog.target}
                      </Text>
                      <View style={styles.detailProgressBar}>
                        <View
                          style={[
                            styles.detailProgressFill,
                            { width: `${pct}%` },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}
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
  progressSummary: {
    borderBottomColor: '#1C4C3E',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  progressText: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressBarContainer: {
    backgroundColor: '#0C2B23',
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: colors.gold,
    borderRadius: 4,
    height: '100%',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  badge: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 12,
    width: '30.5%',
  },
  badgeUnlocked: {
    backgroundColor: '#0C2B23',
    borderColor: colors.gold,
    borderWidth: 2,
  },
  badgeLocked: {
    backgroundColor: '#091F19',
    borderColor: '#1C4C3E',
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  badgeSelected: {
    borderColor: colors.goldSoft,
    borderWidth: 2,
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeIconLocked: {
    opacity: 0.35,
  },
  badgeName: {
    color: colors.cream,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: colors.muted,
    opacity: 0.6,
  },
  badgeProgress: {
    color: colors.goldSoft,
    fontSize: 9,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginTop: 3,
  },
  detailSection: {
    backgroundColor: '#0C2B23',
    borderColor: '#1C4C3E',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 16,
    padding: 16,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  detailIcon: {
    fontSize: 32,
  },
  detailHeaderText: {
    flex: 1,
  },
  detailName: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '800',
  },
  detailCategory: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  detailDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  detailRewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  detailRewardText: {
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  detailUnlockedDate: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  detailProgressSection: {
    marginTop: 8,
  },
  detailProgressLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailProgressBar: {
    backgroundColor: '#091F19',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  detailProgressFill: {
    backgroundColor: colors.gold,
    borderRadius: 4,
    height: '100%',
  },
});
