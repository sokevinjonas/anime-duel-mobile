import { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from './ui/Button3D';

const REFILL_CHAKRA_BERRY = gql`
  mutation RefillChakraWithBerry {
    refillChakraWithBerry {
      success
      newChakra
      berrySpent
    }
  }
`;

const REFILL_CHAKRA_FILLER = gql`
  mutation RefillChakraWithFiller {
    refillChakraWithFiller {
      success
      newChakra
      fillersUsedToday
    }
  }
`;

const USER_CHAKRA_QUERY = gql`
  query UserChakra {
    me {
      id
      chakra
      maxChakra
      berry
      fillerUsedToday
      refillCountToday
    }
  }
`;

interface ChakraModalProps {
  visible: boolean;
  onClose: () => void;
  onShowResponse: (data: {
    success: boolean;
    errorType?: 'insufficient_berry' | 'max_chakra' | 'max_fillers' | 'other';
    currentBerry?: number;
    cost?: number;
    newChakra?: number;
  }) => void;
}

export function ChakraModal({
  visible,
  onClose,
  onShowResponse,
}: ChakraModalProps) {
  const { colors } = useTheme();
  const { data, loading, refetch } = useQuery(USER_CHAKRA_QUERY, { skip: !visible });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [refillBerry, { loading: refillingBerry }] = useMutation(REFILL_CHAKRA_BERRY);
  const [refillFiller, { loading: refillingFiller }] = useMutation(REFILL_CHAKRA_FILLER);

  const user = data?.me;
  const currentChakra = user?.chakra || 0;
  const maxChakra = user?.maxChakra || 8;
  const currentBerry = user?.berry || 0;
  const fillersUsed = user?.fillerUsedToday || 0;
  const refillCountToday = user?.refillCountToday || 0;

  // Calculate refill price (doubling pattern: 30, 60, 120, 240...)
  const refillPriceBerry = 30 * Math.pow(2, refillCountToday);
  const canUseBerry = currentBerry >= refillPriceBerry;
  const canUseFiller = fillersUsed < 3;

  // Estimate time to next Chakra (30 min per batch of 3)
  // Note: Timer is approximate since we don't have lastChakraRegen from backend yet
  useEffect(() => {
    if (!visible || currentChakra >= maxChakra) {
      setTimeRemaining(0);
      return;
    }

    // Show static timer of 30 min (will be accurate once backend exposes lastChakraRegen)
    setTimeRemaining(30 * 60 * 1000);
  }, [visible, currentChakra, maxChakra]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRefillBerry = async () => {
    // Vérifier AVANT l'appel API pour avoir les bonnes valeurs
    const berryBeforeCall = currentBerry;
    const chakraBeforeCall = currentChakra;
    const priceBeforeCall = refillPriceBerry;

    console.log('🔍 Refill Berry attempt:', {
      berry: berryBeforeCall,
      chakra: chakraBeforeCall,
      maxChakra,
      price: priceBeforeCall,
      hasEnough: berryBeforeCall >= priceBeforeCall,
      isFull: chakraBeforeCall >= maxChakra,
    });

    try {
      const { data: result } = await refillBerry();
      console.log('📦 API Response:', result.refillChakraWithBerry);
      await refetch();

      let responseData;
      if (result.refillChakraWithBerry.success) {
        responseData = {
          success: true,
          newChakra: result.refillChakraWithBerry.newChakra,
        };
      } else {
        // Échec : déterminer pourquoi avec les valeurs AVANT l'appel
        if (berryBeforeCall < priceBeforeCall) {
          console.log('❌ Insufficient berry detected');
          responseData = {
            success: false,
            errorType: 'insufficient_berry' as const,
            currentBerry: berryBeforeCall,
            cost: priceBeforeCall,
          };
          onClose(); // Fermer le ChakraModal
        } else if (chakraBeforeCall >= maxChakra) {
          console.log('❌ Max chakra detected');
          responseData = { success: false, errorType: 'max_chakra' as const };
        } else {
          console.log('❌ Other error detected');
          responseData = { success: false, errorType: 'other' as const };
        }
      }
      onShowResponse(responseData);
    } catch (error: any) {
      console.log('❌ Exception:', error);
      onShowResponse({ success: false, errorType: 'other' });
    }
  };

  const handleRefillFiller = async () => {
    try {
      const { data: result } = await refillFiller();
      await refetch();

      let responseData;
      if (result.refillChakraWithFiller.success) {
        responseData = {
          success: true,
          newChakra: result.refillChakraWithFiller.newChakra,
        };
      } else {
        if (fillersUsed >= 3) {
          responseData = { success: false, errorType: 'max_fillers' as const };
        } else if (currentChakra >= maxChakra) {
          responseData = { success: false, errorType: 'max_chakra' as const };
        } else {
          responseData = { success: false, errorType: 'other' as const };
        }
      }
      onShowResponse(responseData);
    } catch (error: any) {
      onShowResponse({ success: false, errorType: 'other' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
              ⚡ Chakra
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Chakra Status */}
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.chakraCard, { borderColor: colors.primary }]}
          >
            <View style={styles.chakraRow}>
              <Text style={[styles.chakraLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Chakra actuel
              </Text>
              <Text style={[styles.chakraValue, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
                {currentChakra} / {maxChakra}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: currentChakra === maxChakra ? colors.success : colors.primary,
                    width: `${(currentChakra / maxChakra) * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Timer */}
            {currentChakra < maxChakra && (
              <View style={styles.timerSection}>
                <Text style={[styles.timerLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Prochaine régénération dans:
                </Text>
                <Text style={[styles.timerValue, { color: colors.primary, fontFamily: fonts.bodyBlack }]}>
                  {formatTime(timeRemaining)}
                </Text>
                <Text style={[styles.timerInfo, { color: colors.textMuted, fontFamily: fonts.body }]}>
                  (+3 Chakra toutes les 30 min)
                </Text>
              </View>
            )}

            {currentChakra === maxChakra && (
              <View style={styles.timerSection}>
                <Text style={[styles.timerLabel, { color: colors.success, fontFamily: fonts.bodyBold }]}>
                  ✓ Chakra complet!
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Refill Options */}
          <View style={styles.refillSection}>
            <Text style={[styles.refillSectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
              Recharger instantanément
            </Text>

            {/* Refill with Berry */}
            <View style={[styles.refillCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.refillHeader}>
                <Text style={[styles.refillTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  🫐 Avec Berry
                </Text>
                <Text style={[styles.refillSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Prix double à chaque refill (reset quotidien)
                </Text>
              </View>

              <View style={styles.refillCost}>
                <Text style={[styles.refillCostText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Coût:
                </Text>
                <View style={[styles.costBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.costText, { color: colors.warning, fontFamily: fonts.bodyBold }]}>
                    🫐 {refillPriceBerry}
                  </Text>
                </View>
                <Text style={[styles.berryAvailable, { color: canUseBerry ? colors.success : colors.error, fontFamily: fonts.body }]}>
                  (Tu as: {currentBerry})
                </Text>
              </View>

              {canUseBerry ? (
                <Button3D
                  title={refillingBerry ? 'RECHARGE...' : 'RECHARGER'}
                  color={colors.warning}
                  darkColor={colors.warningDark}
                  onPress={handleRefillBerry}
                  disabled={refillingBerry}
                  size="medium"
                />
              ) : (
                <Button3D
                  title="ACHETER BERRY"
                  color={colors.warning}
                  darkColor={colors.warningDark}
                  onPress={onShowResponse.bind(null, {
                    success: false,
                    errorType: 'insufficient_berry' as const,
                    currentBerry,
                    cost: refillPriceBerry,
                  })}
                  size="medium"
                />
              )}
            </View>

            {/* Refill with Filler */}
            <View style={[styles.refillCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.refillHeader}>
                <Text style={[styles.refillTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  🔥 Avec Filler
                </Text>
                <Text style={[styles.refillSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Gratuit • Max 3/jour
                </Text>
              </View>

              <View style={styles.fillerStatus}>
                <Text style={[styles.fillerText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Utilisés aujourd'hui: {fillersUsed}/3
                </Text>
              </View>

              <Button3D
                title={refillingFiller ? 'RECHARGE...' : 'UTILISER FILLER'}
                color={canUseFiller ? colors.primary : colors.border}
                darkColor={canUseFiller ? colors.primaryDark : colors.border}
                onPress={handleRefillFiller}
                disabled={!canUseFiller || refillingFiller}
                size="medium"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
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
  chakraCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  chakraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chakraLabel: {
    fontSize: 14,
  },
  chakraValue: {
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
  refillSection: {
    gap: 12,
  },
  refillSectionTitle: {
    fontSize: 16,
  },
  refillCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  refillHeader: {
    gap: 4,
  },
  refillTitle: {
    fontSize: 14,
  },
  refillSubtitle: {
    fontSize: 12,
  },
  refillCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
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
  berryAvailable: {
    fontSize: 12,
  },
  fillerStatus: {
    paddingVertical: 4,
  },
  fillerText: {
    fontSize: 13,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
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
