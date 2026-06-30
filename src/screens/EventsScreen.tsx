import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';

const CURRENT_EVENT_QUERY = gql`
  query CurrentEvent {
    getCurrentEvent {
      theme
      startDate
      endDate
    }
  }
`;

const EVENT_PROGRESS_QUERY = gql`
  query EventProgress {
    getEventProgress {
      wins
      losses
      hasEntered
    }
  }
`;

const USER_BERRY_QUERY = gql`
  query UserBerry {
    me {
      berry
    }
  }
`;

const ENTER_EVENT = gql`
  mutation EnterEvent {
    enterEvent {
      success
      message
    }
  }
`;

const EVENT_THEMES = [
  { name: 'Spécial Naruto', emoji: '🥷', description: 'Personnages exclusifs de Naruto' },
  { name: 'Spécial One Piece', emoji: '🏴‍☠️', description: 'Pirates et Devil Fruits' },
  { name: 'Spécial Attack on Titan', emoji: '⚔️', description: 'Titans et Survey Corps' },
  { name: 'Spécial My Hero Academia', emoji: '🦸', description: 'Héros et Vilains' },
  { name: 'Spécial Demon Slayer', emoji: '🗡️', description: 'Demon Slayers et Hashira' },
  { name: 'Spécial Death Note', emoji: '📓', description: 'Génies et stratèges' },
  { name: 'Spécial Dragon Ball', emoji: '🐉', description: 'Saiyans et guerriers Z' },
  { name: 'Spécial Jujutsu Kaisen', emoji: '👹', description: 'Sorciers et malédictions' },
];

const EVENT_REWARDS = [
  { wins: 3, berry: 500, sharingan: 1, label: '3 Victoires' },
  { wins: 2, berry: 200, sharingan: 0, label: '2 Victoires' },
  { wins: 1, berry: 50, sharingan: 0, label: '1 Victoire' },
  { wins: 0, berry: 0, sharingan: 0, label: 'Participation' },
];

