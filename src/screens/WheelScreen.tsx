import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { SharinganEyeIcon } from '../components/icons/SharinganEyeIcon';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';

const WHEEL_STATUS_QUERY = gql`
  query WheelStatus {
    getWheelStatus {
      canSpinFree
      berry
    }
  }
`;

const SPIN_WHEEL = gql`
  mutation SpinWheel($useFree: Boolean!) {
    spin(useFree: $useFree) {
      reward {
        type
        amount
      }
      nearMiss
      message
    }
  }
`;

export function WheelScreen() {
  const { colors } = useTheme();

  const WHEEL_REWARDS = [
    { type: 'berry', amount: 10, chance: '40%', color: colors.warning, icon: '🫐' },
    { type: 'berry', amount: 30, chance: '25%', color: colors.warning, icon: '🫐' },
    { type: 'berry', amount: 50, chance: '15%', color: colors.warning, icon: '🫐' },
    { type: 'chakra', amount: 1, chance: '10%', color: colors.info, icon: '⚡' },
    { type: 'berry', amount: 200, chance: '7%', color: colors.warning, icon: '🫐' },
    { type: 'sharingan', amount: 1, chance: '3%', color: colors.sharingan, icon: 'sharingan-eye' },
  ];
  const { data, loading, error, refetch } = useQuery(WHEEL_STATUS_QUERY);
  const [spin, { loading: spinning }] = useMutation(SPIN_WHEEL);
  const [lastReward, setLastReward] = useState<{ type: string; amount: number } | null>(null);
  const [spinAnimation] = useState(new Animated.Value(0));

  useAuthErrorHandler(error);

  const wheelStatus = data?.getWheelStatus;
  const canSpinFree = wheelStatus?.canSpinFree || false;
  const currentBerry = wheelStatus?.berry || 0;
  const spinCost = 100;

  const handleSpin = async (useFree: boolean) => {
    if (!useFree && currentBerry < spinCost) {
      Alert.alert('Pas assez de Berry', `Il te faut ${spinCost} Berry pour faire tourner la roue.`);
      return;
    }

    try {
      // Animation
      spinAnimation.setValue(0);
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();

      const { data: result } = await spin({ variables: { useFree } });

      setTimeout(() => {
        if (result.spin.reward) {
          setLastReward(result.spin.reward);
          Alert.alert(
            'Félicitations !',
            result.spin.message,
            [{ text: 'OK', onPress: () => refetch() }]
          );
        }
      }, 2000);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de faire tourner la roue');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="casino" size={28} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
          Roue du Destin
        </Text>
      </View>

      {/* Balance */}
      <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          Ton Berry
        </Text>
        <Text style={[styles.balanceValue, { color: colors.warning, fontFamily: fonts.heading }]}>
          🫐 {currentBerry}
        </Text>
      </View>

      {/* Wheel Visual */}
      <View style={styles.wheelContainer}>
        <LinearGradient
          colors={[colors.primary, colors.warning]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.wheelCircle}
        >
          <Animated.View
            style={[
              styles.wheelInner,
              {
                transform: [
                  {
                    rotate: spinAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '1440deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.wheelCenter, { backgroundColor: colors.surface }]}>
              <Text style={[styles.wheelEmoji, { fontSize: 48 }]}>🎰</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Pointer */}
        <View style={[styles.pointer, { borderBottomColor: colors.error }]} />
      </View>

      {/* Last Reward */}
      {lastReward && (
        <View style={[styles.lastRewardCard, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <MaterialIcons name="check-circle" size={20} color={colors.success} />
          <Text style={[styles.lastRewardText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
            Dernier gain : {lastReward.type === 'berry' ? '🫐' : lastReward.type === 'chakra' ? '⚡' : '👁️'} {lastReward.amount}
          </Text>
        </View>
      )}

      {/* Rewards List */}
      <View style={styles.rewardsSection}>
        <Text style={[styles.rewardsTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          Récompenses possibles
        </Text>
        <View style={styles.rewardsList}>
          {WHEEL_REWARDS.map((reward, index) => (
            <View
              key={index}
              style={[styles.rewardItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {reward.icon === 'sharingan-eye' ? (
                <SharinganEyeIcon size={28} color={colors.error} />
              ) : (
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
              )}
              <Text style={[styles.rewardAmount, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                {reward.amount}
              </Text>
              <Text style={[styles.rewardChance, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {reward.chance}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Spin Buttons */}
      <View style={styles.actionButtons}>
        {/* Free Spin */}
        {canSpinFree && (
          <TouchableOpacity
            style={[styles.spinBtn, { backgroundColor: colors.success }]}
            onPress={() => handleSpin(true)}
            disabled={spinning}
          >
            {spinning ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialIcons name="stars" size={20} color="#FFF" />
                <Text style={[styles.spinBtnText, { fontFamily: fonts.bodyBold }]}>
                  SPIN GRATUIT
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Paid Spin */}
        <TouchableOpacity
          style={[
            styles.spinBtn,
            {
              backgroundColor: currentBerry >= spinCost ? colors.warning : colors.border,
            },
          ]}
          onPress={() => handleSpin(false)}
          disabled={spinning || currentBerry < spinCost}
        >
          {spinning ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Text style={styles.spinEmoji}>🫐</Text>
              <Text style={[styles.spinBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                {spinCost} BERRY
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {!canSpinFree && (
        <Text style={[styles.infoText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          ℹ️ Spin gratuit disponible une fois par jour
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 20,
  },
  wheelContainer: {
    alignItems: 'center',
    marginVertical: 32,
    position: 'relative',
  },
  wheelCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelInner: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelEmoji: {
    fontSize: 48,
  },
  pointer: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  lastRewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 24,
  },
  lastRewardText: {
    fontSize: 14,
  },
  rewardsSection: {
    marginBottom: 24,
  },
  rewardsTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rewardIcon: {
    fontSize: 18,
  },
  rewardAmount: {
    fontSize: 13,
  },
  rewardChance: {
    fontSize: 11,
  },
  actionButtons: {
    gap: 12,
  },
  spinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  spinEmoji: {
    fontSize: 18,
  },
  spinBtnText: {
    fontSize: 15,
    color: '#FFF',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 12,
  },
});
