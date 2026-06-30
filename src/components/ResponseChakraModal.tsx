import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

interface ResponseChakraModalProps {
  visible: boolean;
  success: boolean;
  errorType?: 'insufficient_berry' | 'max_chakra' | 'max_fillers' | 'other';
  currentBerry?: number;
  cost?: number;
  newChakra?: number;
  message?: string;
  onClose: () => void;
  onGoToShop?: () => void;
}

export function ResponseChakraModal({
  visible,
  success,
  errorType,
  currentBerry,
  cost,
  newChakra,
  message,
  onClose,
  onGoToShop
}: ResponseChakraModalProps) {
  const { colors } = useTheme();

  // Construire le message en fonction du type
  const displayMessage = (() => {
    if (success && newChakra) {
      return `Tu as maintenant ${newChakra} Chakra !`;
    }

    if (errorType === 'insufficient_berry' && currentBerry !== undefined && cost !== undefined) {
      const manquant = cost - currentBerry;
      return `Pas assez de Berry !\n\nTu as : ${currentBerry} Berry\nCoût : ${cost} Berry\nManquant : ${manquant} Berry`;
    }

    if (errorType === 'max_chakra') {
      return 'Ton Chakra est déjà au maximum !';
    }

    if (errorType === 'max_fillers') {
      return 'Tu as déjà utilisé tes 3 Fillers aujourd\'hui !';
    }

    return message || 'Une erreur est survenue';
  })();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.icon, { backgroundColor: success ? colors.success + '20' : colors.error + '20' }]}>
            <MaterialIcons
              name={success ? 'check-circle' : 'error'}
              size={64}
              color={success ? colors.success : colors.error}
            />
          </View>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
            {success ? 'Chakra rechargé !' : 'Oups !'}
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            {displayMessage}
          </Text>

          {/* Boutons */}
          {errorType === 'insufficient_berry' && onGoToShop ? (
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary, { backgroundColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.btnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.warning }]}
                onPress={onGoToShop}
              >
                <MaterialIcons name="store" size={18} color="#000" />
                <Text style={[styles.btnText, { color: '#000', fontFamily: fonts.bodyBold }]}>Ichiraku Ramen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: success ? colors.success : colors.primary }]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>OK</Text>
            </TouchableOpacity>
          )}
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
  },
  modal: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    width: '80%',
    maxWidth: 320,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnPrimary: {
    flex: 1,
  },
  btnSecondary: {
    flex: 0.8,
  },
  btnText: {
    fontSize: 16,
    color: '#FFF',
  },
});
