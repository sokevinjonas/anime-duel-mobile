import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from '../components/ui/Button3D';
import { ProgressionMap } from '../components/progression/ProgressionMap';
import { EnergyBar } from '../components/ui/EnergyBar';
import { ChakraModal } from '../components/ChakraModal';
import { ResponseChakraModal } from '../components/ResponseChakraModal';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';
import { useRefetchUser } from '../hooks/useRefetchUser';
import { WelcomeGiftModal } from '../components/WelcomeGiftModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ME_QUERY = gql`
  query Me {
    me {
      id
      currentLevel
      currentTier
      berry
      chakra
      maxChakra
      welcomeGiftSeen
    }
  }
`;

const MARK_GIFT_VIEWED = gql`
  mutation MarkWelcomeGiftAsViewed {
    markWelcomeGiftAsViewed
  }
`;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useQuery<any>(ME_QUERY);
  const [markGiftViewed] = useMutation<any>(MARK_GIFT_VIEWED);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState<{
    success: boolean;
    errorType?: 'insufficient_berry' | 'max_chakra' | 'max_fillers' | 'other';
    currentBerry?: number;
    cost?: number;
    newChakra?: number;
  }>({ success: false });

  // Check for new user gift on mount
  useEffect(() => {
    if (!data?.me?.welcomeGiftSeen && !loading) {
      setShowGiftModal(true);
    }
  }, [data?.me?.welcomeGiftSeen, loading]);

  // Refetch user data when screen is focused
  useRefetchUser(refetch);

  // Auto logout si erreur auth
  useAuthErrorHandler(error);

  const currentLevel = data?.me?.currentLevel || 1;
  const currentTier = data?.me?.currentTier || 0;
  const currentChakra = data?.me?.chakra || 0;

  // Calculer maxLevel selon le palier actuel
  // Palier 0 = 15 niveaux, Palier 1+ = 25 niveaux chacun
  const getMaxLevel = (tier: number) => {
    if (tier === 0) return 15;
    return 15 + (tier * 25);
  };

  const maxLevel = getMaxLevel(currentTier + 1); // Afficher jusqu'au palier suivant

  const handlePlay = () => {
    // Si pas de Chakra, afficher le modal pour refill
    // Sinon, lancer directement le jeu
    if (currentChakra <= 0) {
      setShowEnergyModal(true);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      navigation.navigate('SoloGame');
    }
  };

  const handlePlayConfirmed = () => {
    if (currentChakra <= 0) {
      Alert.alert(
        '⚡ Pas de Chakra',
        'Tu n\'as plus de Chakra. Attends la régénération ou utilise un refill.',
      );
      return;
    }
    setShowEnergyModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('SoloGame');
  };

  const handleEnergyModalClose = async () => {
    setShowEnergyModal(false);
    await refetch();
  };

  const handleShowResponse = (data: typeof responseData) => {
    setResponseData(data);
    setShowResponseModal(true);
    if (data.success) {
      setShowEnergyModal(false);
    }
  };

  const handleCloseResponse = () => {
    setShowResponseModal(false);
  };

  const handleGoToShop = () => {
    setShowResponseModal(false);
    navigation.navigate('Shop');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header with safe area */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 12) + 8,
              backgroundColor: isDark ? 'rgba(31, 48, 57, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.logo, { color: colors.primary, fontFamily: fonts.bodyBlack }]}>
            ANIME DUEL
          </Text>

          {/* Chakra and Currency Bar */}
          <EnergyBar
            current={data?.me?.chakra || 0}
            max={data?.me?.maxChakra || 8}
            berry={data?.me?.berry}
            onEnergyPress={() => setShowEnergyModal(true)}
          />

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.headerBtn,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => navigation.navigate('Missions')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="flag" size={22} color={colors.cta} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progression Map - fills remaining space */}
        <View style={styles.mapContainer}>
          <ProgressionMap
            currentLevel={currentLevel}
            maxLevel={maxLevel}
            onPlayLevel={handlePlay}
            energyAvailable={currentChakra > 0}
          />
        </View>

        {/* Floating Play Button - positioned above tab bar */}
        <View
          style={[
            styles.fab,
            {
              bottom: Math.max(insets.bottom, 12) + 68, // tab bar height + spacing
            },
          ]}
        >
          <Button3D
            title="JOUER"
            color={colors.primary}
            darkColor={colors.primaryDark}
            onPress={handlePlay}
            size="large"
            style={styles.playButton}
          />
        </View>
      </View>

      <WelcomeGiftModal
        visible={showGiftModal}
        onClose={async () => {
          await markGiftViewed();
          setShowGiftModal(false);
        }}
      />

      <ChakraModal
        visible={showEnergyModal}
        onClose={handleEnergyModalClose}
        onShowResponse={handleShowResponse}
      />

      <ResponseChakraModal
        visible={showResponseModal}
        success={responseData.success}
        errorType={responseData.errorType}
        currentBerry={responseData.currentBerry}
        cost={responseData.cost}
        newChakra={responseData.newChakra}
        onClose={handleCloseResponse}
        onGoToShop={handleGoToShop}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logo: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mapContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  playButton: {
    paddingHorizontal: 48,
    borderRadius: 50,
    minWidth: 160,
  },
});
