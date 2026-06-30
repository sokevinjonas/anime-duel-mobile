import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { BerryIcon, SharinganIcon } from '../components/icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      avatar
      berry
      sharinganCount
      currentLevel
      currentTier
      streakDays
      totalWins
      createdAt
    }
  }
`;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const { colors } = useTheme();
  const { data, loading, refetch } = useQuery<any>(ME_QUERY, {
    onError: async (err) => {
      if (err.message.includes('Unauthorized') || err.message.includes('UNAUTHENTICATED')) {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    },
  });

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loading, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Chargement du profil...
          </Text>
        </View>
      </View>
    );
  }

  const user = data?.me;
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  }) : '';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero avec dégradé */}
      <LinearGradient
        colors={[colors.primary + '20', colors.background]}
        style={styles.heroGradient}
      >
        <View style={styles.hero}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '30', borderColor: colors.primary, borderWidth: 3 }]}>
            <Text style={[styles.avatarLetter, { color: colors.primary, fontFamily: fonts.heading }]}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>

          <Text style={[styles.username, { color: colors.text, fontFamily: fonts.heading }]}>
            {user?.username}
          </Text>

          {user?.email && (
            <Text style={[styles.email, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {user.email}
            </Text>
          )}

          {memberSince && (
            <Text style={[styles.memberSince, { color: colors.textMuted, fontFamily: fonts.body }]}>
              Membre depuis {memberSince}
            </Text>
          )}

          {user?.streakDays > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: colors.warning + '20', borderColor: colors.warning, borderWidth: 1 }]}>
              <Text style={[styles.streakEmoji]}>🔥</Text>
              <Text style={[styles.streakText, { color: colors.warning, fontFamily: fonts.bodyBold }]}>
                {user.streakDays} jour{user.streakDays > 1 ? 's' : ''} de suite
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Progression */}
        <SectionTitle>Progression</SectionTitle>
        <Card elevated style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.levelLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Niveau actuel
              </Text>
              <Text style={[styles.levelValue, { color: colors.primary, fontFamily: fonts.heading }]}>
                {user?.currentLevel}
              </Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: colors.warning + '15', borderColor: colors.warning, borderWidth: 1.5 }]}>
              <Text style={[styles.tierLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Palier</Text>
              <Text style={[styles.tierValue, { color: colors.warning, fontFamily: fonts.heading }]}>
                {user?.currentTier}
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.winsRow}>
            <Text style={[styles.winsLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Victoires totales
            </Text>
            <Text style={[styles.winsValue, { color: colors.cta, fontFamily: fonts.heading }]}>
              {user?.totalWins} 🏆
            </Text>
          </View>
        </Card>

        {/* Inventaire */}
        <SectionTitle>Inventaire</SectionTitle>
        <View style={styles.inventoryRow}>
          <Card elevated style={styles.inventoryCard}>
            <View style={[styles.inventoryIcon, { backgroundColor: colors.warning + '15' }]}>
              <BerryIcon size={32} color={colors.warning} />
            </View>
            <Text style={[styles.inventoryValue, { color: colors.warning, fontFamily: fonts.heading }]}>
              {user?.berry}
            </Text>
            <Text style={[styles.inventoryLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Berry
            </Text>
          </Card>

          <Card elevated style={styles.inventoryCard}>
            <View style={[styles.inventoryIcon, { backgroundColor: colors.primary + '15' }]}>
              <SharinganIcon size={32} color={colors.error} />
            </View>
            <Text style={[styles.inventoryValue, { color: colors.primary, fontFamily: fonts.heading }]}>
              {user?.sharinganCount}
            </Text>
            <Text style={[styles.inventoryLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Sharingan
            </Text>
          </Card>
        </View>

        {/* Actions rapides */}
        <SectionTitle>Actions rapides</SectionTitle>
        <View style={styles.shortcuts}>
          <TouchableOpacity
            style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('History' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.shortcutEmoji}>📜</Text>
            <Text style={[styles.shortcutText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
              Historique
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('Shop' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.shortcutEmoji}>🛒</Text>
            <Text style={[styles.shortcutText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
              Boutique
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('Leaderboard' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.shortcutEmoji}>🏅</Text>
            <Text style={[styles.shortcutText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
              Classement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.error, borderWidth: 1.5 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutText, { color: colors.error, fontFamily: fonts.bodyBold }]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 15,
  },
  heroGradient: {
    paddingTop: 60,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLetter: {
    fontSize: 36,
  },
  username: {
    fontSize: 28,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 6,
  },
  memberSince: {
    fontSize: 12,
    marginBottom: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 8,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  progressCard: {
    padding: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 32,
  },
  tierBadge: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  tierLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  tierValue: {
    fontSize: 24,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  winsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  winsLabel: {
    fontSize: 14,
  },
  winsValue: {
    fontSize: 20,
  },
  inventoryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inventoryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  inventoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  inventoryEmoji: {
    fontSize: 24,
  },
  inventoryValue: {
    fontSize: 24,
    marginBottom: 2,
  },
  inventoryLabel: {
    fontSize: 12,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcut: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  shortcutEmoji: {
    fontSize: 24,
  },
  shortcutText: {
    fontSize: 13,
  },
  logoutBtn: {
    marginTop: 32,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
  },
  bottomSpacer: {
    height: 100,
  },
});
