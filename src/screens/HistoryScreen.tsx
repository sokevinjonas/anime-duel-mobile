import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const HISTORY_QUERY = gql`
  query MatchHistory($page: Int) {
    matchHistory(page: $page) {
      matches {
        id
        mode
        difficulty
        winnerUsername
        players {
          username
          characterName
          isWinner
        }
        finishedAt
      }
      total
      page
      totalPages
    }
  }
`;

const MODE_LABELS: Record<string, string> = {
  PVP_FRIEND: 'PvP Amis',
  SOLO_PLAYER_GUESSES: 'Solo (je devine)',
  SOLO_AI_GUESSES: 'Solo (IA devine)',
};

export function HistoryScreen() {
  const { data, loading } = useQuery<any>(HISTORY_QUERY, {
    variables: { page: 1 },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </View>
    );
  }

  const history = data?.matchHistory;
  const matches = history?.matches || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>
      <Text style={styles.subtitle}>{history?.total || 0} matchs joués</Text>

      <FlatList
        data={matches}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          const won = item.players.some((p: any) => p.isWinner);
          return (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.modeBadge}>{MODE_LABELS[item.mode] || item.mode}</Text>
                {item.difficulty && (
                  <Text style={styles.diffBadge}>{item.difficulty}</Text>
                )}
                <Text style={[styles.resultBadge, won ? styles.winBadge : styles.loseBadge]}>
                  {won ? 'Victoire' : item.winnerUsername ? 'Défaite' : 'Nul'}
                </Text>
              </View>
              <View style={styles.playersRow}>
                {item.players.map((p: any, i: number) => (
                  <Text key={i} style={styles.playerText}>
                    {p.username} → {p.characterName || '?'}
                  </Text>
                ))}
              </View>
              <Text style={styles.dateText}>
                {new Date(item.finishedAt).toLocaleDateString('fr-FR')}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun match joué</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60 },
  loading: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: '#aaa', textAlign: 'center', marginBottom: 16, fontSize: 14 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modeBadge: { color: '#aaa', fontSize: 12, backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  diffBadge: { color: '#f39c12', fontSize: 12 },
  resultBadge: { fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  winBadge: { backgroundColor: '#2ecc71', color: '#fff' },
  loseBadge: { backgroundColor: '#e74c3c', color: '#fff' },
  playersRow: { marginBottom: 6 },
  playerText: { color: '#ccc', fontSize: 13 },
  dateText: { color: '#666', fontSize: 11 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});
