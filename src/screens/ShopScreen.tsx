import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';
import { BerryIcon, SharinganIcon } from '../components/icons';

const USER_QUERY = gql`
  query Me {
    me {
      id
      berry
      sharinganCount
      currentTier
    }
  }
`;

const BUY_SHARINGAN = gql`
  mutation BuySharingan {
    buySharingan {
      success
      newBerryBalance
      newSharinganCount
    }
  }
`;

// Packs Berry disponibles (backend: BERRY_PACKS)
const BERRY_PACKS = [
  { id: 'starter', berry: 2000, price: 200, bonus: 0, label: 'Starter' },
  { id: 'bronze', berry: 5500, price: 500, bonus: 10, label: 'Bronze' },
  { id: 'silver', berry: 12000, price: 1000, bonus: 20, label: 'Silver' },
  { id: 'gold', berry: 32500, price: 2500, bonus: 30, label: 'Gold' },
  { id: 'platinum', berry: 75000, price: 5000, bonus: 50, label: 'Platinum' },
];

export function ShopScreen() {
  const { colors } = useTheme();
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(USER_QUERY);
  const [buySharingan, { loading: sharinganLoading }] = useMutation<any>(BUY_SHARINGAN);

  useAuthErrorHandler(userError);

  const user = userData?.me;

  const handleBuySharingan = async () => {
    try {
      const { data: result } = await buySharingan();
      if (result.buySharingan.success) {
        Alert.alert('Sharingan acheté', `Tu as maintenant ${result.buySharingan.newSharinganCount} Sharingan`);
        refetchUser();
      } else {
        Alert.alert('Pas assez de Berry', 'Tu as besoin de 2900 Berry pour acheter un Sharingan.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const handleBuyBerryPack = (pack: typeof BERRY_PACKS[0]) => {
    Alert.alert(
      'Achat de Berry',
      `Acheter ${pack.berry} Berry pour ${pack.price} FCFA ?${pack.bonus > 0 ? ` (+${pack.bonus}% bonus)` : ''}`,
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Acheter',
          onPress: () => {
            Alert.alert('Paiement', 'Redirection vers Monapaie/GeniusPay... (Integration pending)');
            // TODO: Call purchaseBerryPack mutation
            refetchUser();
          },
        },
      ]
    );
  };

  const handleBuyNinjaPass = () => {
    Alert.alert(
      'Ninja Pass',
      'Abonnement mensuel : 150 Berry par jour + 1 Filler bonus\nPrix : 200 FCFA/mois',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Souscrire',
          onPress: () => {
            Alert.alert('Paiement', 'Redirection vers système de paiement... (Integration pending)');
            // TODO: Call purchaseNinjaPass mutation
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
              <BerryIcon size={24} color={colors.warning} />
              <View>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Berry</Text>
                <Text style={[styles.balanceValue, { color: colors.text, fontFamily: fonts.heading }]}>{user.berry}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceItem}>
              <SharinganIcon size={24} color={colors.error} />
              <View>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Sharingan</Text>
                <Text style={[styles.balanceValue, { color: colors.text, fontFamily: fonts.heading }]}>{user.sharinganCount}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Berry Packs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BerryIcon size={24} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>Packs Berry</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>Recharge ton compte avec des bonus progressifs</Text>

        <View style={styles.packGrid}>
          {BERRY_PACKS.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.packCard,
                {
                  backgroundColor: pack.bonus >= 30 ? colors.primary + '20' : colors.surface,
                  borderColor: pack.bonus >= 30 ? colors.primary : colors.border,
                  borderWidth: pack.bonus >= 30 ? 2 : 1,
                },
              ]}
              onPress={() => handleBuyBerryPack(pack)}
              activeOpacity={0.8}
            >
              {pack.bonus > 0 && (
                <View style={[styles.bonusBadge, { backgroundColor: colors.warning }]}>
                  <Text style={[styles.bonusText, { fontFamily: fonts.bodyBold }]}>+{pack.bonus}%</Text>
                </View>
              )}
              <BerryIcon size={32} color={colors.warning} />
              <Text style={[styles.packBerry, { color: colors.text, fontFamily: fonts.heading }]}>{pack.berry}</Text>
              <Text style={[styles.packLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>{pack.label}</Text>
              <Text style={[styles.packPrice, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{pack.price} FCFA</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sharingan Section */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 12 }]}>
        <View style={styles.sectionHeader}>
          <SharinganIcon size={24} color={colors.error} />
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>Acheter un Sharingan</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>Élimine un groupe de personnages ou obtiens un indice</Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.warning }]}
          onPress={handleBuySharingan}
          disabled={sharinganLoading || !user || user.berry < 2900}
          activeOpacity={0.8}
        >
          {sharinganLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <BerryIcon size={18} color="#000" />
              <Text style={[styles.actionBtnText, { fontFamily: fonts.bodyBold }]}>2900 Berry</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#000" />
              <SharinganIcon size={18} color="#000" />
              <Text style={[styles.actionBtnText, { fontFamily: fonts.bodyBold }]}>1 Sharingan</Text>
            </>
          )}
        </TouchableOpacity>

        {user && user.berry < 2900 && (
          <Text style={[styles.insufficientText, { color: colors.error, fontFamily: fonts.body }]}>
            Il te faut {2900 - user.berry} Berry supplémentaires
          </Text>
        )}
      </View>

      {/* Ninja Pass Section */}
      <View style={[styles.section, { backgroundColor: colors.primary + '15', borderColor: colors.primary, borderWidth: 2, padding: 16, borderRadius: 12 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🥷</Text>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>Ninja Pass</Text>
          <View style={[styles.ninjaPassBadge, { backgroundColor: colors.warning }]}>
            <Text style={[styles.ninjaPassBadgeText, { fontFamily: fonts.bodyBold }]}>BEST VALUE</Text>
          </View>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          Abonnement mensuel{'\n'}✓ 150 Berry par jour{'\n'}✓ +1 Filler bonus quotidien
        </Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={handleBuyNinjaPass}
          activeOpacity={0.8}
        >
          <MaterialIcons name="star" size={20} color="#FFF" />
          <Text style={[styles.actionBtnText, { color: '#FFF', fontFamily: fonts.bodyBold }]}>200 FCFA / mois</Text>
        </TouchableOpacity>
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
  packGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  packCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  bonusBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  bonusText: { fontSize: 10, color: '#000' },
  packBerry: { fontSize: 18 },
  packLabel: { fontSize: 12 },
  packPrice: { fontSize: 14 },
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
  ninjaPassBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 'auto' },
  ninjaPassBadgeText: { fontSize: 10, color: '#000' },
});
