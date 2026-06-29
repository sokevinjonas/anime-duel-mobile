import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';

const LOGIN_STREAK_QUERY = gql`
  query LoginStreakStatus {
    loginStreakStatus {
      currentDay
      maxDay
      todayReward
      claimedToday
    }
  }
`;

const TIER_CHALLENGES_QUERY = gql`
  query TierChallenges {
    tierChallenges {
      type
      target
      current
      completed
      reward
      label
      icon
    }
  }
`;

type TabType = 'streak' | 'challenges' | 'pvp';

export function MissionsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('streak');

  const { data: streakData, loading: streakLoading, error: streakError } = useQuery(LOGIN_STREAK_QUERY);
  const { data: challengesData, loading: challengesLoading, error: challengesError } = useQuery(TIER_CHALLENGES_QUERY);

  useAuthErrorHandler(streakError);
  useAuthErrorHandler(challengesError);

  const loading = streakLoading || challengesLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="assignment" size={28} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
          Missions
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === 'streak' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('streak')}
        >
          <MaterialIcons
            name="local-fire-department"
            size={20}
            color={activeTab === 'streak' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'streak' ? colors.primary : colors.textMuted,
                fontFamily: activeTab === 'streak' ? fonts.bodyBold : fonts.body,
              },
            ]}
          >
            Connexion
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === 'challenges' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('challenges')}
        >
          <MaterialIcons
            name="flag"
            size={20}
            color={activeTab === 'challenges' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'challenges' ? colors.primary : colors.textMuted,
                fontFamily: activeTab === 'challenges' ? fonts.bodyBold : fonts.body,
              },
            ]}
          >
            Défis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === 'pvp' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('pvp')}
        >
          <MaterialIcons
            name="sports-esports"
            size={20}
            color={activeTab === 'pvp' ? colors.textMuted : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: colors.textMuted,
                fontFamily: fonts.body,
              },
            ]}
          >
            Compétitif
          </Text>
          <View style={[styles.lockBadge, { backgroundColor: colors.warning }]}>
            <MaterialIcons name="lock" size={10} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text style={[styles.loading, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Chargement...
          </Text>
        )}

        {/* Streak Tab */}
        {!loading && activeTab === 'streak' && streakData && (
          <View style={styles.streakContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
              Connexion Quotidienne
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Connecte-toi chaque jour pour augmenter ta série
            </Text>

            {/* Progress Card */}
            <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.streakHeader}>
                <MaterialIcons name="local-fire-department" size={32} color="#FF6B35" />
                <View>
                  <Text style={[styles.streakDay, { color: colors.text, fontFamily: fonts.heading }]}>
                    Jour {streakData.loginStreakStatus.currentDay}
                  </Text>
                  <Text style={[styles.streakMax, { color: colors.textMuted, fontFamily: fonts.body }]}>
                    / {streakData.loginStreakStatus.maxDay} jours
                  </Text>
                </View>
              </View>

              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.warning,
                      width: `${(streakData.loginStreakStatus.currentDay / streakData.loginStreakStatus.maxDay) * 100}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.rewardRow}>
                <Text style={[styles.rewardLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  Récompense du jour :
                </Text>
                <View style={styles.rewardBadge}>
                  <MaterialIcons name="toll" size={18} color="#FFD93D" />
                  <Text style={[styles.rewardValue, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                    +{streakData.loginStreakStatus.todayReward}
                  </Text>
                </View>
              </View>

              {streakData.loginStreakStatus.claimedToday && (
                <View style={[styles.claimedBadge, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="check-circle" size={16} color="#FFF" />
                  <Text style={[styles.claimedText, { fontFamily: fonts.bodyBold }]}>
                    Récupéré aujourd'hui
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Challenges Tab */}
        {!loading && activeTab === 'challenges' && challengesData && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
              Défis de Progression
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Complète ces défis pour gagner des récompenses
            </Text>

            <View style={styles.challengesList}>
              {challengesData.tierChallenges.map((challenge: any, index: number) => {
                const progress = Math.min((challenge.current / challenge.target) * 100, 100);

                return (
                  <View
                    key={index}
                    style={[
                      styles.challengeCard,
                      {
                        backgroundColor: challenge.completed ? colors.primary + '15' : colors.surface,
                        borderColor: challenge.completed ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: challenge.completed ? colors.primary : colors.surfaceElevated,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={challenge.icon as any}
                        size={24}
                        color={challenge.completed ? '#FFF' : colors.primary}
                      />
                    </View>

                    <View style={styles.challengeContent}>
                      <Text style={[styles.challengeLabel, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                        {challenge.label}
                      </Text>

                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.progressFillSmall,
                              {
                                backgroundColor: challenge.completed ? colors.primary : colors.primary + '80',
                                width: `${progress}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.progressText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                          {challenge.current}/{challenge.target}
                        </Text>
                      </View>

                      <View style={styles.rewardRowSmall}>
                        <MaterialIcons name="toll" size={14} color="#FFD93D" />
                        <Text style={[styles.rewardSmall, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                          +{challenge.reward}
                        </Text>
                      </View>
                    </View>

                    {challenge.completed && (
                      <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* PVP Tab (Locked) */}
        {!loading && activeTab === 'pvp' && (
          <View style={styles.lockedContainer}>
            <MaterialIcons name="lock" size={64} color={colors.textMuted} />
            <Text style={[styles.lockedTitle, { color: colors.text, fontFamily: fonts.heading }]}>
              Mode Compétitif
            </Text>
            <Text style={[styles.lockedDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Les missions PvP en ligne seront bientôt disponibles
            </Text>
            <View style={[styles.comingSoonBadge, { backgroundColor: colors.warning }]}>
              <Text style={[styles.comingSoonText, { fontFamily: fonts.bodyBold }]}>
                BIENTÔT
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: { fontSize: 24 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 3,
  },
  tabText: { fontSize: 13 },
  lockBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  loading: { textAlign: 'center', marginTop: 40 },
  sectionTitle: { fontSize: 20, marginBottom: 8 },
  sectionDesc: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  streakContainer: { gap: 16 },
  streakCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  streakHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  streakDay: { fontSize: 28 },
  streakMax: { fontSize: 14 },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 6 },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardLabel: { fontSize: 14 },
  rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardValue: { fontSize: 18 },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  claimedText: { color: '#FFF', fontSize: 13 },
  challengesList: { gap: 12 },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeContent: { flex: 1, gap: 6 },
  challengeLabel: { fontSize: 15 },
  progressContainer: { gap: 4 },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillSmall: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11 },
  rewardRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardSmall: { fontSize: 14 },
  lockedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  lockedTitle: { fontSize: 22 },
  lockedDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  comingSoonBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  comingSoonText: { color: '#FFF', fontSize: 13, letterSpacing: 1 },
});
