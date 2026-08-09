import { useCallback } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme';
import type { ShareResult } from '../game/shareResults';

interface ShareCardProps {
  visible: boolean;
  result: ShareResult | null;
  onClose: () => void;
}

export function ShareCard({ visible, result, onClose }: ShareCardProps) {
  const handleShare = useCallback(async () => {
    if (!result) return;
    try {
      await Share.share({
        message: result.textBlock,
      });
    } catch {
      // User cancelled or share failed silently
    }
  }, [result]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    // React Native doesn't have a built-in clipboard without expo-clipboard
    // Use Share as the primary mechanism
    try {
      await Share.share({ message: result.textBlock });
    } catch {
      Alert.alert('Share', result.textBlock);
    }
  }, [result]);

  if (!result) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.logo}>🕷️</Text>
              <Text style={styles.brand}>Silk Spider</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Kente strip */}
          <View style={styles.kente}>
            {[colors.gold, colors.clay, colors.indigo, colors.gold, colors.clay].map((c, i) => (
              <View key={i} style={{ backgroundColor: c, flex: 1, height: 3 }} />
            ))}
          </View>

          {/* Result */}
          <View style={styles.resultArea}>
            <Text style={styles.title}>{result.title}</Text>
            <Text style={styles.subtitle}>{result.subtitle}</Text>

            {/* Emoji visualization */}
            <Text style={styles.emoji}>{result.emoji}</Text>

            {/* Call to action */}
            <Text style={styles.cta}>{result.callToAction}</Text>
          </View>

          {/* URL */}
          <Text style={styles.url}>{result.url}</Text>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareText}>Share Result</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.laterButton}>
              <Text style={styles.laterText}>Maybe later</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: colors.background,
    borderColor: colors.gold,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logo: { fontSize: 22 },
  brand: { color: colors.cream, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  closeButton: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  closeText: { color: colors.muted, fontSize: 16 },
  kente: { flexDirection: 'row', marginVertical: 14 },
  resultArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    color: colors.cream,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 24,
    letterSpacing: 4,
    marginTop: 16,
  },
  cta: {
    color: colors.goldSoft,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 14,
    textAlign: 'center',
  },
  url: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
    width: '100%',
  },
  shareText: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  laterButton: {
    paddingVertical: 8,
  },
  laterText: { color: colors.muted, fontSize: 12 },
});
