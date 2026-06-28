import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from '../components/ui/Button3D';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleJoinMatch = () => {
    if (!roomCode.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Match', { roomCode: roomCode.trim().toUpperCase() });
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={[styles.logo, { color: colors.primary, fontFamily: fonts.bodyBlack }]}>
          ANIME DUEL
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          Devine le personnage. Defie tes amis.
        </Text>
      </View>

      {/* Boutons principaux */}
      <View style={styles.actions}>
        <Button3D
          title="Creer un match"
          color={colors.blue}
          darkColor={colors.blueDark}
          onPress={() => navigation.navigate('Match', {})}
          size="large"
        />

        {!showJoinInput ? (
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.border, borderBottomColor: colors.borderDark }]}
            onPress={() => setShowJoinInput(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineBtnText, { color: colors.textSecondary, fontFamily: fonts.bodyBold }]}>
              REJOINDRE UN MATCH
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.joinCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <TextInput
              style={[styles.codeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontFamily: fonts.bodyExtraBold }]}
              placeholder="CODE"
              placeholderTextColor={colors.textMuted}
              value={roomCode}
              onChangeText={setRoomCode}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <Button3D
              title="Go !"
              color={colors.primary}
              darkColor={colors.primaryDark}
              onPress={handleJoinMatch}
              size="small"
            />
          </View>
        )}
      </View>

      {/* Grille navigation */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: fonts.bodyBold }]}>
        EXPLORER
      </Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border, borderBottomColor: colors.borderDark }]}
          onPress={() => navigation.navigate('Catalog')}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridEmoji, { color: colors.secondary }]}>50+</Text>
          <Text style={[styles.gridLabel, { color: colors.text, fontFamily: fonts.bodyBold }]}>Catalogue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border, borderBottomColor: colors.borderDark }]}
          onPress={() => navigation.navigate('Missions')}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridEmoji, { color: colors.cta }]}>!</Text>
          <Text style={[styles.gridLabel, { color: colors.text, fontFamily: fonts.bodyBold }]}>Missions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border, borderBottomColor: colors.borderDark }]}
          onPress={() => navigation.navigate('Shop')}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridEmoji, { color: colors.primary }]}>J</Text>
          <Text style={[styles.gridLabel, { color: colors.text, fontFamily: fonts.bodyBold }]}>Boutique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border, borderBottomColor: colors.borderDark }]}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridEmoji, { color: colors.orange }]}>H</Text>
          <Text style={[styles.gridLabel, { color: colors.text, fontFamily: fonts.bodyBold }]}>Historique</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 34, letterSpacing: 2 },
  tagline: { fontSize: 15, marginTop: 6 },
  actions: { gap: 12, marginBottom: 28 },
  outlineBtn: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 16,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  outlineBtnText: { fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  joinCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    gap: 10,
  },
  codeInput: {
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 48,
    paddingHorizontal: 16,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 6,
  },
  sectionLabel: { fontSize: 12, letterSpacing: 1.5, marginBottom: 10 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gridItem: {
    flex: 1,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridEmoji: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  gridLabel: { fontSize: 13 },
});
