import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CARD_BACKS, type CardBackId } from '../cardBacks';
import { colors } from '../theme';
import { CardBackView } from './CardBackView';

interface CardBackSelectorProps {
  visible: boolean;
  selectedBack: CardBackId;
  onSelect: (id: CardBackId) => void;
  onClose: () => void;
}

export function CardBackSelector({ visible, selectedBack, onSelect, onClose }: CardBackSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>CHOOSE A STYLE</Text>

          <View style={styles.grid}>
            {CARD_BACKS.map((design) => {
              const isSelected = design.id === selectedBack;
              return (
                <Pressable
                  key={design.id}
                  onPress={() => onSelect(design.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Card back: ${design.name}`}
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <CardBackView backId={design.id} width={60} />
                  <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {design.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close card back selector"
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>DONE</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.feltLight,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 380,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
  },
  title: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  option: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
  },
  optionSelected: {
    borderColor: colors.gold,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  labelSelected: {
    color: colors.gold,
  },
  closeButton: {
    backgroundColor: colors.felt,
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  closeText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
