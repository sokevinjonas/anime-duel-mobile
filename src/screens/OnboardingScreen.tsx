import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Animated,
  StatusBar,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { LinearGradient } from 'expo-linear-gradient';

const ONBOARDING_KEY = 'onboarding_completed';
const LANGUAGE_KEY = 'app_language';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

interface OnboardingPage {
  id: number;
  title: string;
  description: string;
  backgroundImage?: any;
}

const PAGES: OnboardingPage[] = [
  {
    id: 1,
    title: 'Bienvenue sur Nanika',
    description: 'Le jeu de devinette ultime pour les fans d\'anime ! Teste tes connaissances et défie tes amis.',
    backgroundImage: require('../../assets/onboarding/bg-1.svg'),
  },
  {
    id: 2,
    title: 'Comment jouer',
    description: 'Pose des questions, collecte des indices et devine le personnage mystère !',
    backgroundImage: require('../../assets/onboarding/bg-2.svg'),
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentPage]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / screenWidth);
    if (page !== currentPage) {
      setCurrentPage(page);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: nextPage * screenWidth,
        animated: true,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language.code);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la langue:', error);
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'onboarding:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const isLastPage = currentPage === PAGES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Language selector - Page 1 only */}
      {currentPage === 0 && (
        <SafeAreaView style={styles.languageButtonContainer} edges={['top']}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.languageFlag}>{selectedLanguage.flag}</Text>
            <Text style={styles.languageCode}>{selectedLanguage.code.toUpperCase()}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { fontFamily: fonts.heading, color: colors.text }]}>
              Choisir une langue
            </Text>

            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  { backgroundColor: colors.card },
                  selectedLanguage.code === language.code && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => handleLanguageSelect(language)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageOptionFlag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageOptionName,
                    { fontFamily: fonts.body, color: colors.text },
                    selectedLanguage.code === language.code && styles.languageOptionNameSelected,
                  ]}
                >
                  {language.name}
                </Text>
                {selectedLanguage.code === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.closeButton, { borderColor: colors.border }]}
              onPress={() => setShowLanguageModal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.closeButtonText, { fontFamily: fonts.bodyBold, color: colors.text }]}>
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Pages ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {PAGES.map((page) => (
          <View key={page.id} style={[styles.page, { width: screenWidth, height: screenHeight }]}>
            <ImageBackground
              source={page.backgroundImage}
              style={[styles.background, { width: screenWidth, height: screenHeight }]}
              resizeMode="cover"
              imageStyle={styles.backgroundImage}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.75)']}
                style={styles.overlay}
                locations={[0, 0.4, 1]}
              />

              <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <View style={styles.pageContent}>
                  <Animated.View
                    style={[
                      styles.content,
                      {
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <Text style={[styles.title, { fontFamily: fonts.heading }]}>
                      {page.title}
                    </Text>

                    <Text style={[styles.description, { fontFamily: fonts.body }]}>
                      {page.description}
                    </Text>
                  </Animated.View>

                  <View style={styles.pagination}>
                    {PAGES.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: index === currentPage ? colors.primary : colors.textMuted,
                            width: index === currentPage ? 24 : 8,
                          },
                        ]}
                      />
                    ))}
                  </View>

                  <View style={styles.footer}>
                    {!isLastPage && (
                      <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleFinish}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.skipText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                          Passer
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.mainButton, { backgroundColor: colors.primary }]}
                      onPress={isLastPage ? handleFinish : handleNext}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.mainButtonText, { fontFamily: fonts.bodyBold }]}>
                        {isLastPage ? 'Commencer →' : 'Suivant →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  pageContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  description: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 8,
    color: '#F0EEFF',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    opacity: 0.9,
  },
  footer: {
    width: '100%',
    gap: 16,
    paddingBottom: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
  },
  mainButton: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  languageButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1000,
    paddingRight: 20,
    paddingTop: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageCode: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  languageOptionFlag: {
    fontSize: 28,
  },
  languageOptionName: {
    flex: 1,
    fontSize: 18,
  },
  languageOptionNameSelected: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkmark: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
