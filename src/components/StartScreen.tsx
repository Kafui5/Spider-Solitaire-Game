import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Difficulty, GameState } from '../game/gameEngine';
import {
  type DailyChallenge,
  getTodaysChallenge,
  isTodayChallengeCompleted,
} from '../game/dailyChallenge';
import { colors } from '../theme';

interface StartScreenProps {
  savedGame: GameState | null;
  onStart: (difficulty: Difficulty) => void;
  onContinue: () => void;
  onDailyChallenge: (challenge: DailyChallenge) => void;
  onShowStats: () => void;
  onShowCardBacks: () => void;
  onShowProfile?: () => void;
  onShowAchievements?: () => void;
  onShowGallery?: () => void;
  onShowShop?: () => void;
  onShowUpgrade?: () => void;
  onShowTipJar?: () => void;
  threadBalance?: number;
  isPremium?: boolean;
}

const levels: Array<{ difficulty: Difficulty; name: string; note: string }> = [
  { difficulty: 1, name: 'Calm', note: '1 suit · a gentle start' },
  { difficulty: 2, name: 'Clever', note: '2 suits · balanced strategy' },
  { difficulty: 4, name: 'Master', note: '4 suits · the full challenge' },
];

const difficultyNames: Record<number, string> = { 1: '1 suit', 2: '2 suits', 4: '4 suits' };

