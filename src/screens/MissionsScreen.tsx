import { View, Text, StyleSheet } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

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
  const { data, loading } = useQuery<any>(MISSIONS_QUERY);

  const missions = data?.dailyMissions || [];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missions du jour</Text>

      {missions.map((m: any) => (
        <View key={m.id} style={[styles.card, m.completed && styles.cardCompleted]}>
          <View style={styles.cardHeader}>
            <Text style={styles.missionLabel}>
              {MISSION_LABELS[m.missionType] || m.missionType}
            </Text>
            <Text style={styles.reward}>+{m.rewardCoins} pièces</Text>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((m.currentValue / m.targetValue) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {m.currentValue}/{m.targetValue}
            </Text>
          </View>
          {m.completed && <Text style={styles.completedBadge}>Complété !</Text>}
        </View>
      ))}

      {missions.length === 0 && (
        <Text style={styles.empty}>Aucune mission pour aujourd'hui</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60, paddingHorizontal: 24 },
  loading: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardCompleted: { borderWidth: 1, borderColor: '#2ecc71' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  missionLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  reward: { color: '#f39c12', fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#e94560', borderRadius: 3 },
  progressText: { color: '#aaa', fontSize: 12, width: 40 },
  completedBadge: { color: '#2ecc71', fontSize: 13, fontWeight: '600', marginTop: 6 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});
