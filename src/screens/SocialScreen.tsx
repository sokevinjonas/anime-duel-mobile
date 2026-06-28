import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from '../components/ui/Button3D';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SocialScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Match', {});
  };

  const handleJoin = () => {
    if (!roomCode.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Match', { roomCode: roomCode.trim().toUpperCase() });
    setRoomCode('');
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bodyExtraBold }]}>
        Jouer entre amis
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        Defie un ami en duel de devinettes !
      </Text>

      {/* Créer un match */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          Creer une partie
        </Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary, fontFamily: fonts.bodyRegular }]}>
          Genere un code et partage-le a ton ami pour qu'il te rejoigne.
        </Text>
        <Button3D
          title="CREER"
          color={colors.blue}
          darkColor={colors.blueDark}
          onPress={handleCreate}
          size="medium"
        />
      </View>

      {/* Rejoindre */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          Rejoindre une partie
        </Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary, fontFamily: fonts.bodyRegular }]}>
          Entre le code que ton ami t'a partage.
        </Text>
        <View style={styles.joinRow}>
          <TextInput
            style={[styles.codeInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: fonts.bodyExtraBold }]}
            placeholder="CODE"
            placeholderTextColor={colors.textMuted}
            value={roomCode}
            onChangeText={setRoomCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Button3D
            title="GO"
            color={colors.orange}
            darkColor={colors.orangeDark}
            onPress={handleJoin}
            size="small"
            style={{ paddingHorizontal: 16, minWidth: 60 }}
          />
        </View>
      </View>

      {/* Info */}
      <View style={[styles.infoCard, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.infoTitle, { color: colors.textSecondary, fontFamily: fonts.bodyBold }]}>
          Comment ca marche ?
        </Text>
        <Text style={[styles.infoText, { color: colors.textMuted, fontFamily: fonts.bodyRegular }]}>
          1. Un joueur cree la partie et obtient un code{'\n'}
          2. L'autre joueur rejoint avec ce code{'\n'}
          3. Chacun choisit un personnage en secret{'\n'}
          4. Posez des questions pour deviner !
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 28 },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: { fontSize: 17 },
  cardDesc: { fontSize: 14, lineHeight: 20 },
  joinRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  codeInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 48,
    paddingHorizontal: 16,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 6,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: { fontSize: 14, marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 22 },
});