export function EventsScreen() {
  const { colors } = useTheme();
  const { data: eventData, loading: eventLoading, error: eventError } = useQuery(CURRENT_EVENT_QUERY);
  const { data: progressData, loading: progressLoading, error: progressError, refetch: refetchProgress } = useQuery(EVENT_PROGRESS_QUERY);
  const { data: userData, loading: userLoading, error: userError } = useQuery(USER_BERRY_QUERY);
  const [enterEvent, { loading: entering }] = useMutation(ENTER_EVENT);

  useAuthErrorHandler(eventError);
  useAuthErrorHandler(progressError);
  useAuthErrorHandler(userError);

  const event = eventData?.getCurrentEvent;
  const progress = progressData?.getEventProgress;
  const currentBerry = userData?.me?.berry || 0;

  const eventTheme = EVENT_THEMES.find(t => t.name === event?.theme) || EVENT_THEMES[0];
  const entryFee = 50;
  const hasEntered = progress?.hasEntered || false;
  const wins = progress?.wins || 0;
  const losses = progress?.losses || 0;
  const isEliminated = losses >= 2;
  const isComplete = wins >= 3 || isEliminated;

  const handleEnter = async () => {
    if (currentBerry < entryFee) {
      Alert.alert('Pas assez de Berry', `Il te faut ${entryFee} Berry pour participer.`);
      return;
    }

    try {
      const { data: result } = await enterEvent();
      if (result.enterEvent.success) {
        Alert.alert('Inscription réussie !', result.enterEvent.message);
        await refetchProgress();
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de s\'inscrire');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getReward = () => {
    return EVENT_REWARDS.find(r => r.wins === wins) || EVENT_REWARDS[3];
  };

  if (eventLoading || progressLoading || userLoading) {
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
        <MaterialIcons name="event" size={28} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
          Événement Hebdo
        </Text>
      </View>

      {/* Event Theme */}
      <LinearGradient
        colors={[colors.warning + '30', colors.primary + '30']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.themeCard, { borderColor: colors.warning }]}
      >
        <Text style={styles.themeEmoji}>{eventTheme.emoji}</Text>
        <Text style={[styles.themeName, { color: colors.text, fontFamily: fonts.heading }]}>
          {eventTheme.name}
        </Text>
        <Text style={[styles.themeDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          {eventTheme.description}
        </Text>
        {event && (
          <View style={styles.themeDates}>
            <Text style={[styles.themeDate, { color: colors.textMuted, fontFamily: fonts.body }]}>
              Du {formatDate(event.startDate)} au {formatDate(event.endDate)}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Format Info */}
      <View style={[styles.formatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formatTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          Format : Run 3W-2L
        </Text>
        <Text style={[styles.formatDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          • Joue jusqu'à 3 victoires ou 2 défaites{'\n'}
          • Frais d'entrée : 50 Berry{'\n'}
          • Récompenses selon tes victoires
        </Text>
      </View>

      {/* Progress */}
      {hasEntered && (
        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.progressTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
            Ta progression
          </Text>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                {wins} Victoires
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <MaterialIcons name="cancel" size={24} color={colors.error} />
              <Text style={[styles.statValue, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                {losses} Défaites
              </Text>
            </View>
          </View>

          {isComplete && (
            <View style={[styles.completeBadge, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
              <MaterialIcons name="emoji-events" size={20} color={colors.success} />
              <Text style={[styles.completeText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                Run terminé ! Récompense : 🫐 {getReward().berry}
                {getReward().sharingan > 0 && ` + 👁️ ${getReward().sharingan}`}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Rewards */}
      <View style={styles.rewardsSection}>
        <Text style={[styles.rewardsTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          Récompenses
        </Text>

        {EVENT_REWARDS.map((reward, index) => (
          <View
            key={index}
            style={[
              styles.rewardCard,
              {
                backgroundColor: hasEntered && wins === reward.wins ? colors.success + '20' : colors.surfaceElevated,
                borderColor: hasEntered && wins === reward.wins ? colors.success : colors.border,
                borderWidth: hasEntered && wins === reward.wins ? 2 : 1,
              },
            ]}
          >
            <View style={styles.rewardInfo}>
              <Text style={[styles.rewardLabel, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                {reward.label}
              </Text>
            </View>

            <View style={styles.rewardValues}>
              {reward.berry > 0 && (
                <Text style={[styles.rewardValue, { color: colors.warning, fontFamily: fonts.bodyBold }]}>
                  🫐 {reward.berry}
                </Text>
              )}
              {reward.sharingan > 0 && (
                <Text style={[styles.rewardValue, { color: colors.error, fontFamily: fonts.bodyBold }]}>
                  👁️ {reward.sharingan}
                </Text>
              )}
              {reward.berry === 0 && reward.sharingan === 0 && (
                <Text style={[styles.rewardValue, { color: colors.textMuted, fontFamily: fonts.body }]}>
                  -
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Entry Button */}
      {!hasEntered && (
        <View style={styles.entrySection}>
          <View style={[styles.balanceInfo, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Ton Berry :
            </Text>
            <Text style={[styles.balanceValue, { color: currentBerry >= entryFee ? colors.success : colors.error, fontFamily: fonts.bodyBold }]}>
              🫐 {currentBerry}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.entryBtn,
              {
                backgroundColor: currentBerry >= entryFee ? colors.warning : colors.border,
              },
            ]}
            onPress={handleEnter}
            disabled={entering || currentBerry < entryFee}
          >
            {entering ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <MaterialIcons name="login" size={20} color="#000" />
                <Text style={[styles.entryBtnText, { fontFamily: fonts.bodyBold }]}>
                  PARTICIPER (50 Berry)
                </Text>
              </>
            )}
          </TouchableOpacity>
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
  themeCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  themeEmoji: {
    fontSize: 64,
  },
  themeName: {
    fontSize: 22,
    textAlign: 'center',
  },
  themeDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  themeDates: {
    marginTop: 8,
  },
  themeDate: {
    fontSize: 12,
    textAlign: 'center',
  },
  formatCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  formatTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  formatDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  progressCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  progressTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  completeText: {
    fontSize: 13,
    flex: 1,
  },
  rewardsSection: {
    marginBottom: 20,
  },
  rewardsTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  rewardInfo: {},
  rewardLabel: {
    fontSize: 14,
  },
  rewardValues: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardValue: {
    fontSize: 13,
  },
  entrySection: {
    gap: 12,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  balanceLabel: {
    fontSize: 13,
  },
  balanceValue: {
    fontSize: 15,
  },
  entryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  entryBtnText: {
    fontSize: 15,
    color: '#000',
  },
});
