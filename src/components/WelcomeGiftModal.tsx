import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

const { width, height } = Dimensions.get('window');

interface WelcomeGiftModalProps {
  visible: boolean;
  onClose: () => void;
}

export function WelcomeGiftModal({ visible, onClose }: WelcomeGiftModalProps) {
  const { colors } = useTheme();
  const [opened, setOpened] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [card1Anim] = useState(new Animated.Value(0));
  const [card2Anim] = useState(new Animated.Value(0));
  const [card3Anim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && !opened) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }

    if (visible && opened) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger animation for rewards cards
      Animated.stagger(200, [
        Animated.spring(card1Anim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(card2Anim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(card3Anim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opened]);

  const handleOpen = () => {
    setOpened(true);
  };

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.gradientBg}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            scrollEnabled={opened}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {!opened ? (
                <Animated.View
                  style={[
                    styles.giftContainer,
                    {
                      transform: [{ scale: scaleAnim }, { rotate }],
                    },
                  ]}
                >
                  <View style={styles.gift}>
                    <Text style={styles.giftEmoji}>🎁</Text>
                  </View>

                  <Text style={[styles.title, { color: '#ffffff', fontFamily: fonts.heading }]}>
                    Cadeau de bienvenue
                  </Text>

                  <Text style={[styles.subtitle, { color: '#ffffff', fontFamily: fonts.body }]}>
                    Appuie pour découvrir tes récompenses
                  </Text>

                  <TouchableOpacity
                    style={[styles.giftButton, { backgroundColor: colors.primary }]}
                    onPress={handleOpen}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.giftButtonText, { fontFamily: fonts.bodyBold }]}>
                      Ouvrir
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <Animated.View
                  style={[
                    styles.rewardsContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Text style={[styles.congratsTitle, { color: '#ffffff', fontFamily: fonts.heading }]}>
                    Félicitations !
                  </Text>

                  <Text style={[styles.congratsSubtitle, { color: '#ffffff', fontFamily: fonts.body }]}>
                    Voici ton pack de démarrage
                  </Text>

                  <View style={styles.rewardsGrid}>
                    <Animated.View
                      style={[
                        styles.rewardCard,
                        { backgroundColor: colors.surface },
                        {
                          opacity: card1Anim,
                          transform: [
                            {
                              scale: card1Anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                              }),
                            },
                            {
                              translateY: card1Anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[colors.berry + '20', colors.berry + '05']}
                        style={styles.rewardGradient}
                      >
                        <View style={[styles.rewardIconBox, { backgroundColor: colors.berry + '30' }]}>
                          <Text style={styles.rewardEmoji}>🫐</Text>
                        </View>
                        <Text style={[styles.rewardValue, { color: colors.berry, fontFamily: fonts.heading }]}>
                          500 Berry
                        </Text>
                      </LinearGradient>
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.rewardCard,
                        { backgroundColor: colors.surface },
                        {
                          opacity: card2Anim,
                          transform: [
                            {
                              scale: card2Anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                              }),
                            },
                            {
                              translateY: card2Anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[colors.error + '20', colors.error + '05']}
                        style={styles.rewardGradient}
                      >
                        <View style={[styles.rewardIconBox, { backgroundColor: colors.error + '30' }]}>
                          <Text style={styles.rewardEmoji}>👁️</Text>
                        </View>
                        <Text style={[styles.rewardValue, { color: colors.error, fontFamily: fonts.heading }]}>
                          5 Sharingan
                        </Text>
                      </LinearGradient>
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.rewardCard,
                        { backgroundColor: colors.surface },
                        {
                          opacity: card3Anim,
                          transform: [
                            {
                              scale: card3Anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                              }),
                            },
                            {
                              translateY: card3Anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[colors.info + '20', colors.info + '05']}
                        style={styles.rewardGradient}
                      >
                        <View style={[styles.rewardIconBox, { backgroundColor: colors.info + '30' }]}>
                          <Text style={styles.rewardEmoji}>⚡</Text>
                        </View>
                        <Text style={[styles.rewardValue, { color: colors.info, fontFamily: fonts.heading }]}>
                          8 Chakra
                        </Text>
                      </LinearGradient>
                    </Animated.View>
                  </View>

                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '12', borderColor: colors.primary }]}>
                    <Text style={[styles.infoText, { color: '#ffffff', fontFamily: fonts.body }]}>
                      Les Berry débloquent les Arcs. Les Sharingan t'aident en duel. Le Chakra est ton énergie de jeu.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: colors.primary }]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.closeButtonText, { fontFamily: fonts.bodyBold }]}>
                      C'est parti
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  content: {
    width: Math.min(width - 40, 360),
  },
  giftContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  gift: {
    marginBottom: 32,
  },
  giftEmoji: {
    fontSize: 100,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '500',
  },
  giftButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  giftButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  rewardsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  congratsTitle: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  congratsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
  },
  rewardCard: {
    width: '30%',
    minWidth: 95,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  rewardIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardValue: {
    fontSize: 13,
    marginBottom: 2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rewardLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoBox: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 20,
    width: '100%',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
