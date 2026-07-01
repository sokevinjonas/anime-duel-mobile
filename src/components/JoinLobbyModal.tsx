import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

interface LobbyInfo {
  roomCode: string;
  hostUsername: string;
  betAmount: number;
  maxQuestions: number;
  expiresIn: number;
}

interface JoinLobbyModalProps {
  visible: boolean;
  lobbyInfo: LobbyInfo | null;
  loading?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function JoinLobbyModal({
  visible,
  lobbyInfo,
  loading,
  onAccept,
  onDecline,
}: JoinLobbyModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {loading || !lobbyInfo ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
                Rejoindre la partie
              </Text>

              <View style={styles.info}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                    Adversaire:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                    {lobbyInfo.hostUsername}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                    Questions:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                    {lobbyInfo.maxQuestions}
                  </Text>
                </View>

                {lobbyInfo.betAmount > 0 && (
                  <View style={[styles.betInfo, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
                    <Text style={[styles.betText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                      🫐 Mise: {lobbyInfo.betAmount} Berry
                    </Text>
                    <Text style={[styles.betHint, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                      Tu dois avoir {lobbyInfo.betAmount} Berry pour accepter
                    </Text>
                  </View>
                )}

                {lobbyInfo.expiresIn > 0 && (
                  <Text style={[styles.expires, { color: colors.textMuted, fontFamily: fonts.body }]}>
                    Expire dans {lobbyInfo.expiresIn}s
                  </Text>
                )}
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.error }]}
                  onPress={onDecline}
                >
                  <Text style={[styles.buttonText, { fontFamily: fonts.bodyBold }]}>
                    Refuser
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.success }]}
                  onPress={onAccept}
                >
                  <Text style={[styles.buttonText, { fontFamily: fonts.bodyBold }]}>
                    Accepter
                  </Text>
                </TouchableOpacity>
              </View>
            </>
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
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    gap: 20,
    minHeight: 200,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
  },
  info: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 16,
  },
  betInfo: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    gap: 4,
    marginTop: 8,
  },
  betText: {
    fontSize: 16,
    textAlign: 'center',
  },
  betHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  expires: {
    fontSize: 12,
    textAlign: 'center',
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
    color: '#FFF',
    fontSize: 16,
  },
});
