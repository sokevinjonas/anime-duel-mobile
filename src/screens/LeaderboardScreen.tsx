import { View, Text, FlatList, StyleSheet } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

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
  const { colors } = useTheme();
  const { data, loading } = useQuery<any>(LEADERBOARD_QUERY);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted, fontFamily: fonts.body }]}>Chargement...</Text>
      </View>
    );
  }

  const players = data?.leaderboard || [];
  const myRank = data?.myRank;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>🎖️ Hall des Kage</Text>
      {myRank && (
        <View style={[styles.myRankCard, { backgroundColor: colors.surface, borderColor: colors.cta }]}>
          <Text style={[styles.myRankText, { color: colors.cta, fontFamily: fonts.bodyBold }]}>Ta position : #{myRank}</Text>
        </View>
      )}
      <FlatList
        data={players}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rank, { color: colors.textMuted, fontFamily: fonts.bodyBold }, index < 3 && { color: colors.warning }]}>
              #{index + 1}
            </Text>
            <View style={styles.playerInfo}>
              <Text style={[styles.username, { color: colors.text, fontFamily: fonts.bodyBold }]}>{item.username}</Text>
              <Text style={[styles.level, { color: colors.textMuted, fontFamily: fonts.body }]}>Niv. {item.currentLevel}</Text>
            </View>
            <Text style={[styles.wins, { color: colors.success, fontFamily: fonts.bodyBold }]}>{item.totalWins} W</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  loading: { textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 16 },
  myRankCard: {
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  myRankText: { textAlign: 'center', fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rank: { width: 40, fontSize: 14 },
  playerInfo: { flex: 1 },
  username: { fontSize: 15 },
  level: { fontSize: 12 },
  wins: { fontSize: 15 },
});
