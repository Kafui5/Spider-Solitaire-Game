import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { LoomGalleryState } from '../game/loomGallery';
import { ALL_ARTWORKS, getArtworkProgress } from '../game/loomGallery';
import { colors } from '../theme';

interface LoomGalleryScreenProps {
  visible: boolean;
  gallery: LoomGalleryState;
  onClose: () => void;
}

export function LoomGalleryScreen({
  visible,
  gallery,
  onClose,
}: LoomGalleryScreenProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>THE LOOM GALLERY</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Intro */}
          <View style={styles.introSection}>
            <Text style={styles.introText}>
              Each victory weaves threads into these tapestries
            </Text>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {ALL_ARTWORKS.map((artwork) => {
              const progress = getArtworkProgress(gallery, artwork.id);
              const progressPct =
                artwork.totalThreadsRequired > 0
                  ? (progress.threadsContributed / artwork.totalThreadsRequired) * 100
                  : 0;

              return (
                <View key={artwork.id} style={styles.artworkCard}>
                  <View style={styles.artworkHeader}>
                    <Text style={styles.artworkIcon}>{artwork.icon}</Text>
                    <View style={styles.artworkInfo}>
                      <Text style={styles.artworkName}>{artwork.name}</Text>
                      <Text style={styles.artworkDescription}>
                        {artwork.description}
                      </Text>
                    </View>
                  </View>

                  {/* Thread progress bar */}
                  <View style={styles.threadProgressSection}>
                    <View style={styles.threadProgressRow}>
                      <Text style={styles.threadProgressLabel}>
                        🧵 {progress.threadsContributed} / {artwork.totalThreadsRequired}
                      </Text>
                      <Text style={styles.threadProgressPct}>
                        {Math.round(progressPct)}%
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(progressPct, 100)}%`,
                            backgroundColor: progress.completed
                              ? colors.success
                              : colors.gold,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Section progress */}
                  <View style={styles.sectionRow}>
                    <Text style={styles.sectionText}>
                      {progress.sectionsCompleted}/{progress.totalSections} sections
                    </Text>

                    {progress.completed ? (
                      <View style={styles.completeBadge}>
                        <Text style={styles.completeText}>✓ COMPLETE</Text>
                      </View>
                    ) : (
                      <Text style={styles.inProgressText}>In progress...</Text>
                    )}
                  </View>

                  {/* Unlock info */}
                  {progress.completed && (
                    <View style={styles.unlockRow}>
                      <Text style={styles.unlockText}>
                        Unlocks: {artwork.unlocksTheme.charAt(0).toUpperCase() + artwork.unlocksTheme.slice(1)} theme
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  modal: {
    backgroundColor: colors.background,
    borderColor: '#1C4C3E',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    maxHeight: 720,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#1C4C3E',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeText: {
    color: colors.muted,
    fontSize: 18,
  },
  introSection: {
    borderBottomColor: '#1C4C3E',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  introText: {
    color: colors.muted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  artworkCard: {
    backgroundColor: '#0C2B23',
    borderColor: '#1C4C3E',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  artworkHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  artworkIcon: {
    fontSize: 32,
  },
  artworkInfo: {
    flex: 1,
  },
  artworkName: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '800',
  },
  artworkDescription: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  threadProgressSection: {
    marginBottom: 10,
  },
  threadProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  threadProgressLabel: {
    color: colors.cream,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  threadProgressPct: {
    color: colors.muted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  progressBarContainer: {
    backgroundColor: '#091F19',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 4,
    height: '100%',
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  completeBadge: {
    backgroundColor: 'rgba(230, 185, 92, 0.15)',
    borderColor: colors.gold,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completeText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  inProgressText: {
    color: colors.muted,
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  unlockRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopColor: '#1C4C3E',
    borderTopWidth: 1,
  },
  unlockText: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '600',
  },
});
