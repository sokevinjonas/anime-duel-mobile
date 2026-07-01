import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Card } from '../components/ui/Card';

const HISTORY_QUERY = gql`
  query MatchHistory($page: Int) {
    matchHistory(page: $page) {
      matches {
        id
        mode
        difficulty
        maxQuestions
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
  PVP_FRIEND: 'Match ami',
  SOLO_PLAYER_GUESSES: 'Solo - Je devine',
  SOLO_AI_GUESSES: 'Solo - IA devine',
};

const MODE_EMOJI: Record<string, string> = {
  PVP_FRIEND: '👥',
  SOLO_PLAYER_GUESSES: '🎯',
  SOLO_AI_GUESSES: '🤖',
};

export function HistoryScreen() {
  const { colors } = useTheme();

  const DIFFICULTY_COLORS: Record<string, string> = {
    EASY: colors.success,
    MEDIUM: colors.warning,
    HARD: colors.error,
  };
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useQuery<any>(HISTORY_QUERY, {
    variables: { page: 1 },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const history = data?.matchHistory;
  const matches = history?.matches || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
          📜 Parchemin
        </Text>
        <View style={[styles.totalBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.totalText, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
            {history?.total || 0} match{(history?.total || 0) > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loading, { color: colors.textMuted, fontFamily: fonts.body }]}>
            Chargement de l'historique...
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }: { item: any }) => {
            const won = item.players.some((p: any) => p.isWinner);
            const myPlayer = item.players[0];
            const opponent = item.players[1];
            const modeEmoji = MODE_EMOJI[item.mode] || '🎮';
            const difficultyColor = DIFFICULTY_COLORS[item.difficulty] || colors.textMuted;

            return (
              <Card elevated style={[styles.matchCard, { backgroundColor: colors.surface }]}>
                {/* Header */}
                <View style={styles.matchHeader}>
                  <View style={styles.matchHeaderLeft}>
                    <Text style={styles.modeEmoji}>{modeEmoji}</Text>
                    <View>
                      <Text style={[styles.modeLabel, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                        {MODE_LABELS[item.mode] || item.mode}
                      </Text>
                      {item.difficulty && (
                        <Text style={[styles.difficulty, { color: difficultyColor, fontFamily: fonts.body }]}>
                          {item.difficulty}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.resultBadge,
                      {
                        backgroundColor: won
                          ? colors.success + '20'
                          : item.winnerUsername
                          ? colors.error + '20'
                          : colors.textMuted + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.resultText,
                        {
                          color: won ? colors.success : item.winnerUsername ? colors.error : colors.textMuted,
                          fontFamily: fonts.bodyBold,
                        },
                      ]}
                    >
                      {won ? '✓ Victoire' : item.winnerUsername ? '✗ Défaite' : '— Nul'}
                    </Text>
                  </View>
                </View>

                {/* Players */}
                <View style={styles.playersSection}>
                  {item.players.map((player: any, idx: number) => (
                    <View key={idx} style={styles.playerRow}>
                      <View style={[styles.playerDot, { backgroundColor: player.isWinner ? colors.success : colors.textMuted }]} />
                      <View style={styles.playerInfo}>
                        <Text style={[styles.playerName, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                          {player.username}
                        </Text>
                        {player.characterName && (
                          <Text style={[styles.characterName, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                            → {player.characterName}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Footer */}
                <View style={[styles.matchFooter, { borderTopColor: colors.border }]}>
                  <Text style={[styles.dateText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                    {new Date(item.finishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  {item.maxQuestions && (
                    <Text style={[styles.questionsText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                      Max {item.maxQuestions} questions
                    </Text>
                  )}
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎮</Text>
              <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.heading }]}>
                Aucun match joué
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>
                Commence ta première partie pour voir ton historique ici
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
  },
  totalBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  totalText: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  matchCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  matchHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modeEmoji: {
    fontSize: 28,
  },
  modeLabel: {
    fontSize: 15,
    marginBottom: 2,
  },
  difficulty: {
    fontSize: 12,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
  },
  playersSection: {
    gap: 10,
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 14,
  },
  characterName: {
    fontSize: 13,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dateText: {
    fontSize: 12,
  },
  questionsText: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
