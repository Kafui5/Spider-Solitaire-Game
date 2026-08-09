import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme';
import type { PlayerProfile } from '../game/rewards';
import type { PlayerMastery, DifficultyMastery, MasteryRank } from '../game/mastery';
import {
  MASTERY_LEVELS,
  getProgressToNextRank,
  getMasteryDisplayName,
  getMasteryIcon,
} from '../game/mastery';

interface ProfileScreenProps {
  visible: boolean;
  profile: PlayerProfile;
  mastery: PlayerMastery;
  onClose: () => void;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  '1': '1-Suit',
  '2': '2-Suit',
  '4': '4-Suit',
};

const DIFFICULTY_KEYS = ['1', '2', '4'];

function getDefaultDifficultyMastery(): DifficultyMastery {
  return {
    currentXP: 0,
    rank: 'apprentice',
    rankIndex: 0,
  };
}

function formatTime(seconds: number | null): string {
  if (seconds == null) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getLevel(totalXP: number): number {
  // Each level requires 200 XP more than the previous
  // Level 1: 0 XP, Level 2: 200 XP, Level 3: 600 XP, etc.
  let level = 1;
  let threshold = 0;
  let increment = 200;
  while (totalXP >= threshold + increment) {
    threshold += increment;
    level++;
    increment += 100;
  }
  return level;
}

export function ProfileScreen({
  visible,
  profile,
  mastery,
  onClose,
}: ProfileScreenProps) {
  if (!visible) return null;

  const winRate =
    profile.totalGamesPlayed > 0
      ? Math.round((profile.totalWins / profile.totalGamesPlayed) * 100)
      : 0;

  const level = getLevel(profile.totalXP);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WEAVER'S PROFILE</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close profile"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Thread Balance */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Silk Threads</Text>
            <Text style={styles.balanceValue}>
              🧵 {profile.silkThreads.toLocaleString()}
            </Text>
          </View>

          {/* Total XP & Level */}
          <View style={styles.xpCard}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Total XP</Text>
              <Text style={styles.xpValue}>
                {profile.totalXP.toLocaleString()}
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level {level}</Text>
            </View>
          </View>

          {/* Mastery Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mastery</Text>
            {DIFFICULTY_KEYS.map((key) => {
              const diffMastery =
                mastery.byDifficulty[key] ?? getDefaultDifficultyMastery();
              const progress = getProgressToNextRank(diffMastery);
              const icon = getMasteryIcon(diffMastery.rank);
              const rankName = getMasteryDisplayName(diffMastery.rank);

              return (
                <View key={key} style={styles.masteryRow}>
                  <View style={styles.masteryHeader}>
                    <Text style={styles.masteryDifficulty}>
                      {DIFFICULTY_LABELS[key]}
                    </Text>
                    <View style={styles.masteryRankRow}>
                      <Text style={styles.masteryIcon}>{icon}</Text>
                      <Text style={styles.masteryRankName}>{rankName}</Text>
                    </View>
                  </View>
                  {/* Progress bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progress.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress.current.toLocaleString()} /{' '}
                    {progress.required.toLocaleString()} XP
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Lifetime Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifetime Stats</Text>
            <View style={styles.statsGrid}>
              <StatCell label="Games Played" value={String(profile.totalGamesPlayed)} />
              <StatCell label="Wins" value={String(profile.totalWins)} />
              <StatCell label="Win Rate" value={`${winRate}%`} />
              <StatCell label="Current Streak" value={String(profile.currentWinStreak)} />
              <StatCell label="Best Streak" value={String(profile.bestWinStreak)} />
              <StatCell label="No Hints" value={String(profile.gamesWithoutHints)} />
              <StatCell label="No Undos" value={String(profile.gamesWithoutUndos)} />
            </View>
          </View>

          {/* Personal Bests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Bests</Text>
            {DIFFICULTY_KEYS.map((key) => {
              const bests = profile.personalBests[key];
              if (!bests) {
                return (
                  <View key={key} style={styles.personalBestRow}>
                    <Text style={styles.personalBestDifficulty}>
                      {DIFFICULTY_LABELS[key]}
                    </Text>
                    <Text style={styles.personalBestEmpty}>No records yet</Text>
                  </View>
                );
              }
              return (
                <View key={key} style={styles.personalBestRow}>
                  <Text style={styles.personalBestDifficulty}>
                    {DIFFICULTY_LABELS[key]}
                  </Text>
                  <View style={styles.personalBestStats}>
                    <View style={styles.personalBestItem}>
                      <Text style={styles.personalBestLabel}>Moves</Text>
                      <Text style={styles.personalBestValue}>
                        {bests.fewestMoves ?? '—'}
                      </Text>
                    </View>
                    <View style={styles.personalBestItem}>
                      <Text style={styles.personalBestLabel}>Time</Text>
                      <Text style={styles.personalBestValue}>
                        {formatTime(bests.fastestTime)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.felt,
    borderBottomWidth: 1,
    borderBottomColor: colors.feltLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 52,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.feltLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.cream,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: colors.felt,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  balanceLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.cream,
  },
  xpCard: {
    backgroundColor: colors.felt,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.feltLight,
  },
  xpRow: {
    flex: 1,
  },
  xpLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
    marginBottom: 2,
  },
  xpValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.goldSoft,
  },
  levelBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  masteryRow: {
    backgroundColor: colors.felt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.feltLight,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  masteryDifficulty: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
  },
  masteryRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masteryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  masteryRankName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.felt,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.feltLight,
  },
  statCell: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cream,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
    textAlign: 'center',
  },
  personalBestRow: {
    backgroundColor: colors.felt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.feltLight,
  },
  personalBestDifficulty: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: 8,
  },
  personalBestEmpty: {
    fontSize: 13,
    color: colors.muted,
    fontStyle: 'italic',
  },
  personalBestStats: {
    flexDirection: 'row',
  },
  personalBestItem: {
    marginRight: 24,
  },
  personalBestLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 2,
  },
  personalBestValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.goldSoft,
  },
});
