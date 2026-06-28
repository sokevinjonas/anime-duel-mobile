import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';

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
  const { data, loading } = useQuery<any>(ME_QUERY);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  const user = data?.me;

  return (
    <View style={styles.container}>
      <Text style={styles.username}>{user?.username}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.totalWins}</Text>
          <Text style={styles.statLabel}>Victoires</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.currentLevel}</Text>
          <Text style={styles.statLabel}>Niveau</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.streakDays}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      <View style={styles.inventoryRow}>
        <Text style={styles.inventoryText}>🪙 {user?.coins} pièces</Text>
        <Text style={styles.inventoryText}>🃏 {user?.jokersCount} jokers</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingTop: 80,
    padding: 24,
  },
  text: { color: '#fff', fontSize: 16 },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  inventoryRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 40,
  },
  inventoryText: {
    fontSize: 16,
    color: '#fff',
  },
  logoutBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: {
    color: '#e94560',
    fontSize: 16,
  },
});
