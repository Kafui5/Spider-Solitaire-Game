import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { rankLabel, suitSymbol, type Card } from '../game/gameEngine';
import { colors } from '../theme';

export interface AnimatingCard {
  card: Card;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
  width: number;
}

interface AnimationOverlayProps {
  cards: AnimatingCard[];
  onComplete: () => void;
}

function AnimatedCard({
  item,
  onDone,
}: {
  item: AnimatingCard;
  onDone: () => void;
}) {
  const translateX = useSharedValue(item.fromX);
  const translateY = useSharedValue(item.fromY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const duration = 280;
    translateX.value = withDelay(
      item.delay,
      withTiming(item.toX, { duration, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      item.delay,
      withTiming(item.toY, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    scale.value = withDelay(
      item.delay,
      withSequence(
        withTiming(1.08, { duration: duration * 0.4 }),
        withTiming(1, { duration: duration * 0.6 }),
      ),
    );
    // Signal completion after animation finishes
    const totalTime = item.delay + duration + 30;
    const timeout = setTimeout(() => {
      runOnJS(onDone)();
    }, totalTime);
    return () => clearTimeout(timeout);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value,
    top: translateY.value,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    zIndex: 10000,
  }));

  const height = item.width * 1.42;
  const red = item.card.suit === 'hearts' || item.card.suit === 'diamonds';

  return (
    <Animated.View style={animStyle}>
      <View
        style={[
          cardStyles.card,
          cardStyles.face,
          {
            width: item.width,
            height,
            borderRadius: Math.max(4, item.width * 0.1),
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            cardStyles.rank,
            {
              color: red ? colors.red : colors.black,
              fontSize: Math.max(10, item.width * 0.3),
            },
          ]}
        >
          {rankLabel(item.card.rank)}
        </Text>
        <Text
          style={[
            cardStyles.suit,
            {
              color: red ? colors.red : colors.black,
              fontSize: Math.max(11, item.width * 0.36),
            },
          ]}
        >
          {suitSymbol(item.card.suit)}
        </Text>
      </View>
    </Animated.View>
  );
}

export function AnimationOverlay({ cards, onComplete }: AnimationOverlayProps) {
  const completedCount = useSharedValue(0);
  const totalCards = cards.length;

  if (totalCards === 0) return null;

  const handleCardDone = () => {
    completedCount.value += 1;
    if (completedCount.value >= totalCards) {
      onComplete();
    }
  };

  return (
    <View style={styles.overlay} pointerEvents="none">
      {cards.map((item, index) => (
        <AnimatedCard
          key={`${item.card.id}-${index}`}
          item={item}
          onDone={handleCardDone}
        />
      ))}
    </View>
  );
}

/** Animation for completed K→A run: cards sweep upward and fade out */
export function RunCompleteOverlay({
  cards,
  startX,
  startY,
  cardWidth,
  onComplete,
}: {
  cards: Card[];
  startX: number;
  startY: number;
  cardWidth: number;
  onComplete: () => void;
}) {
  if (cards.length === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {cards.map((card, index) => (
        <RunCard
          key={card.id}
          card={card}
          index={index}
          startX={startX}
          startY={startY - index * 4}
          cardWidth={cardWidth}
          onDone={index === cards.length - 1 ? onComplete : undefined}
        />
      ))}
    </View>
  );
}

function RunCard({
  card,
  index,
  startX,
  startY,
  cardWidth,
  onDone,
}: {
  card: Card;
  index: number;
  startX: number;
  startY: number;
  cardWidth: number;
  onDone?: () => void;
}) {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const delay = index * 40;
    const duration = 500;

    translateY.value = withDelay(
      delay,
      withTiming(startY - 200, { duration, easing: Easing.out(Easing.quad) }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX + (index - 6) * 15, { duration }),
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.15, { duration: duration * 0.3 }),
        withTiming(0.6, { duration: duration * 0.7 }),
      ),
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.in(Easing.quad) }),
    );
    rotation.value = withDelay(
      delay,
      withTiming((index - 6) * 8, { duration }),
    );

    if (onDone) {
      const timeout = setTimeout(() => onDone(), delay + duration + 50);
      return () => clearTimeout(timeout);
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value,
    top: translateY.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
    zIndex: 10000 + index,
  }));

  const height = cardWidth * 1.42;
  const red = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <Animated.View style={animStyle}>
      <View
        style={[
          cardStyles.card,
          cardStyles.face,
          {
            width: cardWidth,
            height,
            borderRadius: Math.max(4, cardWidth * 0.1),
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            cardStyles.rank,
            {
              color: red ? colors.red : colors.black,
              fontSize: Math.max(10, cardWidth * 0.3),
            },
          ]}
        >
          {rankLabel(card.rank)}
        </Text>
        <Text
          style={[
            cardStyles.suit,
            {
              color: red ? colors.red : colors.black,
              fontSize: Math.max(11, cardWidth * 0.36),
            },
          ]}
        >
          {suitSymbol(card.suit)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  face: {
    backgroundColor: colors.paper,
    borderColor: '#D9D3C5',
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
});
