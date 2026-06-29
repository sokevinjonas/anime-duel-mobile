import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';

const USER_QUERY = gql`
  query Me {
    me {
      id
      coins
      gems
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

// Packs de gems disponibles
const GEM_PACKS = [
  { id: 'small', gems: 50, price: 0.99, label: '50 💎', popular: false },
  { id: 'medium', gems: 150, price: 2.99, label: '150 💎', popular: true },
  { id: 'large', gems: 400, price: 7.99, label: '400 💎', popular: false },
  { id: 'mega', gems: 1000, price: 19.99, label: '1000 💎', popular: false },
];

export function ShopScreen() {
  const { colors } = useTheme();
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(USER_QUERY);
  const [buyJoker, { loading: jokerLoading }] = useMutation<any>(BUY_JOKER);

  useAuthErrorHandler(userError);

  const user = userData?.me;

  const handleBuyJoker = async () => {
    try {
      const { data: result } = await buyJoker();
      if (result.buyJoker.success) {
        Alert.alert('Joker acheté', `Tu as maintenant ${result.buyJoker.newBalance - 50} pièces`);
        refetchUser();
      } else {
        Alert.alert('Pas assez de pièces', 'Gagne des matchs pour obtenir plus de pièces.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const handleBuyGems = (pack: typeof GEM_PACKS[0]) => {
    Alert.alert(
      'Achat de gems',
      `Acheter ${pack.gems} gems pour ${pack.price}€ ?`,
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Acheter',
          onPress: () => {
            Alert.alert('Achat simulé', `${pack.gems} gems ont été ajoutés ! (Stripe integration pending)`);
            refetchUser();
          },
        },
      ]
    );
  };

  if (userLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="store" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Boutique</Text>
      </View>

      {/* Balance Card */}
      {user && (
        <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <MaterialIcons name="toll" size={24} color="#FFD93D" />
              <View>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Pièces</Text>
                <Text style={[styles.balanceValue, { color: colors.text, fontFamily: fonts.heading }]}>{user.coins}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceItem}>
              <MaterialIcons name="diamond" size={24} color="#6BCFFF" />
              <View>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Gems</Text>
                <Text style={[styles.balanceValue, { color: colors.text, fontFamily: fonts.heading }]}>{user.gems}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceItem}>
              <MaterialIcons name="casino" size={24} color="#FF8A5B" />
              <View>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Jokers</Text>
                <Text style={[styles.balanceValue, { color: colors.text, fontFamily: fonts.heading }]}>{user.jokersCount}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Gems Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="diamond" size={24} color="#6BCFFF" />
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>Acheter des Gems</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>Utilise les gems pour les recharges d'énergie et les offers premium</Text>

        <View style={styles.gemGrid}>
          {GEM_PACKS.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.gemCard,
                {
                  backgroundColor: pack.popular ? colors.primary + '20' : colors.surface,
                  borderColor: pack.popular ? colors.primary : colors.border,
                  borderWidth: pack.popular ? 2 : 1,
                },
              ]}
              onPress={() => handleBuyGems(pack)}
              activeOpacity={0.8}
            >
              {pack.popular && (
                <View style={[styles.popularBadge, { backgroundColor: colors.warning }]}>
                  <Text style={[styles.popularText, { fontFamily: fonts.bodyBold }]}>PROMO</Text>
                </View>
              )}
              <MaterialIcons name="diamond" size={32} color="#6BCFFF" />
              <Text style={[styles.gemCount, { color: colors.text, fontFamily: fonts.heading }]}>{pack.gems}</Text>
              <Text style={[styles.gemPrice, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{pack.price}€</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Jokers Section */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="casino" size={24} color="#FF8A5B" />
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>Acheter un Joker</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>Élimine un groupe de personnages en match</Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.warning }]}
          onPress={handleBuyJoker}
          disabled={jokerLoading || !user || user.coins < 50}
          activeOpacity={0.8}
        >
          {jokerLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <MaterialIcons name="casino" size={20} color="#000" />
              <Text style={[styles.actionBtnText, { fontFamily: fonts.bodyBold }]}>50 pièces</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#000" />
              <Text style={[styles.actionBtnText, { fontFamily: fonts.bodyBold }]}>1 Joker</Text>
            </>
          )}
        </TouchableOpacity>

        {user && user.coins < 50 && (
          <Text style={[styles.insufficientText, { color: colors.error, fontFamily: fonts.body }]}>
            Il te faut {50 - user.coins} pièces supplémentaires
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  title: { fontSize: 24 },
  balanceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceLabel: { fontSize: 12 },
  balanceValue: { fontSize: 18 },
  divider: { width: 1, height: 40, backgroundColor: '#E0E0E0' },
  section: { marginBottom: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18 },
  sectionDesc: { fontSize: 13, lineHeight: 18 },
  gemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gemCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  popularBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  popularText: { fontSize: 10, color: '#000' },
  gemCount: { fontSize: 22 },
  gemPrice: { fontSize: 14 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 15, color: '#000' },
  insufficientText: { textAlign: 'center', fontSize: 12, marginTop: 8 },
  tierInfo: { gap: 6 },
  tierLabel: { fontSize: 12 },
  tierValue: { fontSize: 18 },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
  },
  progressText: { flex: 1, fontSize: 13, lineHeight: 18 },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressPercentage: { textAlign: 'center', fontSize: 12, marginTop: 4 },
});
