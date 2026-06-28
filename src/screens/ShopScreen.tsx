import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const PROGRESSION_QUERY = gql`
  query Progression {
    progression {
      currentLevel
      currentTier
      maxLevelForTier
      nextTierCost
      canUnlock
      atLevelCap
      coins
      jokersCount
    }
  }
`;

const BUY_JOKER = gql`
  mutation BuyJoker {
    buyJoker {
      success
      newBalance
    }
  }
`;

const UNLOCK_TIER = gql`
  mutation UnlockTier {
    unlockTier {
      success
      newTier
      cost
    }
  }
`;

export function ShopScreen() {
  const { data, refetch } = useQuery<any>(PROGRESSION_QUERY);
  const [buyJoker] = useMutation<any>(BUY_JOKER);
  const [unlockTier] = useMutation<any>(UNLOCK_TIER);

  const prog = data?.progression;

  const handleBuyJoker = async () => {
    const { data: result } = await buyJoker();
    if (result.buyJoker.success) {
      Alert.alert('Joker acheté !', `Nouveau solde : ${result.buyJoker.newBalance} pièces`);
      refetch();
    } else {
      Alert.alert('Pas assez de pièces', 'Gagne des matchs pour obtenir plus de pièces.');
    }
  };

  const handleUnlockTier = async () => {
    const { data: result } = await unlockTier();
    if (result.unlockTier.success) {
      Alert.alert('Palier débloqué !', `Nouveau palier : ${result.unlockTier.newTier}`);
      refetch();
    } else {
      Alert.alert('Pas assez de pièces', `Il te faut ${result.unlockTier.cost} pièces.`);
    }
  };

  if (!prog) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boutique</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Ton solde</Text>
        <Text style={styles.balanceValue}>{prog.coins} pièces</Text>
        <Text style={styles.jokersValue}>{prog.jokersCount} jokers</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acheter un Joker</Text>
        <Text style={styles.sectionDesc}>Élimine un groupe de personnages en match</Text>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyJoker}>
          <Text style={styles.buyBtnText}>50 pièces → 1 Joker</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arbre de progression</Text>
        <Text style={styles.tierInfo}>
          Palier {prog.currentTier} • Niveau {prog.currentLevel}/{prog.maxLevelForTier}
        </Text>
        {prog.atLevelCap && (
          <>
            <Text style={styles.tierAlert}>Niveau max atteint pour ce palier !</Text>
            <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlockTier}>
              <Text style={styles.unlockBtnText}>
                Débloquer palier {prog.currentTier + 1} ({prog.nextTierCost} pièces)
              </Text>
            </TouchableOpacity>
          </>
        )}
        {!prog.atLevelCap && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(prog.currentLevel / prog.maxLevelForTier) * 100}%` },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60, paddingHorizontal: 24 },
  loading: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 24 },
  balanceCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: { color: '#aaa', fontSize: 14 },
  balanceValue: { color: '#f39c12', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  jokersValue: { color: '#8e44ad', fontSize: 16, marginTop: 4 },
  section: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sectionDesc: { color: '#aaa', fontSize: 13, marginBottom: 12 },
  buyBtn: { backgroundColor: '#8e44ad', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontWeight: '600' },
  tierInfo: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  tierAlert: { color: '#f39c12', fontSize: 13, marginBottom: 8 },
  unlockBtn: { backgroundColor: '#e94560', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  unlockBtnText: { color: '#fff', fontWeight: '600' },
  progressBar: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#e94560', borderRadius: 4 },
});
