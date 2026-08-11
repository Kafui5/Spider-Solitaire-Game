import { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface IllegalMoveFeedbackProps {
  column: number | null;
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
  const lastColumn = useRef<number>(0);

  if (column !== null) {
    lastColumn.current = column;
  }

  useEffect(() => {
    if (column === null) return;

    shakeX.value = withSequence(
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(2, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );

    flashOpacity.value = withSequence(
      withTiming(0.35, { duration: 80 }),
      withTiming(0, { duration: 300 }),
    );

    const timeout = setTimeout(onDismiss, 400);
    return () => clearTimeout(timeout);
  }, [column]);

  const left = columnLeft(lastColumn.current);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left,
    top: 0,
    width: columnWidth,
    height: boardHeight,
    transform: [{ translateX: shakeX.value }],
    backgroundColor: `rgba(181, 49, 60, ${flashOpacity.value})`,
    borderRadius: 8,
    zIndex: 8000,
  }));

  // Always render — invisible when no flash
  return (
    <Animated.View style={animStyle} pointerEvents="none" />
  );
}
