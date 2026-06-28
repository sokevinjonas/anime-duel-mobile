import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

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
  const { colors } = useTheme();
  const { data, loading } = useQuery<any>(HISTORY_QUERY, {
    variables: { page: 1 },
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted, fontFamily: fonts.body }]}>Chargement...</Text>
      </View>
    );
  }

  const history = data?.matchHistory;
  const matches = history?.matches || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Historique</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>{history?.total || 0} matchs joués</Text>

      <FlatList
        data={matches}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          const won = item.players.some((p: any) => p.isWinner);
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: colors.surface, minHeight: 48 }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.modeBadge, { color: colors.textMuted, backgroundColor: colors.border, fontFamily: fonts.body }]}>
                  {MODE_LABELS[item.mode] || item.mode}
                </Text>
                {item.difficulty && (
                  <Text style={[styles.diffBadge, { color: colors.warning, fontFamily: fonts.body }]}>{item.difficulty}</Text>
                )}
                <Text
                  style={[
                    styles.resultBadge,
                    { fontFamily: fonts.bodySemiBold },
                    won
                      ? { backgroundColor: colors.success, color: colors.text }
                      : { backgroundColor: colors.error, color: colors.text },
                  ]}
                >
                  {won ? 'Victoire' : item.winnerUsername ? 'Défaite' : 'Nul'}
                </Text>
              </View>
              <View style={styles.playersRow}>
                {item.players.map((p: any, i: number) => (
                  <Text key={i} style={[styles.playerText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                    {p.username} → {p.characterName || '?'}
                  </Text>
                ))}
              </View>
              <Text style={[styles.dateText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                {new Date(item.finishedAt).toLocaleDateString('fr-FR')}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted, fontFamily: fonts.body }]}>Aucun match joué</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  loading: { textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', marginBottom: 16, fontSize: 14 },
  card: {
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modeBadge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  diffBadge: { fontSize: 12 },
  resultBadge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  playersRow: { marginBottom: 6 },
  playerText: { fontSize: 13 },
  dateText: { fontSize: 11 },
  empty: { textAlign: 'center', marginTop: 40 },
});
