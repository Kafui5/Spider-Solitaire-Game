import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';
import type { GameReward, GamePerformance } from '../game/rewards';
import type { Achievement } from '../game/achievements';
import type { MasteryRank } from '../game/mastery';
import type { ChallengeCard } from '../game/challengeCards';

interface RewardSummaryProps {
  visible: boolean;
  reward: GameReward;
  performance: GamePerformance;
  newAchievements: Array<{ achievement: Achievement }>;
  masteryRank: MasteryRank;
  galleryContributions: Array<{
    artworkId: string;
    threads: number;
    artworkCompleted: boolean;
  }>;
  challengeCompleted: boolean;
  challengeCard: ChallengeCard | null;
  onClose: () => void;
}

/**
 * Animated counter that counts from 0 to `target` over `duration` ms.
 * Uses requestAnimationFrame to sync with the reanimated shared value.
 */
function AnimatedCounter({
  target,
  duration = 1500,
  delay = 300,
  prefix = '',
  suffix = '',
  style,
  active,
}: {
  target: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  style?: object;
  active: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      setDisplay(0);
      return;
    }

    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );

    // Poll the shared value on JS thread for display
    let frameId: number;
    let startTime: number | null = null;

    const update = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < delay) {
        setDisplay(0);
        frameId = requestAnimationFrame(update);
        return;
      }

      const animElapsed = elapsed - delay;
      const t = Math.min(1, animElapsed / duration);
      // Cubic ease out
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));

      if (t < 1) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [active, target]);

  return (
    <Animated.View>
      <Text style={style}>
        {prefix}
        {display.toLocaleString()}
        {suffix}
      </Text>
    </Animated.View>
  );
}

export function RewardSummary({
  visible,
  reward,
  performance,
  newAchievements,
  masteryRank,
  galleryContributions,
  challengeCompleted,
  challengeCard,
  onClose,
}: RewardSummaryProps) {
  const overlayOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(60);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      contentTranslateY.value = withDelay(
        100,
        withTiming(0, { duration: 500, easing: Easing.out(Easing.back(1.2)) }),
      );
    } else {
      overlayOpacity.value = 0;
      contentTranslateY.value = 60;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const formatRecordType = useCallback((type: string): string => {
    switch (type) {
      case 'fewest_moves':
        return 'Fewest Moves';
      case 'fastest_time':
        return 'Fastest Time';
      case 'longest_streak':
        return 'Longest Streak';
      case 'no_hints':
        return 'Games Without Hints';
      case 'no_undos':
        return 'Games Without Undo';
      default:
        return type;
    }
  }, []);

  const formatRecordValue = useCallback((type: string, value: number): string => {
    if (type === 'fastest_time') {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return String(value);
  }, []);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.content, contentStyle]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Text style={styles.header}>GAME COMPLETE</Text>

            {/* Big XP Counter */}
            <View style={styles.bigCounterRow}>
              <AnimatedCounter
                target={reward.totalXP}
                prefix="+"
                suffix=" XP"
                style={styles.bigXPText}
                delay={400}
                active={visible}
              />
            </View>

            {/* Big Threads Counter */}
            <View style={styles.bigCounterRow}>
              <AnimatedCounter
                target={reward.totalThreads}
                prefix="+"
                suffix=" 🧵"
                style={styles.bigThreadsText}
                delay={600}
                active={visible}
              />
            </View>

            {/* Breakdown Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breakdown</Text>

              {/* Base reward */}
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Base reward</Text>
                <Text style={styles.breakdownValue}>
                  {reward.baseXP} XP, {reward.baseThreads} threads
                </Text>
              </View>

              {/* Streak multiplier */}
              {reward.streakMultiplier > 1 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabelGold}>
                    Streak ×{reward.streakMultiplier}
                  </Text>
                  <Text style={styles.breakdownValueGold}>🔥</Text>
                </View>
              )}

              {/* Efficiency rating */}
              {(reward.efficiencyRating === 'perfect' ||
                reward.efficiencyRating === 'excellent') && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabelGold}>
                    Efficiency: {reward.efficiencyRating}
                  </Text>
                  <Text style={styles.breakdownValueGold}>
                    +{reward.efficiencyRating === 'perfect' ? 20 : 10} 🧵
                  </Text>
                </View>
              )}

              {/* No hints bonus */}
              {performance.usedHints === 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>No hints</Text>
                  <Text style={styles.breakdownValueSuccess}>+15% XP</Text>
                </View>
              )}

              {/* No undo bonus */}
              {performance.usedUndos === 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>No undo</Text>
                  <Text style={styles.breakdownValueSuccess}>+15% XP</Text>
                </View>
              )}

              {/* Undo cost */}
              {reward.undoCost > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Undo cost</Text>
                  <Text style={styles.breakdownValueRed}>-{reward.undoCost} 🧵</Text>
                </View>
              )}
            </View>

            {/* Personal Records */}
            {reward.personalRecords.length > 0 && (
              <View style={styles.section}>
                {reward.personalRecords.map((record) => (
                  <View key={record.type} style={styles.recordRow}>
                    <Text style={styles.recordText}>
                      🏆 NEW RECORD: {formatRecordType(record.type)} -{' '}
                      {formatRecordValue(record.type, record.value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Achievements */}
            {newAchievements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Achievements Unlocked</Text>
                {newAchievements.map(({ achievement }) => (
                  <View key={achievement.id} style={styles.achievementRow}>
                    <View style={styles.achievementBadge}>
                      <Text style={styles.achievementIcon}>
                        {achievement.icon}
                      </Text>
                    </View>
                    <Text style={styles.achievementName}>
                      {achievement.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Challenge Card Result */}
            {challengeCompleted && challengeCard != null && (
              <View style={styles.section}>
                <View style={styles.challengeRow}>
                  <Text style={styles.challengeText}>
                    ✓ {challengeCard.name} +{challengeCard.bonusThreads} 🧵
                  </Text>
                </View>
              </View>
            )}

            {/* Gallery Contributions */}
            {galleryContributions.length > 0 && (
              <View style={styles.section}>
                {galleryContributions.map((contribution) => (
                  <View key={contribution.artworkId} style={styles.galleryRow}>
                    <Text style={styles.galleryText}>
                      🎨 Thread contributed to {contribution.artworkId}
                      {contribution.artworkCompleted ? ' (Completed!)' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Continue Button */}
            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed,
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 15, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    backgroundColor: colors.felt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
  },
  bigCounterRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  bigXPText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.goldSoft,
    textAlign: 'center',
  },
  bigThreadsText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.feltLight,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 15,
    color: colors.cream,
  },
  breakdownLabelGold: {
    fontSize: 15,
    color: colors.gold,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 15,
    color: colors.muted,
  },
  breakdownValueGold: {
    fontSize: 15,
    color: colors.gold,
    fontWeight: '600',
  },
  breakdownValueSuccess: {
    fontSize: 15,
    color: colors.success,
    fontWeight: '600',
  },
  breakdownValueRed: {
    fontSize: 15,
    color: colors.red,
    fontWeight: '600',
  },
  recordRow: {
    paddingVertical: 6,
  },
  recordText: {
    fontSize: 15,
    color: colors.goldSoft,
    fontWeight: '600',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementIcon: {
    fontSize: 18,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.cream,
  },
  challengeRow: {
    paddingVertical: 6,
  },
  challengeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },
  galleryRow: {
    paddingVertical: 6,
  },
  galleryText: {
    fontSize: 14,
    color: colors.cream,
  },
  continueButton: {
    marginTop: 28,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonPressed: {
    opacity: 0.8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.5,
  },
});
