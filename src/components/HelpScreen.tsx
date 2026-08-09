import React, { useState } from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { colors } from '../theme';

interface HelpScreenProps {
  visible: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I move cards?',
    answer:
      'Tap a card to select it, then tap the destination column. You can also drag and drop. Same-suit sequences move together; mixed sequences move one card at a time.',
  },
  {
    question: 'What are the difficulty modes?',
    answer:
      'One Suit (Apprentice) uses only spades. Two Suits (Journeyman) adds hearts. Four Suits (Master) uses all suits and requires Full Weaver after 3 free trials.',
  },
  {
    question: 'How does the Daily Loom work?',
    answer:
      'A new challenge appears every day with the same deal for all players worldwide. Complete it to build your streak! Difficulty rotates daily.',
  },
  {
    question: 'How do I undo a move?',
    answer:
      'Tap the ↩️ undo button in the toolbar. Undo is unlimited and free for all players.',
  },
  {
    question: 'How do I restore my purchase?',
    answer:
      'Go to Settings → Restore Purchases. Make sure you are signed in with the same Google account that made the original purchase.',
  },
];

const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'support@greenmidori.com';
const FAQ_URL = 'https://greenmidori.com/silk-spider/support';
const PRIVACY_URL = 'https://greenmidori.com/privacy';

function getDeviceInfo(): string {
  const os = Platform.OS;
  const version = Platform.Version;
  const expoVersion = Constants.expoConfig?.sdkVersion ?? 'SDK 57';
  return `${os} ${version} | Expo ${expoVersion}`;
}

function openSupportEmail() {
  const subject = encodeURIComponent('Silk Spider Solitaire — Support Request');
  const deviceInfo = getDeviceInfo();
  const body = encodeURIComponent(
    `\n\n--- Device Info (please don't delete) ---\nApp Version: ${APP_VERSION}\nDevice: ${deviceInfo}\nPlatform: ${Platform.OS} ${Platform.Version}\nBuild: Expo SDK 57\n`,
  );
  const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  Linking.openURL(url);
}

export default function HelpScreen({ visible, onClose }: HelpScreenProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function toggleFAQ(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HELP & SUPPORT</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Quick FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {FAQ_ITEMS.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => toggleFAQ(index)}
                style={styles.faqItem}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Text style={styles.faqChevron}>
                    {expandedIndex === index ? '▾' : '▸'}
                  </Text>
                </View>
                {expandedIndex === index && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Device Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>{APP_VERSION}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device</Text>
              <Text style={styles.infoValue}>
                {Platform.OS} {Platform.Version}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>
                Expo SDK {Constants.expoConfig?.sdkVersion ?? '57'}
              </Text>
            </View>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <Text style={styles.contactDescription}>
              Having trouble? We typically respond within 48 hours.
            </Text>
            <Pressable onPress={openSupportEmail} style={styles.emailButton}>
              <Text style={styles.emailButtonText}>📧 Email Support</Text>
            </Pressable>
            <Text style={styles.emailHint}>{SUPPORT_EMAIL}</Text>
          </View>

          {/* Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Resources</Text>
            <Pressable
              onPress={() => Linking.openURL(FAQ_URL)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>📖 Full FAQ & Support Page</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL(PRIVACY_URL)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>🔒 Privacy Policy</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Silk Spider Solitaire v{APP_VERSION}
            </Text>
            <Text style={styles.footerText}>© Green Midori</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.felt,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.felt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.cream,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  // FAQ
  faqItem: {
    backgroundColor: colors.felt,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
    flex: 1,
    marginRight: 8,
  },
  faqChevron: {
    fontSize: 16,
    color: colors.gold,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.feltLight,
  },
  // Device Info
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.felt,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  infoValue: {
    fontSize: 14,
    color: colors.cream,
    fontWeight: '500',
  },
  // Contact
  contactDescription: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 14,
    lineHeight: 20,
  },
  emailButton: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  emailHint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  // Links
  linkButton: {
    backgroundColor: colors.felt,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 15,
    color: colors.cream,
    fontWeight: '500',
  },
  // Footer
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
});
