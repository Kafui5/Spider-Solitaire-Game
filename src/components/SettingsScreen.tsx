import React from 'react';
import {
  Modal,
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors } from '../theme';
import { AppSettings, updateSetting } from '../game/settings';

interface SettingsScreenProps {
  visible: boolean;
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
}

type CardSizeOption = 'small' | 'medium' | 'large';
const CARD_SIZE_OPTIONS: { label: string; value: CardSizeOption }[] = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

export default function SettingsScreen({
  visible,
  settings,
  onUpdate,
  onClose,
}: SettingsScreenProps) {
  function toggle(key: keyof AppSettings) {
    const current = settings[key];
    if (typeof current !== 'boolean') return;
    const updated = updateSetting(settings, key, !current as any);
    onUpdate(updated);
  }

  function setCardSize(size: CardSizeOption) {
    const updated = updateSetting(settings, 'cardSize', size);
    onUpdate(updated);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close settings"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* GAMEPLAY Section */}
          <Text style={styles.sectionTitle}>GAMEPLAY</Text>
          <View style={styles.section}>
            <SettingRow
              label="Auto-complete"
              value={settings.autoCompleteEnabled}
              onToggle={() => toggle('autoCompleteEnabled')}
            />
            <SettingRow
              label="Left-handed mode"
              value={settings.leftHandedMode}
              onToggle={() => toggle('leftHandedMode')}
            />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Card size</Text>
              <View style={styles.sizeSelector}>
                {CARD_SIZE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sizeOption,
                      settings.cardSize === option.value && styles.sizeOptionActive,
                    ]}
                    onPress={() => setCardSize(option.value)}
                    accessibilityLabel={`Card size ${option.value}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: settings.cardSize === option.value }}
                  >
                    <Text
                      style={[
                        styles.sizeOptionText,
                        settings.cardSize === option.value && styles.sizeOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <SettingRow
              label="Show strategy tips"
              value={settings.showWisdomTips}
              onToggle={() => toggle('showWisdomTips')}
            />
          </View>

          {/* FEEDBACK Section */}
          <Text style={styles.sectionTitle}>FEEDBACK</Text>
          <View style={styles.section}>
            <SettingRow
              label="Sound effects"
              value={settings.soundEnabled}
              onToggle={() => toggle('soundEnabled')}
            />
            <SettingRow
              label="Haptic feedback"
              value={settings.hapticsEnabled}
              onToggle={() => toggle('hapticsEnabled')}
            />
          </View>

          {/* ACCESSIBILITY Section */}
          <Text style={styles.sectionTitle}>ACCESSIBILITY</Text>
          <View style={styles.section}>
            <SettingRow
              label="Color-blind mode"
              subtitle="Adds shape indicators to suits"
              value={settings.colorBlindMode}
              onToggle={() => toggle('colorBlindMode')}
            />
          </View>

          {/* Version */}
          <Text style={styles.versionText}>Silk Spider Solitaire v1.0.0</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

/** Individual toggle row */
function SettingRow({
  label,
  subtitle,
  value,
  onToggle,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabelContainer}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.ink, true: colors.gold }}
        thumbColor={Platform.OS === 'android' ? colors.cream : undefined}
        ios_backgroundColor={colors.ink}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 58 : 38,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.felt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.cream,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.felt,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.feltLight,
  },
  rowLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.cream,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  sizeSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  sizeOption: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  sizeOptionActive: {
    backgroundColor: colors.gold,
  },
  sizeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },
  sizeOptionTextActive: {
    color: colors.ink,
  },
  versionText: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 32,
  },
});
