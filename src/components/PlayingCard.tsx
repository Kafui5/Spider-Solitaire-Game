import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { rankLabel, suitSymbol, type Card } from '../game/gameEngine';
import { colors } from '../theme';

interface PlayingCardProps {
  card: Card;
  width: number;
  selected?: boolean;
  hinted?: boolean;
  onPress: () => void;
}

interface CardFaceProps {
  card: Card;
  width: number;
  selected?: boolean;
  hinted?: boolean;
}

/** Pure display component for card rendering — no touch handling */
export function CardFace({ card, width, selected, hinted }: CardFaceProps) {
  const height = width * 1.42;
  const red = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={
        card.faceUp ? `${rankLabel(card.rank)} of ${card.suit}` : 'Face-down card'
      }
      style={[
        styles.card,
        { width, height, borderRadius: Math.max(4, width * 0.1) },
        card.faceUp ? styles.face : styles.back,
        selected && styles.selected,
        hinted && styles.hinted,
      ]}
    >
      {card.faceUp ? (
        <>
          <Text
            numberOfLines={1}
            style={[
              styles.rank,
              { color: red ? colors.red : colors.black, fontSize: Math.max(10, width * 0.3) },
            ]}
          >
            {rankLabel(card.rank)}
          </Text>
          <Text
            style={[
              styles.suit,
              { color: red ? colors.red : colors.black, fontSize: Math.max(11, width * 0.36) },
            ]}
          >
            {suitSymbol(card.suit)}
          </Text>
        </>
      ) : (
        <View style={styles.wovenInset}>
          <View style={styles.wovenRow}>
            <View style={[styles.diamond, { backgroundColor: colors.gold }]} />
            <View style={[styles.diamond, { backgroundColor: colors.clay }]} />
          </View>
          <View style={styles.wovenRow}>
            <View style={[styles.diamond, { backgroundColor: colors.clay }]} />
            <View style={[styles.diamond, { backgroundColor: colors.gold }]} />
          </View>
        </View>
      )}
    </View>
  );
}

function PlayingCardView({ card, width, selected, hinted, onPress }: PlayingCardProps) {
  const height = width * 1.42;
  const red = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        card.faceUp ? `${rankLabel(card.rank)} of ${card.suit}` : 'Face-down card'
      }
      onPress={onPress}
      style={[
        styles.card,
        { width, height, borderRadius: Math.max(4, width * 0.1) },
        card.faceUp ? styles.face : styles.back,
        selected && styles.selected,
        hinted && styles.hinted,
      ]}
    >
      {card.faceUp ? (
        <>
          <Text
            numberOfLines={1}
            style={[
              styles.rank,
              { color: red ? colors.red : colors.black, fontSize: Math.max(10, width * 0.3) },
            ]}
          >
            {rankLabel(card.rank)}
          </Text>
          <Text
            style={[
              styles.suit,
              { color: red ? colors.red : colors.black, fontSize: Math.max(11, width * 0.36) },
            ]}
          >
            {suitSymbol(card.suit)}
          </Text>
        </>
      ) : (
        <View style={styles.wovenInset}>
          <View style={styles.wovenRow}>
            <View style={[styles.diamond, { backgroundColor: colors.gold }]} />
            <View style={[styles.diamond, { backgroundColor: colors.clay }]} />
          </View>
          <View style={styles.wovenRow}>
            <View style={[styles.diamond, { backgroundColor: colors.clay }]} />
            <View style={[styles.diamond, { backgroundColor: colors.gold }]} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

export const PlayingCard = memo(PlayingCardView);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  face: {
    backgroundColor: colors.paper,
    borderColor: '#D9D3C5',
  },
  back: {
    alignItems: 'center',
    backgroundColor: colors.indigo,
    borderColor: colors.goldSoft,
    justifyContent: 'center',
  },
  selected: {
    borderColor: colors.gold,
    borderWidth: 3,
    transform: [{ translateY: -3 }],
  },
  hinted: {
    borderColor: colors.success,
    borderWidth: 3,
  },
  rank: {
    fontWeight: '800',
    left: 3,
    letterSpacing: -1,
    lineHeight: 18,
    position: 'absolute',
    top: 1,
  },
  suit: {
    bottom: 1,
    position: 'absolute',
    right: 3,
  },
  wovenInset: {
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    height: '80%',
    justifyContent: 'center',
    padding: 3,
    width: '72%',
  },
  wovenRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 2,
  },
  diamond: {
    height: 7,
    transform: [{ rotate: '45deg' }],
    width: 7,
  },
});
