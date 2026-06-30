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
                    <View style={[styles.rewardCard, { backgroundColor: colors.surface }]}>
                      <LinearGradient
                        colors={[colors.warning + '20', colors.warning + '05']}
                        style={styles.rewardGradient}
                      >
                        <View style={[styles.rewardIconBox, { backgroundColor: colors.warning + '30' }]}>
                          <Text style={styles.rewardEmoji}>10</Text>
                        </View>
                        <Text style={[styles.rewardValue, { color: colors.warning, fontFamily: fonts.heading }]}>
                          Pièces
                        </Text>
                      </LinearGradient>
                    </View>

                    <View style={[styles.rewardCard, { backgroundColor: colors.surface }]}>
                      <LinearGradient
                        colors={[colors.primary + '20', colors.primary + '05']}
                        style={styles.rewardGradient}
                      >
                        <View style={[styles.rewardIconBox, { backgroundColor: colors.primary + '30' }]}>
                          <Text style={styles.rewardEmoji}>3</Text>
                        </View>
                        <Text style={[styles.rewardValue, { color: colors.primary, fontFamily: fonts.heading }]}>
                          Sharingan
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '12', borderColor: colors.primary }]}>
                    <Text style={[styles.infoText, { color: '#ffffff', fontFamily: fonts.body }]}>
                      Les Berry te permettent de débloquer de nouveaux paliers. Les Sharingan t'aident à remporter tes matchs.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: colors.cta }]}
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
    fontSize: 32,
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
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  rewardCard: {
    flex: 1,
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
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  rewardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardValue: {
    fontSize: 28,
    marginBottom: 4,
    fontWeight: 'bold',
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
