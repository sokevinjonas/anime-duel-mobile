import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';
import { Button3D } from '../components/ui/Button3D';

const ARC_MISSIONS_QUERY = gql`
  query ArcMissions {
    getMissionsForUser {
      id
      arc
      type
      targetValue
      reward {
        berry
        chakra
        sharingan
      }
      progress {
        currentValue
        claimed
      }
    }
  }
`;

const CLAIM_MISSION_REWARD = gql`
  mutation ClaimMissionReward($missionId: String!) {
    claimMissionReward(missionId: $missionId) {
      success
      message
      rewards {
        berry
        chakra
        sharingan
      }
    }
  }
`;

export function MissionsScreen() {
  const { colors } = useTheme();
  const { data, loading, error, refetch } = useQuery(ARC_MISSIONS_QUERY);
  const [claimReward, { loading: claiming }] = useMutation(CLAIM_MISSION_REWARD);

  useAuthErrorHandler(error);

  const missions = data?.getMissionsForUser || [];

  // Group missions by arc
  const missionsByArc = missions.reduce((acc: any, mission: any) => {
    if (!acc[mission.arc]) acc[mission.arc] = [];
    acc[mission.arc].push(mission);
    return acc;
  }, {});

  const arcTitles: Record<number, string> = {
    0: 'Arc 0 : Découverte',
    1: 'Arc 1 : Apprenti Ninja',
    2: 'Arc 2 : Chunin',
    3: 'Arc 3 : Jonin',
  };

  const getMissionLabel = (type: string, targetValue: number): string => {
    switch (type) {
      case 'play_first_duel':
        return 'Joue ton premier duel';
      case 'win_first_easy':
        return 'Gagne un match facile';
      case 'ask_questions':
        return `Pose ${targetValue} questions`;
      case 'use_first_sharingan':
        return 'Utilise ton premier Sharingan';
      case 'reach_episode':
        return `Atteins l'épisode ${targetValue}`;
      case 'win_no_sharingan_hard':
        return 'Gagne un match difficile sans Sharingan';
      case 'win_streak':
        return `Gagne ${targetValue} matchs d'affilée`;
      case 'complete_daily':
        return `Complète ${targetValue} quêtes du jour`;
      case 'play_pvp':
        return `Joue ${targetValue} matchs PvP`;
      case 'win_pvp':
        return `Gagne ${targetValue} matchs PvP`;
      default:
        return type;
    }
  };

  const handleClaimReward = async (missionId: string) => {
    try {
      const { data: result } = await claimReward({ variables: { missionId } });
      if (result.claimMissionReward.success) {
        Alert.alert('Récompense obtenue !', result.claimMissionReward.message);
        await refetch();
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de récupérer la récompense');
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="assignment" size={28} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
          Missions d'Arc
        </Text>
      </View>

      {/* Missions by Arc */}
      {Object.keys(missionsByArc).sort((a, b) => Number(a) - Number(b)).map((arc) => (
        <View key={arc} style={styles.arcSection}>
          <View style={styles.arcHeader}>
            <Text style={[styles.arcTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
              {arcTitles[Number(arc)] || `Arc ${arc}`}
            </Text>
          </View>

          {missionsByArc[arc].map((mission: any) => {
            const isCompleted = mission.progress.currentValue >= mission.targetValue;
            const isClaimed = mission.progress.claimed;

            return (
              <View
                key={mission.id}
                style={[
                  styles.missionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isCompleted && !isClaimed ? colors.success : colors.border,
                    borderWidth: isCompleted && !isClaimed ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.missionContent}>
                  <View style={styles.missionInfo}>
                    <Text style={[styles.missionLabel, { color: colors.text, fontFamily: fonts.body }]}>
                      {getMissionLabel(mission.type, mission.targetValue)}
                    </Text>
                    <Text style={[styles.missionProgress, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                      Progression : {mission.progress.currentValue}/{mission.targetValue}
                    </Text>

                    {/* Progress Bar */}
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: isCompleted ? colors.success : colors.primary,
                            width: `${Math.min(100, (mission.progress.currentValue / mission.targetValue) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.missionReward}>
                    {mission.reward.berry > 0 && (
                      <Text style={[styles.rewardText, { color: colors.warning, fontFamily: fonts.bodyBold }]}>
                        🫐 {mission.reward.berry}
                      </Text>
                    )}
                    {mission.reward.chakra > 0 && (
                      <Text style={[styles.rewardText, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
                        ⚡ {mission.reward.chakra}
                      </Text>
                    )}
                    {mission.reward.sharingan > 0 && (
                      <Text style={[styles.rewardText, { color: colors.error, fontFamily: fonts.bodyBold }]}>
                        👁️ {mission.reward.sharingan}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Claim Button */}
                {isCompleted && !isClaimed && (
                  <TouchableOpacity
                    style={[styles.claimBtn, { backgroundColor: colors.success }]}
                    onPress={() => handleClaimReward(mission.id)}
                    disabled={claiming}
                  >
                    {claiming ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={[styles.claimBtnText, { fontFamily: fonts.bodyBold }]}>RÉCLAMER</Text>
                    )}
                  </TouchableOpacity>
                )}

                {isClaimed && (
                  <View style={[styles.claimedBadge, { backgroundColor: colors.border }]}>
                    <MaterialIcons name="check-circle" size={16} color={colors.success} />
                    <Text style={[styles.claimedText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                      Réclamé
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {missions.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="check-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fonts.body }]}>
            Toutes les missions complétées !
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  arcSection: {
    marginBottom: 24,
  },
  arcHeader: {
    marginBottom: 12,
  },
  arcTitle: {
    fontSize: 18,
  },
  missionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  missionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  missionInfo: {
    flex: 1,
    gap: 8,
  },
  missionLabel: {
    fontSize: 14,
  },
  missionProgress: {
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  missionReward: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
  },
  claimBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimBtnText: {
    fontSize: 13,
    color: '#FFF',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  claimedText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
