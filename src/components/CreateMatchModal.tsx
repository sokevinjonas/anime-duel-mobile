import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

interface CreateMatchModalProps {
  visible: boolean;
  onConfirm: (betAmount: number, maxQuestions: number) => void;
  onCancel: () => void;
}

export function CreateMatchModal({ visible, onConfirm, onCancel }: CreateMatchModalProps) {
  const { colors } = useTheme();
  const [betAmount, setBetAmount] = useState('0');
  const [maxQuestions, setMaxQuestions] = useState(10);

  const handleConfirm = () => {
    const amount = parseInt(betAmount) || 0;
    if (amount > 0 && amount < 20) {
      alert('Mise minimum: 20 Berry');
      return;
    }
    onConfirm(amount, maxQuestions);
  };

  const questionOptions = [5, 10, 15, 18];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
            Créer une partie
          </Text>

          {/* Berry bet */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyBold }]}>
              Mise en Berry (optionnel)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontFamily: fonts.body }]}
              placeholder="0 (aucune mise)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={betAmount}
              onChangeText={setBetAmount}
            />
            <Text style={[styles.hint, { color: colors.textMuted, fontFamily: fonts.body }]}>
              Minimum: 20 Berry
            </Text>
          </View>

          {/* Max questions */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyBold }]}>
              Nombre de questions
            </Text>
            <View style={styles.optionsRow}>
              {questionOptions.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: maxQuestions === num ? colors.primary : colors.background,
                      borderColor: maxQuestions === num ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setMaxQuestions(num)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: maxQuestions === num ? '#FFF' : colors.text,
                        fontFamily: fonts.bodyBold,
                      },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.success }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, { color: '#FFF', fontFamily: fonts.bodyBold }]}>
                Créer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});
