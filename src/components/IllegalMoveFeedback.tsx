import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';

interface IllegalMoveFeedbackProps {
  /** Column index where the illegal drop happened, or null if no feedback */
  column: number | null;
  /** Board layout info */
  columnLeft: (col: number) => number;
  columnWidth: number;
  boardHeight: number;
  onDismiss: () => void;
}

export function IllegalMoveFeedback({
  column,
  columnLeft,
  columnWidth,
  boardHeight,
  onDismiss,
}: IllegalMoveFeedbackProps) {
  const shakeX = useSharedValue(0);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (column === null) return;

    // Shake animation
    shakeX.value = withSequence(
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(2, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );

    // Red flash
    flashOpacity.value = withSequence(
      withTiming(0.35, { duration: 80 }),
      withTiming(0, { duration: 300 }),
    );

    const timeout = setTimeout(() => {
      onDismiss();
    }, 400);
    return () => clearTimeout(timeout);
  }, [column]);

  if (column === null) return null;

  const left = columnLeft(column);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: left,
    top: 0,
    width: columnWidth,
    height: boardHeight,
    transform: [{ translateX: shakeX.value }],
    backgroundColor: `rgba(181, 49, 60, ${flashOpacity.value})`,
    borderRadius: 8,
    zIndex: 8000,
  }));

  return (
    <Animated.View style={animStyle} pointerEvents="none" />
  );
}
