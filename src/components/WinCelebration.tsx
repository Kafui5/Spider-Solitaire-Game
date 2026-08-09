import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';

interface WinCelebrationProps {
  visible: boolean;
  onComplete: () => void;
}

interface ParticleConfig {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  shape: 'circle' | 'diamond';
  delay: number;
}

const PARTICLE_COUNT = 50;
const DURATION = 2000;
const PARTICLE_COLORS = [colors.gold, colors.goldSoft, colors.cream, colors.clay, colors.success];

function generateParticles(): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.4,
    distance: 80 + Math.random() * 160,
    size: 4 + Math.random() * 8,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    shape: i % 3 === 0 ? 'diamond' : 'circle',
    delay: Math.random() * 200,
  }));
}

export function WinCelebration({ visible, onComplete }: WinCelebrationProps) {
  const particles = useMemo(generateParticles, []);

  if (!visible) return null;

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} config={p} onComplete={p.id === 0 ? onComplete : undefined} />
      ))}
    </Animated.View>
  );
}

interface ParticleProps {
  config: ParticleConfig;
  onComplete?: () => void;
}

function Particle({ config, onComplete }: ParticleProps) {
  const progress = useSharedValue(0);
  const { width: screenW, height: screenH } = Dimensions.get('window');
  const cx = screenW / 2;
  const cy = screenH / 2;

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      config.delay,
      withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    // Horizontal: outward based on angle
    const x = cx + Math.cos(config.angle) * config.distance * t - config.size / 2;
    // Vertical: outward + gravity pull
    const gravity = 120 * t * t;
    const y = cy + Math.sin(config.angle) * config.distance * t + gravity - config.size / 2;
    // Fade out in the second half
    const opacity = t < 0.5 ? 1 : 1 - (t - 0.5) * 2;
    // Scale: start large, shrink
    const scale = 1 - t * 0.4;

    return {
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      transform: [
        { scale },
        { rotate: config.shape === 'diamond' ? '45deg' : '0deg' },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          borderRadius: config.shape === 'circle' ? config.size / 2 : 1,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
});
