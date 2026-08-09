import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Difficulty } from '../game/gameEngine';
import {
  type GameStats,
  createDefaultStats,
  getWinRate,
  getWinRateForDifficulty,
  loadStats,
  resetStats,
} from '../game/statistics';
import { colors } from '../theme';

interface StatsScreenProps {
  visible: boolean;
  onClose: () => void;
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DifficultySection({ stats, difficulty, name }: { stats: GameStats; difficulty: Difficulty; name: string }) {
  const key = String(difficulty);
  const diffStats = stats.byDifficulty[key];

  if (!diffStats || diffStats.played === 0) {
    return (
      <View style={styles.diffSection}>
        <Text style={styles.diffTitle}>{name}</Text>
        <Text style={styles.diffEmpty}>No games played yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.diffSection}>
      <Text style={styles.diffTitle}>{name}</Text>
      <View style={styles.diffGrid}>
        <View style={styles.diffStat}>
          <Text style={styles.diffStatValue}>{diffStats.played}</Text>
          <Text style={styles.diffStatLabel}>Played</Text>
        </View>
        <View style={styles.diffStat}>
          <Text style={styles.diffStatValue}>{diffStats.won}</Text>
          <Text style={styles.diffStatLabel}>Won</Text>
        </View>
        <View style={styles.diffStat}>
          <Text style={styles.diffStatValue}>{Math.round(getWinRateForDifficulty(stats, difficulty))}%</Text>
          <Text style={styles.diffStatLabel}>Win Rate</Text>
        </View>
        <View style={styles.diffStat}>
          <Text style={styles.diffStatValue}>{formatTime(diffStats.bestTime)}</Text>
          <Text style={styles.diffStatLabel}>Best Time</Text>
        </View>
        <View style={styles.diffStat}>
          <Text style={styles.diffStatValue}>{diffStats.bestMoves ?? '—'}</Text>
          <Text style={styles.diffStatLabel}>Best Moves</Text>
        </View>
        <View style={styles.diffStat}>
          <Text style={styles.diffStatValue}>{diffStats.averageMoves ? Math.round(diffStats.averageMoves) : '—'}</Text>
          <Text style={styles.diffStatLabel}>Avg Moves</Text>
        </View>
      </View>
    </View>
  );
}

export function StatsScreen({ visible, onClose }: StatsScreenProps) {
  const [stats, setStats] = useState<GameStats>(createDefaultStats());

  useEffect(() => {
    if (visible) {
      loadStats().then(setStats).catch(() => undefined);
    }
  }, [visible]);

  const handleReset = () => {
    Alert.alert(
      'Reset statistics?',
      'This cannot be undone. All your game history will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetStats().then(setStats).catch(() => undefined);
          },
        },
      ],
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
          <View style={styles.header}>
            <Text style={styles.title}>STATISTICS</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Overall stats */}
            <View style={styles.overallSection}>
              <View style={styles.bigStats}>
                <View style={styles.bigStat}>
                  <Text style={styles.bigValue}>{stats.totalGames}</Text>
                  <Text style={styles.bigLabel}>GAMES</Text>
                </View>
                <View style={styles.bigStat}>
                  <Text style={styles.bigValue}>{stats.wins}</Text>
                  <Text style={styles.bigLabel}>WINS</Text>
                </View>
                <View style={styles.bigStat}>
                  <Text style={[styles.bigValue, { color: colors.gold }]}>
                    {stats.totalGames > 0 ? `${Math.round(getWinRate(stats))}%` : '—'}
                  </Text>
                  <Text style={styles.bigLabel}>WIN RATE</Text>
                </View>
              </View>

              <View style={styles.streakRow}>
                <View style={styles.streakItem}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <View>
                    <Text style={styles.streakValue}>{stats.currentStreak}</Text>
                    <Text style={styles.streakLabel}>Current Streak</Text>
                  </View>
                </View>
                <View style={styles.streakItem}>
                  <Text style={styles.streakIcon}>⭐</Text>
                  <View>
                    <Text style={styles.streakValue}>{stats.bestStreak}</Text>
                    <Text style={styles.streakLabel}>Best Streak</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Per-difficulty breakdown */}
            <DifficultySection stats={stats} difficulty={1} name="Calm — 1 Suit" />
            <DifficultySection stats={stats} difficulty={2} name="Clever — 2 Suits" />
            <DifficultySection stats={stats} difficulty={4} name="Master — 4 Suits" />

            {/* Reset button */}
            <Pressable onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset Statistics</Text>
            </Pressable>
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
    maxHeight: 680,
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
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overallSection: {
    paddingVertical: 20,
  },
  bigStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  bigStat: {
    alignItems: 'center',
  },
  bigValue: {
    color: colors.cream,
    fontSize: 32,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  bigLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  streakRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  streakItem: {
    alignItems: 'center',
    backgroundColor: '#0C2B23',
    borderColor: '#1C4C3E',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  streakIcon: {
    fontSize: 20,
  },
  streakValue: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '900',
  },
  streakLabel: {
    color: colors.muted,
    fontSize: 10,
  },
  diffSection: {
    borderTopColor: '#1C4C3E',
    borderTopWidth: 1,
    paddingVertical: 16,
  },
  diffTitle: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  diffEmpty: {
    color: colors.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  diffGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diffStat: {
    alignItems: 'center',
    backgroundColor: '#0C2B23',
    borderRadius: 8,
    minWidth: '30%',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  diffStatValue: {
    color: colors.cream,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  diffStatLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  statValue: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  resetButton: {
    alignSelf: 'center',
    borderColor: colors.red,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resetText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '700',
  },
});