export function StartScreen({
  savedGame,
  onStart,
  onContinue,
  onDailyChallenge,
  onShowStats,
  onShowCardBacks,
  onShowProfile,
  onShowAchievements,
  onShowGallery,
  onShowShop,
  onShowUpgrade,
  onShowTipJar,
  threadBalance,
  isPremium: premium,
}: StartScreenProps) {
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [todayChallenge] = useState(() => getTodaysChallenge());

  useEffect(() => {
    isTodayChallengeCompleted().then(setDailyCompleted).catch(() => undefined);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.pattern}>
        {[colors.gold, colors.clay, colors.indigo, colors.gold, colors.clay].map(
          (color, index) => (
            <View key={`${color}-${index}`} style={[styles.patternBar, { backgroundColor: color }]} />
          ),
        )}
      </View>

      <View style={styles.mark}>
        <Text style={styles.markSymbol}>♠</Text>
      </View>
      <Text style={styles.eyebrow}>A CLASSIC, REWOVEN</Text>
      <Text style={styles.title}>Silk Spider</Text>
      <Text style={styles.subtitle}>Solitaire</Text>
      <Text style={styles.description}>
        Quiet strategy, beautiful cards, and no rush. Build eight complete runs from king to ace.
      </Text>

      {/* Daily Challenge */}
      <Pressable
        onPress={() => onDailyChallenge(todayChallenge)}
        style={[styles.dailyButton, dailyCompleted && styles.dailyCompleted]}
      >
        <View style={styles.dailyLeft}>
          <Text style={styles.dailyIcon}>{dailyCompleted ? '✓' : '☀'}</Text>
        </View>
        <View style={styles.dailyCopy}>
          <Text style={styles.dailyTitle}>
            {dailyCompleted ? 'Daily Complete!' : "Today's Challenge"}
          </Text>
          <Text style={styles.dailyMeta}>
            {difficultyNames[todayChallenge.difficulty]} ·{' '}
            {dailyCompleted ? 'Come back tomorrow' : 'Same deal for everyone'}
          </Text>
        </View>
        {!dailyCompleted && <Text style={styles.dailyArrow}>›</Text>}
      </Pressable>

      {savedGame && savedGame.status === 'playing' ? (
        <Pressable onPress={onContinue} style={styles.continueButton}>
          <Text style={styles.continueText}>Continue game</Text>
          <Text style={styles.continueMeta}>
            {savedGame.difficulty} suit{savedGame.difficulty > 1 ? 's' : ''} · {savedGame.moves} moves
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.choose}>CHOOSE A NEW GAME</Text>
      <View style={styles.levels}>
        {levels.map((level) => {
          const locked = !premium && level.difficulty === 4;
          return (
            <Pressable
              key={level.difficulty}
              onPress={() => locked ? onShowUpgrade?.() : onStart(level.difficulty)}
              style={({ pressed }) => [styles.levelButton, pressed && styles.pressed, locked && styles.levelLocked]}
            >
              <View style={styles.suitPips}>
                {Array.from({ length: level.difficulty }, (_, index) => (
                  <Text key={index} style={styles.pip}>♠</Text>
                ))}
              </View>
              <View style={styles.levelCopy}>
                <Text style={styles.levelName}>{level.name}{locked ? ' 🔒' : ''}</Text>
                <Text style={styles.levelNote}>{locked ? '3 free trials · Full Weaver unlocks' : level.note}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom action row */}
      <View style={styles.bottomRow}>
        <Pressable onPress={onShowProfile} style={styles.bottomButton}>
          <Text style={styles.bottomIcon}>♛</Text>
          <Text style={styles.bottomLabel}>Profile</Text>
        </Pressable>
        <Pressable onPress={onShowAchievements} style={styles.bottomButton}>
          <Text style={styles.bottomIcon}>🏆</Text>
          <Text style={styles.bottomLabel}>Badges</Text>
        </Pressable>
        <Pressable onPress={onShowGallery} style={styles.bottomButton}>
          <Text style={styles.bottomIcon}>🎨</Text>
          <Text style={styles.bottomLabel}>Gallery</Text>
        </Pressable>
        <Pressable onPress={onShowShop} style={styles.bottomButton}>
          <Text style={styles.bottomIcon}>🧵</Text>
          <Text style={styles.bottomLabel}>Shop</Text>
        </Pressable>
        <Pressable onPress={onShowStats} style={styles.bottomButton}>
          <Text style={styles.bottomIcon}>📊</Text>
          <Text style={styles.bottomLabel}>Stats</Text>
        </Pressable>
      </View>

      {/* Upgrade / Supporter row */}
      {!premium && (
        <Pressable onPress={onShowUpgrade} style={styles.upgradeButton}>
          <Text style={styles.upgradeText}>🕷️ Unlock Full Weaver</Text>
        </Pressable>
      )}
      <Pressable onPress={onShowTipJar} style={styles.tipButton}>
        <Text style={styles.tipButtonText}>🎁 Supporter Packs</Text>
      </Pressable>

      <Text style={styles.offline}>Plays completely offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  pattern: {
    flexDirection: 'row',
    height: 7,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  patternBar: { flex: 1 },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginTop: 20,
    width: 64,
  },
  markSymbol: { color: colors.background, fontSize: 34, fontWeight: '900' },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
    marginTop: 18,
  },
  title: { color: colors.cream, fontSize: 42, fontWeight: '800', marginTop: 4 },
  subtitle: {
    color: colors.muted,
    fontSize: 19,
    letterSpacing: 7,
    marginLeft: 7,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    marginTop: 14,
    maxWidth: 440,
    textAlign: 'center',
  },
  // Daily Challenge
  dailyButton: {
    alignItems: 'center',
    backgroundColor: '#0C2B23',
    borderColor: colors.gold,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: 440,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
  },
  dailyCompleted: {
    borderColor: colors.success,
    opacity: 0.8,
  },
  dailyLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  dailyIcon: {
    fontSize: 22,
  },
  dailyCopy: { flex: 1 },
  dailyTitle: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '800',
  },
  dailyMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  dailyArrow: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: '300',
  },
  // Continue
  continueButton: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    marginBottom: 8,
    maxWidth: 440,
    paddingHorizontal: 18,
    paddingVertical: 13,
    width: '100%',
  },
  continueText: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  continueMeta: { color: '#59461F', fontSize: 12, marginTop: 2 },
  choose: {
    alignSelf: 'center',
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 8,
    marginTop: 16,
  },
  levels: { gap: 8, maxWidth: 440, width: '100%' },
  levelButton: {
    alignItems: 'center',
    backgroundColor: '#0C2B23',
    borderColor: '#1C4C3E',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 62,
    paddingHorizontal: 14,
  },
  pressed: { backgroundColor: colors.feltLight },
  suitPips: { flexDirection: 'row', minWidth: 65 },
  pip: { color: colors.gold, fontSize: 16, marginRight: 1 },
  levelCopy: { flex: 1 },
  levelName: { color: colors.cream, fontSize: 16, fontWeight: '800' },
  levelNote: { color: colors.muted, fontSize: 12, marginTop: 2 },
  arrow: { color: colors.gold, fontSize: 28, fontWeight: '300' },
  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 18,
  },
  bottomButton: {
    alignItems: 'center',
    gap: 4,
  },
  bottomIcon: {
    fontSize: 22,
  },
  bottomLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  offline: { color: '#6F9185', fontSize: 11, marginTop: 14 },
  levelLocked: { opacity: 0.55 },
  upgradeButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  upgradeText: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  tipButton: {
    alignItems: 'center',
    borderColor: '#1C4C3E',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tipButtonText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
