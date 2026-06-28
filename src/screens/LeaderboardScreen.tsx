import { View, Text, FlatList, StyleSheet } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const LEADERBOARD_QUERY = gql`
  query Leaderboard {
    leaderboard(limit: 50) {
      id
      username
      totalWins
      currentLevel
    }
    myRank
  }
`;

export function LeaderboardScreen() {
  const { data, loading } = useQuery<any>(LEADERBOARD_QUERY);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </View>
    );
  }

  const players = data?.leaderboard || [];
  const myRank = data?.myRank;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classement</Text>
      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankText}>Ta position : #{myRank}</Text>
        </View>
      )}
      <FlatList
        data={players}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <View style={styles.row}>
            <Text style={[styles.rank, index < 3 && styles.topRank]}>
              #{index + 1}
            </Text>
            <View style={styles.playerInfo}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.level}>Niv. {item.currentLevel}</Text>
            </View>
            <Text style={styles.wins}>{item.totalWins} W</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60 },
  loading: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 16 },
  myRankCard: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  myRankText: { color: '#e94560', fontWeight: '600', textAlign: 'center', fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  rank: { width: 40, color: '#aaa', fontSize: 14, fontWeight: '600' },
  topRank: { color: '#f39c12' },
  playerInfo: { flex: 1 },
  username: { color: '#fff', fontSize: 15, fontWeight: '600' },
  level: { color: '#aaa', fontSize: 12 },
  wins: { color: '#2ecc71', fontSize: 15, fontWeight: 'bold' },
});
