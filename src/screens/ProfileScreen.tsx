import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { PageShell } from '../components/ui/PageShell';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      avatar
      coins
      jokersCount
      currentLevel
      currentTier
      streakDays
      totalWins
    }
  }
`;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const { colors } = useTheme();
  const { data, loading } = useQuery<any>(ME_QUERY);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <PageShell>
        <Text style={[styles.loading, { color: colors.textSecondary, fontFamily: fonts.body }]}>Chargement...</Text>
      </PageShell>
    );
  }

  const user = data?.me;

  return (
    <PageShell>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '30' }]}>
          <Text style={[styles.avatarLetter, { color: colors.primary, fontFamily: fonts.heading }]}>
            {user?.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={[styles.username, { color: colors.text, fontFamily: fonts.heading }]}>
          {user?.username}
        </Text>
        {user?.streakDays > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.streakText, { color: colors.warning, fontFamily: fonts.bodySemiBold }]}>
              {user.streakDays}j de streak
            </Text>
          </View>
        )}
      </View>

      {/* Stats KPI */}
      <SectionTitle>Statistiques</SectionTitle>
      <View style={styles.statsRow}>
        <Card elevated style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.cta, fontFamily: fonts.heading }]}>{user?.totalWins}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Victoires</Text>
        </Card>
        <Card elevated style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary, fontFamily: fonts.heading }]}>{user?.currentLevel}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Niveau</Text>
        </Card>
        <Card elevated style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning, fontFamily: fonts.heading }]}>T{user?.currentTier}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Palier</Text>
        </Card>
      </View>

      {/* Inventaire */}
      <SectionTitle>Inventaire</SectionTitle>
      <Card elevated>
        <View style={styles.inventoryGrid}>
          <View style={styles.inventoryItem}>
            <Text style={[styles.inventoryValue, { color: colors.warning, fontFamily: fonts.bodyBold }]}>{user?.coins}</Text>
            <Text style={[styles.inventoryLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Pieces</Text>
          </View>
          <View style={[styles.inventorySep, { backgroundColor: colors.border }]} />
          <View style={styles.inventoryItem}>
            <Text style={[styles.inventoryValue, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{user?.jokersCount}</Text>
            <Text style={[styles.inventoryLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Jokers</Text>
          </View>
        </View>
      </Card>

      {/* Actions */}
      <SectionTitle>Raccourcis</SectionTitle>
      <View style={styles.shortcuts}>
        <TouchableOpacity
          style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.7}
        >
          <Text style={[styles.shortcutText, { color: colors.text, fontFamily: fonts.bodyMedium }]}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => navigation.navigate('Shop')}
          activeOpacity={0.7}
        >
          <Text style={[styles.shortcutText, { color: colors.text, fontFamily: fonts.bodyMedium }]}>Boutique</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.error, borderWidth: 1 }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={[styles.logoutText, { color: colors.error, fontFamily: fonts.bodySemiBold }]}>Deconnexion</Text>
      </TouchableOpacity>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  loading: { textAlign: 'center', marginTop: 60 },
  hero: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 28 },
  username: { fontSize: 24, marginBottom: 8 },
  streakBadge: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 16 },
  streakText: { fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statValue: { fontSize: 20, marginBottom: 2 },
  statLabel: { fontSize: 11 },
  inventoryGrid: { flexDirection: 'row', alignItems: 'center' },
  inventoryItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  inventoryValue: { fontSize: 22 },
  inventoryLabel: { fontSize: 12, marginTop: 2 },
  inventorySep: { width: 1, height: 32 },
  shortcuts: { flexDirection: 'row', gap: 10 },
  shortcut: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', minHeight: 48 },
  shortcutText: { fontSize: 14 },
  logoutBtn: { marginTop: 32, borderRadius: 12, paddingVertical: 14, alignItems: 'center', minHeight: 48 },
  logoutText: { fontSize: 15 },
});
