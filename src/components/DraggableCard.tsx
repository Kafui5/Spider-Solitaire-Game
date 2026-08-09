import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { Card } from '../game/gameEngine';
import { CardFace } from './PlayingCard';

interface DraggableCardProps {
  card: Card;
  width: number;
  selected?: boolean;
  hinted?: boolean;
  columnIndex: number;
  cardIndex: number;
  isMovable: boolean;
  onTap: () => void;
  onDragStart: (columnIndex: number, cardIndex: number) => void;
  onDragEnd: (
    fromColumn: number,
    cardIndex: number,
    translationX: number,
    success: (didMove: boolean) => void,
  ) => void;
}

function DraggableCardView({
  card,
  width,
  selected,
  hinted,
  columnIndex,
  cardIndex,
  isMovable,
  onTap,
  onDragStart,
  onDragEnd,
}: DraggableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .enabled(isMovable)
    .activateAfterLongPress(0)
    .minDistance(8)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
      runOnJS(onDragStart)(columnIndex, cardIndex);
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      'worklet';
      const finalTranslationX = event.translationX;

      const handleResult = (didMove: boolean) => {
        if (!didMove) {
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
          translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        } else {
          translateX.value = 0;
          translateY.value = 0;
        }
        isDragging.value = false;
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      };

      runOnJS(onDragEnd)(columnIndex, cardIndex, finalTranslationX, handleResult);
    })
    .onFinalize(() => {
      'worklet';
      if (isDragging.value) {
        isDragging.value = false;
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    'worklet';
    runOnJS(onTap)();
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: isDragging.value ? 9999 : 0,
      elevation: isDragging.value ? 12 : 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isDragging.value ? 8 : 0 },
      shadowOpacity: isDragging.value ? 0.4 : 0,
      shadowRadius: isDragging.value ? 12 : 0,
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <CardFace
          card={card}
          width={width}
          selected={selected}
          hinted={hinted}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export const DraggableCard = memo(DraggableCardView);

const styles = StyleSheet.create({
  wrapper: {
    // Wrapper just for animation — no extra layout
  },
});
