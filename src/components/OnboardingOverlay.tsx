import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../theme';

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

interface Slide {
  title: string;
  body: string;
  visual: string;
}

const slides: Slide[] = [
  {
    title: 'Welcome to Silk Spider',
    body: 'Tap a card or group of same-suit cards in descending order to select them.',
    visual: '♠',
  },
  {
    title: 'Move to Build',
    body: 'Tap a destination column to place your cards. Build descending sequences.',
    visual: '↕',
  },
  {
    title: 'Complete Runs',
    body: 'Build full King-to-Ace same-suit runs to clear them. Complete all 8 to win!',
    visual: '✨',
  },
];

export function OnboardingOverlay({ visible, onComplete }: OnboardingOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentSlide, onComplete]);

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          key={currentSlide}
          entering={FadeIn.duration(400)}
          style={styles.card}
        >
          <View style={styles.visualContainer}>
            {currentSlide === 0 && <SlideOneVisual />}
            {currentSlide === 1 && <SlideTwoVisual />}
            {currentSlide === 2 && <SlideThreeVisual />}
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </Animated.View>

        <View style={styles.navigation}>
          <View style={styles.dots}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isLastSlide ? 'Start Playing' : 'Next'}
          >
            <Text style={styles.buttonText}>
              {isLastSlide ? 'Start Playing' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SlideOneVisual() {
  return (
    <View style={styles.visualInner}>
      <Text style={styles.bigIcon}>♠</Text>
      <View style={styles.tapIndicator}>
        <Text style={styles.tapIcon}>👆</Text>
      </View>
    </View>
  );
}

function SlideTwoVisual() {
  return (
    <View style={styles.visualInner}>
      <View style={styles.columnVisual}>
        <View style={styles.miniCard}>
          <Text style={styles.miniCardText}>7♠</Text>
        </View>
      </View>
      <Text style={styles.arrowIcon}>→</Text>
      <View style={styles.columnVisual}>
        <View style={styles.miniCard}>
          <Text style={styles.miniCardText}>8♠</Text>
        </View>
        <View style={[styles.miniCard, styles.miniCardOverlap]}>
          <Text style={styles.miniCardText}>7♠</Text>
        </View>
      </View>
    </View>
  );
}

function SlideThreeVisual() {
  return (
    <View style={styles.visualInner}>
      <Text style={styles.sequenceText}>K → Q → J → ... → 2 → A</Text>
      <Text style={styles.sparkleIcon}>✨</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 24, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.felt,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold + '30',
  },
  visualContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  visualInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigIcon: {
    fontSize: 72,
    color: colors.cream,
  },
  tapIndicator: {
    position: 'absolute',
    bottom: -8,
    right: -12,
  },
  tapIcon: {
    fontSize: 28,
  },
  columnVisual: {
    alignItems: 'center',
  },
  miniCard: {
    backgroundColor: colors.cream,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  miniCardOverlap: {
    marginTop: -4,
  },
  miniCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  arrowIcon: {
    fontSize: 32,
    color: colors.gold,
    marginHorizontal: 16,
  },
  sequenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.goldSoft,
    letterSpacing: 0.5,
  },
  sparkleIcon: {
    fontSize: 32,
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigation: {
    marginTop: 36,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.gold,
  },
  dotInactive: {
    backgroundColor: colors.muted,
    opacity: 0.4,
  },
  button: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
});
