import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

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
  const { colors } = useTheme();
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted, fontFamily: fonts.body }]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Boutique</Text>

      <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.balanceLabel, { color: colors.textMuted, fontFamily: fonts.body }]}>Ton solde</Text>
        <Text style={[styles.balanceValue, { color: colors.warning, fontFamily: fonts.bodyBold }]}>{prog.coins} pièces</Text>
        <Text style={[styles.jokersValue, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{prog.jokersCount} jokers</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>Acheter un Joker</Text>
        <Text style={[styles.sectionDesc, { color: colors.textMuted, fontFamily: fonts.body }]}>Élimine un groupe de personnages en match</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.buyBtn, { backgroundColor: colors.primary, minHeight: 48 }]}
          onPress={handleBuyJoker}
        >
          <Text style={[styles.buyBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>50 pièces → 1 Joker</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>Arbre de progression</Text>
        <Text style={[styles.tierInfo, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Palier {prog.currentTier} • Niveau {prog.currentLevel}/{prog.maxLevelForTier}
        </Text>
        {prog.atLevelCap && (
          <>
            <Text style={[styles.tierAlert, { color: colors.warning, fontFamily: fonts.body }]}>Niveau max atteint pour ce palier !</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.unlockBtn, { backgroundColor: colors.cta, minHeight: 48 }]}
              onPress={handleUnlockTier}
            >
              <Text style={[styles.unlockBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                Débloquer palier {prog.currentTier + 1} ({prog.nextTierCost} pièces)
              </Text>
            </TouchableOpacity>
          </>
        )}
        {!prog.atLevelCap && (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.cta, width: `${(prog.currentLevel / prog.maxLevelForTier) * 100}%` },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  loading: { textAlign: 'center', marginTop: 40 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 24 },
  balanceCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: { fontSize: 14 },
  balanceValue: { fontSize: 28, marginTop: 4 },
  jokersValue: { fontSize: 16, marginTop: 4 },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, marginBottom: 4 },
  sectionDesc: { fontSize: 13, marginBottom: 12 },
  buyBtn: { borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  buyBtnText: {},
  tierInfo: { fontSize: 14, marginBottom: 8 },
  tierAlert: { fontSize: 13, marginBottom: 8 },
  unlockBtn: { borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  unlockBtnText: {},
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
