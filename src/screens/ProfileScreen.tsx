import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
          <View style={styles.progressRow}>
            <View>
              <Text style={[styles.levelLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Niveau
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
            <View>
              <Text style={[styles.winsLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Victoires
              </Text>
              <Text style={[styles.winsValue, { color: colors.cta, fontFamily: fonts.heading }]}>
                {user?.totalWins}
              </Text>
            </View>
          </View>
        </Card>

        {/* Paramètres & Infos */}
        <SectionTitle>Paramètres & Infos</SectionTitle>
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="person" size={22} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Mon Profil
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Modifier mon pseudo et avatar
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="bar-chart" size={22} color={colors.warning} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Mes Statistiques
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Winrate, temps de jeu
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="emoji-events" size={22} color={colors.warning} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Mes Succès
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Achievements et trophées
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="settings" size={22} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Paramètres
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Notifications, langue, son
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('History' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="history" size={22} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Parchemin
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Mes matchs et historique
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('Leaderboard' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="leaderboard" size={22} color={colors.warning} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Hall des Kage
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Top des meilleurs joueurs
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('Shop' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="shopping-cart" size={22} color={colors.warning} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Ichiraku Ramen
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Acheter des ressources
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="help-outline" size={22} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  Aide & Support
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  FAQ et tutoriel
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <MaterialIcons name="info-outline" size={22} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  À propos
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Crédits et mentions légales
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
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
    padding: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
  },
  levelLabel: {
    fontSize: 11,
    marginBottom: 3,
  },
  levelValue: {
    fontSize: 22,
  },
  tierBadge: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  tierLabel: {
    fontSize: 10,
  },
  tierValue: {
    fontSize: 18,
  },
  winsLabel: {
    fontSize: 11,
    marginBottom: 3,
  },
  winsValue: {
    fontSize: 20,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsSection: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
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
