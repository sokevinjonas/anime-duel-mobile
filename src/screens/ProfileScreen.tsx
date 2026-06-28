import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

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
  const { colors, isDark } = useTheme();
  const { data, loading } = useQuery<any>(ME_QUERY);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.textSecondary, fontFamily: fonts.body }]}>Chargement...</Text>
      </View>
    );
  }

  const user = data?.me;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.username, { color: colors.text, fontFamily: fonts.heading }]}>
        {user?.username}
      </Text>

      {user?.streakDays > 0 && (
        <View style={[styles.streakBadge, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.streakText, { color: colors.warning, fontFamily: fonts.bodySemiBold }]}>
            {user.streakDays} jours de streak
          </Text>
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.statValue, { color: colors.cta, fontFamily: fonts.heading }]}>{user?.totalWins}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Victoires</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.statValue, { color: colors.primary, fontFamily: fonts.heading }]}>{user?.currentLevel}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Niveau</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.statValue, { color: colors.warning, fontFamily: fonts.heading }]}>{user?.streakDays}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Streak</Text>
        </View>
      </View>

      <View style={[styles.inventoryCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={styles.inventoryRow}>
          <Text style={[styles.inventoryLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Pieces</Text>
          <Text style={[styles.inventoryValue, { color: colors.warning, fontFamily: fonts.bodyBold }]}>{user?.coins}</Text>
        </View>
        <View style={[styles.inventorySeparator, { backgroundColor: colors.border }]} />
        <View style={styles.inventoryRow}>
          <Text style={[styles.inventoryLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Jokers</Text>
          <Text style={[styles.inventoryValue, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{user?.jokersCount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={[styles.logoutText, { color: colors.error, fontFamily: fonts.bodySemiBold }]}>Deconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    padding: 24,
  },
  text: { fontSize: 16 },
  username: {
    fontSize: 26,
    marginBottom: 12,
  },
  streakBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 28,
  },
  streakText: { fontSize: 14 },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    minWidth: 95,
  },
  statValue: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  inventoryCard: {
    borderRadius: 14,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  inventoryRow: {
    flex: 1,
    alignItems: 'center',
  },
  inventoryLabel: { fontSize: 13 },
  inventoryValue: { fontSize: 20, marginTop: 2 },
  inventorySeparator: { width: 1, height: 36 },
  logoutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  logoutText: { fontSize: 16 },
});
