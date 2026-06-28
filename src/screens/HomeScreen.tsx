import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-20 pb-24"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View className="items-center mb-8 mt-5">
        <Text className="text-cta font-heading text-4xl">ANIME DUEL</Text>
        <Text className="text-muted font-body text-base mt-1">
          Devine le personnage. Defie tes amis.
        </Text>
      </View>

      {/* Actions */}
      <View className="gap-3 mb-2">
        <TouchableOpacity
          className="bg-cta rounded-button min-h-[52px] px-5 py-4 justify-center"
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Solo'); }}
          activeOpacity={0.8}
        >
          <Text className="text-white font-body-semibold text-base">Mode Solo</Text>
          <Text className="text-white/70 font-body text-sm mt-0.5">Joue contre l'IA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary rounded-button min-h-[52px] px-5 py-4 justify-center"
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Match', {}); }}
          activeOpacity={0.8}
        >
          <Text className="text-white font-body-semibold text-base">Creer un match</Text>
          <Text className="text-white/70 font-body text-sm mt-0.5">Invite un ami avec un code</Text>
        </TouchableOpacity>

        {!showJoinInput ? (
          <TouchableOpacity
            className="bg-surface border border-border rounded-button min-h-[52px] px-5 py-4 justify-center"
            onPress={() => setShowJoinInput(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: colors.text }} className="font-body-semibold text-base">Rejoindre un match</Text>
            <Text className="text-muted font-body text-sm mt-0.5">Entre le code d'un ami</Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-surface rounded-card p-3 border border-border">
            <View className="flex-row gap-3">
              <TextInput
                className="flex-1 bg-surface-elevated rounded-xl min-h-[48px] px-4 text-center text-lg tracking-widest border-2 border-primary font-body-bold"
                style={{ color: colors.text }}
                placeholder="CODE"
                placeholderTextColor={colors.textMuted}
                value={roomCode}
                onChangeText={setRoomCode}
                autoCapitalize="characters"
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity
                className="bg-primary rounded-xl min-h-[48px] px-6 justify-center"
                onPress={handleJoinMatch}
                activeOpacity={0.8}
              >
                <Text className="text-white font-body-semibold text-base">Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Explorer */}
      <Text className="text-muted font-body-semibold text-xs uppercase tracking-wider mt-6 mb-3">
        Explorer
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-surface border border-border rounded-card py-5 items-center min-h-[80px] justify-center"
          onPress={() => navigation.navigate('Catalog')}
          activeOpacity={0.7}
        >
          <Text className="text-primary text-xl font-bold mb-1">50+</Text>
          <Text style={{ color: colors.text }} className="font-body-semibold text-sm">Catalogue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-surface border border-border rounded-card py-5 items-center min-h-[80px] justify-center"
          onPress={() => navigation.navigate('Leaderboard')}
          activeOpacity={0.7}
        >
          <Text className="text-warning text-xl font-bold mb-1">#1</Text>
          <Text style={{ color: colors.text }} className="font-body-semibold text-sm">Classement</Text>
        </TouchableOpacity>
      </View>

      {/* Progression */}
      <Text className="text-muted font-body-semibold text-xs uppercase tracking-wider mt-6 mb-3">
        Progression
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-surface border border-border rounded-card py-5 items-center min-h-[80px] justify-center"
          onPress={() => navigation.navigate('Missions')}
          activeOpacity={0.7}
        >
          <Text className="text-cta text-xl font-bold mb-1">!</Text>
          <Text style={{ color: colors.text }} className="font-body-semibold text-sm">Missions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-surface border border-border rounded-card py-5 items-center min-h-[80px] justify-center"
          onPress={() => navigation.navigate('Shop')}
          activeOpacity={0.7}
        >
          <Text className="text-success text-xl font-bold mb-1">J</Text>
          <Text style={{ color: colors.text }} className="font-body-semibold text-sm">Boutique</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom links */}
      <View className="flex-row gap-3 mt-6">
        <TouchableOpacity
          className="flex-1 bg-surface-elevated border border-border rounded-xl py-3.5 items-center min-h-[48px]"
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.7}
        >
          <Text className="text-muted font-body-medium text-sm">Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-surface-elevated border border-border rounded-xl py-3.5 items-center min-h-[48px]"
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Text className="text-muted font-body-medium text-sm">Profil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
