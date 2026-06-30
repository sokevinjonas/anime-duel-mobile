import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

interface ResponseChakraModalProps {
  visible: boolean;
  success: boolean;
  message: string;
  onClose: () => void;
}

export function ResponseChakraModal({ visible, success, message, onClose }: ResponseChakraModalProps) {
  const { colors } = useTheme();

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
            {message}
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: success ? colors.success : colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>OK</Text>
          </TouchableOpacity>
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
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 8,
  },
  btnText: {
    fontSize: 16,
    color: '#FFF',
  },
});
