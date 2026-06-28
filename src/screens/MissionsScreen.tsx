import { View, Text, StyleSheet } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

const MISSIONS_QUERY = gql`
  query DailyMissions {
    dailyMissions {
      id
      missionType
      targetValue
      currentValue
      completed
      rewardCoins
    }
  }
`;

const MISSION_LABELS: Record<string, string> = {
  play_matches: 'Joue des matchs',
  win_match: 'Gagne un match',
  win_matches: 'Gagne des matchs',
  ask_questions: 'Pose des questions',
};

export function MissionsScreen() {
  const { colors } = useTheme();
  const { data, loading } = useQuery<any>(MISSIONS_QUERY);

  const missions = data?.dailyMissions || [];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted, fontFamily: fonts.body }]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Missions du jour</Text>

      {missions.map((m: any) => (
        <View
          key={m.id}
          style={[
            styles.card,
            { backgroundColor: colors.surface },
            m.completed && { borderWidth: 1, borderColor: colors.success },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.missionLabel, { color: colors.text, fontFamily: fonts.bodySemiBold }]}>
              {MISSION_LABELS[m.missionType] || m.missionType}
            </Text>
            <Text style={[styles.reward, { color: colors.warning, fontFamily: fonts.bodySemiBold }]}>+{m.rewardCoins} pièces</Text>
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.cta, width: `${Math.min((m.currentValue / m.targetValue) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textMuted, fontFamily: fonts.body }]}>
              {m.currentValue}/{m.targetValue}
            </Text>
          </View>
          {m.completed && <Text style={[styles.completedBadge, { color: colors.success, fontFamily: fonts.bodySemiBold }]}>Complété !</Text>}
        </View>
      ))}

      {missions.length === 0 && (
        <Text style={[styles.empty, { color: colors.textMuted, fontFamily: fonts.body }]}>Aucune mission pour aujourd'hui</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  loading: { textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 24 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  missionLabel: { fontSize: 15 },
  reward: {},
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, width: 40 },
  completedBadge: { fontSize: 13, marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 40 },
});
