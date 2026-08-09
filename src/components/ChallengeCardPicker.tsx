import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { getAvailableChallenges, type ChallengeCard } from '../game/challengeCards';
import type { Difficulty } from '../game/gameEngine';
import { colors } from '../theme';

interface ChallengeCardPickerProps {
  visible: boolean;
  difficulty: Difficulty;
  onSelect: (card: ChallengeCard) => void;
  onSkip: () => void;
}

const DIFFICULTY_COLORS: Record<ChallengeCard['difficulty'], string> = {
  easy: colors.success,
  medium: colors.gold,
  hard: colors.clay,
};

export function ChallengeCardPicker({
  visible,
  difficulty,
  onSelect,
  onSkip,
}: ChallengeCardPickerProps) {
  const [challenges, setChallenges] = useState<ChallengeCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setChallenges(getAvailableChallenges(difficulty));
      setSelectedId(null);
    }
  }, [visible, difficulty]);

  const selectedCard = challenges.find((c) => c.id === selectedId) ?? null;

  const handleAccept = () => {
    if (selectedCard) {
      onSelect(selectedCard);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <Text style={styles.title}>OPTIONAL CHALLENGE</Text>
          <Text style={styles.subtitle}>
            Pick a challenge for bonus rewards, or skip to play freely
          </Text>

          {/* Challenge Cards Row */}
          <View style={styles.cardsRow}>
            {challenges.map((card) => {
              const isSelected = card.id === selectedId;
              const badgeColor = DIFFICULTY_COLORS[card.difficulty];

              return (
                <Pressable
                  key={card.id}
                  onPress={() => setSelectedId(card.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Challenge: ${card.name}. ${card.description}. Bonus: ${card.bonusThreads} threads and ${card.bonusXP} XP`}
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.card,
                    isSelected && styles.cardSelected,
                    pressed && !isSelected && styles.cardPressed,
                  ]}
                >
                  {/* Difficulty Badge */}
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>{card.difficulty}</Text>
                  </View>

                  {/* Icon */}
                  <Text style={styles.cardIcon}>{card.icon}</Text>

                  {/* Name */}
                  <Text
                    style={[styles.cardName, isSelected && styles.cardNameSelected]}
                    numberOfLines={1}
                  >
                    {card.name}
                  </Text>

                  {/* Description */}
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {card.description}
                  </Text>

                  {/* Rewards */}
                  <View style={styles.rewardsRow}>
                    <Text style={styles.rewardText}>
                      +{card.bonusThreads} 🧵
                    </Text>
                    <Text style={styles.rewardText}>
                      +{card.bonusXP} XP
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <Pressable
              onPress={handleAccept}
              disabled={!selectedCard}
              accessibilityRole="button"
              accessibilityLabel="Accept challenge"
              accessibilityState={{ disabled: !selectedCard }}
              style={({ pressed }) => [
                styles.acceptButton,
                !selectedCard && styles.acceptButtonDisabled,
                pressed && selectedCard && styles.acceptButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.acceptText,
                  !selectedCard && styles.acceptTextDisabled,
                ]}
              >
                Accept Challenge
              </Text>
            </Pressable>

            <Pressable
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel="Skip challenge selection"
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.skipButtonPressed,
              ]}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.feltLight,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 420,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 28,
    width: '100%',
  },
  title: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 28,
    width: '100%',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.felt,
    borderColor: 'transparent',
    borderRadius: 14,
    borderWidth: 2,
    flex: 1,
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 18,
  },
  cardSelected: {
    backgroundColor: colors.feltLight,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardPressed: {
    backgroundColor: colors.feltLight,
    opacity: 0.9,
  },
  badge: {
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardName: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardNameSelected: {
    color: colors.goldSoft,
  },
  cardDescription: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  rewardsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  rewardText: {
    color: colors.goldSoft,
    fontSize: 10,
    fontWeight: '600',
  },
  buttonsRow: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  acceptButton: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: colors.felt,
    borderColor: colors.feltLight,
    borderWidth: 1,
  },
  acceptButtonPressed: {
    backgroundColor: colors.goldSoft,
  },
  acceptText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  acceptTextDisabled: {
    color: colors.muted,
    opacity: 0.5,
  },
  skipButton: {
    borderColor: colors.muted,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  skipButtonPressed: {
    backgroundColor: colors.felt,
  },
  skipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
