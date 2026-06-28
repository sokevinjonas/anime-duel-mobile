import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateMatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Match', {});
  };

  const handleJoinMatch = () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Entre un code de room');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Match', { roomCode: roomCode.trim().toUpperCase() });
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.cta, fontFamily: fonts.heading }]}>
        ANIME DUEL
      </Text>

      <View style={styles.menu}>
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.cta }]}
          onPress={handleCreateMatch}
          activeOpacity={0.8}
        >
          <Text style={[styles.menuBtnText, { fontFamily: fonts.bodySemiBold }]}>Creer un match</Text>
          <Text style={[styles.menuBtnSub, { fontFamily: fonts.body }]}>Invite un ami avec un code</Text>
        </TouchableOpacity>

        {!showJoinInput ? (
          <TouchableOpacity
            style={[styles.menuBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cta }]}
            onPress={() => setShowJoinInput(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.menuBtnText, { color: colors.cta, fontFamily: fonts.bodySemiBold }]}>Rejoindre un match</Text>
            <Text style={[styles.menuBtnSub, { color: colors.textSecondary, fontFamily: fonts.body }]}>Entre le code d'un ami</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.joinSection}>
            <TextInput
              style={[styles.codeInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cta, fontFamily: fonts.bodyBold }]}
              placeholder="CODE"
              placeholderTextColor={colors.textMuted}
              value={roomCode}
              onChangeText={setRoomCode}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.joinBtn, { backgroundColor: colors.cta }]}
              onPress={handleJoinMatch}
              activeOpacity={0.8}
            >
              <Text style={[styles.joinBtnText, { fontFamily: fonts.bodySemiBold }]}>Go</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Solo')}
          activeOpacity={0.8}
        >
          <Text style={[styles.menuBtnText, { fontFamily: fonts.bodySemiBold }]}>Mode Solo</Text>
          <Text style={[styles.menuBtnSub, { fontFamily: fonts.body }]}>Joue contre l'IA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Catalog')}
          activeOpacity={0.8}
        >
          <Text style={[styles.menuBtnText, { color: colors.text, fontFamily: fonts.bodySemiBold }]}>Catalogue</Text>
          <Text style={[styles.menuBtnSub, { color: colors.textSecondary, fontFamily: fonts.body }]}>Explore les personnages</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.halfBtn, { backgroundColor: colors.warning }]}
            onPress={() => navigation.navigate('Missions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.halfBtnText, { fontFamily: fonts.bodySemiBold }]}>Missions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.halfBtn, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.8}
          >
            <Text style={[styles.halfBtnText, { fontFamily: fonts.bodySemiBold }]}>Boutique</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.halfBtn, { backgroundColor: '#3498db' }]}
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.8}
          >
            <Text style={[styles.halfBtnText, { fontFamily: fonts.bodySemiBold }]}>Classement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.halfBtn, { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.8}
          >
            <Text style={[styles.halfBtnText, { color: colors.text, fontFamily: fonts.bodySemiBold }]}>Historique</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Text style={[styles.menuBtnText, { color: colors.text, fontFamily: fonts.bodySemiBold }]}>Mon Profil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 32,
  },
  menu: { gap: 12 },
  menuBtn: {
    borderRadius: 14,
    padding: 18,
    minHeight: 48,
    justifyContent: 'center',
  },
  menuBtnText: { fontSize: 17, color: '#fff' },
  menuBtnSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  joinSection: {
    flexDirection: 'row',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 2,
  },
  joinBtn: {
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    minHeight: 48,
  },
  joinBtnText: { color: '#fff', fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  halfBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  halfBtnText: { color: '#fff', fontSize: 15 },
});
