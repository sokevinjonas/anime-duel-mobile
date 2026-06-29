import { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from './ui/Button3D';
import { useEnergySocket } from '../hooks/useEnergySocket';

const REFILL_ENERGY = gql`
  mutation RefillEnergyWithGems {
    refillEnergyWithGems {
      success
      newEnergy
      gemsSpent
    }
  }
`;

interface EnergyModalProps {
  visible: boolean;
  onClose: () => void;
  currentGems: number;
  onPlay?: () => void;
}

export function EnergyModal({
  visible,
  onClose,
  currentGems,
  onPlay,
}: EnergyModalProps) {
  const { colors, isDark } = useTheme();
  const { energyStatus, isConnected } = useEnergySocket();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [refillEnergy, { loading: refilling }] = useMutation(REFILL_ENERGY);
  const [receivedAt, setReceivedAt] = useState<number>(0);

  useEffect(() => {
    if (energyStatus) {
      setReceivedAt(Date.now());
    }
  }, [energyStatus?.timeToNextMs]);

  useEffect(() => {
    if (!visible || !energyStatus || energyStatus.current >= energyStatus.max) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - receivedAt;
      const remaining = Math.max(0, energyStatus.timeToNextMs - elapsed);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100); // Update faster for smooth countdown

    return () => clearInterval(interval);
  }, [visible, energyStatus, receivedAt]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRefill = async () => {
    try {
      await refillEnergy();
    } catch (error) {
      console.error('Error refilling energy:', error);
    }
  };

  const canRefill = currentGems >= (energyStatus?.refillCostGems || 10);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
              ⚡ Énergie
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Connection Status */}
          {!isConnected && (
            <Text style={[styles.connectionStatus, { color: colors.error, fontFamily: fonts.body }]}>
              ⚠️ Synchronisation en cours...
            </Text>
          )}

          {/* Energy Status */}
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.energyCard, { borderColor: colors.primary }]}
          >
            <View style={styles.energyRow}>
              <Text style={[styles.energyLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Énergie actuelle
              </Text>
              <Text style={[styles.energyValue, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
                {energyStatus?.current || 0} / {energyStatus?.max || 5}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: energyStatus?.current === energyStatus?.max ? colors.success : colors.primary,
                    width: `${((energyStatus?.current || 0) / (energyStatus?.max || 5)) * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Timer */}
            {energyStatus && energyStatus.current < energyStatus.max && (
              <View style={styles.timerSection}>
                <Text style={[styles.timerLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Prochaine génération dans:
                </Text>
                <Text style={[styles.timerValue, { color: colors.primary, fontFamily: fonts.bodyBlack }]}>
                  {formatTime(timeRemaining)}
                </Text>
                <Text style={[styles.timerInfo, { color: colors.textMuted, fontFamily: fonts.body }]}>
                  ({(energyStatus.regenTimePerHeartMs / 60000).toFixed(0)} min par cœur)
                </Text>
              </View>
            )}

            {energyStatus && energyStatus.current === energyStatus.max && (
              <View style={styles.timerSection}>
                <Text style={[styles.timerLabel, { color: colors.success, fontFamily: fonts.bodyBold }]}>
                  ✓ Énergie complète!
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Refill Option */}
          <View style={[styles.refillCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.refillHeader}>
              <Text style={[styles.refillTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                Recharger instantanément
              </Text>
            </View>

            <View style={styles.refillCost}>
              <Text style={[styles.refillCostText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Coût:
              </Text>
              <View style={styles.costBadge}>
                <Text style={[styles.costText, { color: colors.warning, fontFamily: fonts.bodyBold }]}>
                  💎 {energyStatus?.refillCostGems || 10}
                </Text>
              </View>
              <Text style={[styles.gemsAvailable, { color: canRefill ? colors.success : colors.error, fontFamily: fonts.body }]}>
                (Tu en as: {currentGems})
              </Text>
            </View>

            <Button3D
              title={refilling ? 'RECHARGE...' : 'RECHARGER'}
              color={canRefill ? colors.warning : colors.border}
              darkColor={canRefill ? colors.warningDark : colors.border}
              onPress={handleRefill}
              disabled={!canRefill || refilling}
              size="large"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {onPlay && energyStatus && energyStatus.current > 0 && (
              <Button3D
                title="JOUER"
                color={colors.primary}
                darkColor={colors.primaryDark}
                onPress={onPlay}
                size="large"
              />
            )}
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.border }]} onPress={onClose}>
              <Text style={[styles.closeBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
  },
  connectionStatus: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  energyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  energyLabel: {
    fontSize: 14,
  },
  energyValue: {
    fontSize: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerSection: {
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timerLabel: {
    fontSize: 13,
  },
  timerValue: {
    fontSize: 32,
    marginVertical: 4,
  },
  timerInfo: {
    fontSize: 12,
  },
  refillCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  refillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refillTitle: {
    fontSize: 14,
  },
  refillCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refillCostText: {
    fontSize: 13,
  },
  costBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  costText: {
    fontSize: 14,
  },
  gemsAvailable: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    gap: 12,
  },
  closeBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
  },
});
