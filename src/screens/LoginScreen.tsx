import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { loginWithOAuth, sendLoginCode } = useAuth();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');

  const handleOAuth = async (provider: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await loginWithOAuth(provider, 'placeholder-token');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Email requis', 'Veuillez entrer votre adresse email');
      return;
    }

    try {
      await sendLoginCode(email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('OTP', { email });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? [colors.background, colors.surface] : [colors.surface, colors.background]}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Logo Nanika */}
        <View style={styles.logoContainer}>
          <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.heading }]}>
            NANIKA
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            L'univers des anime te défie
          </Text>
        </View>

        {/* Bouton OAuth - Google */}
        <TouchableOpacity
          style={[styles.googleBtn, { backgroundColor: colors.google }]}
          onPress={() => handleOAuth('GOOGLE')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="login" size={22} color="#fff" style={styles.btnIcon} />
          <Text style={[styles.googleBtnText, { fontFamily: fonts.bodyBold }]}>
            Continuer avec Google
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted, fontFamily: fonts.body }]}>
            ou
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Email input */}
        <View style={styles.emailSection}>
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name="email" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input,
                { color: colors.text, fontFamily: fonts.body },
              ]}
              placeholder="ton@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleSendCode}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryBtnText, { fontFamily: fonts.bodyBold }]}>
              Recevoir un code
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 56,
  },
  title: {
    fontSize: 64,
    marginBottom: 8,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  googleBtn: {
    minHeight: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  btnIcon: {
    marginRight: 10,
  },
  googleBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  emailSection: {
    gap: 16,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  primaryBtn: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
  },
});
