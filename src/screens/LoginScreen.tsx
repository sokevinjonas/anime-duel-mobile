import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { loginWithOAuth, sendLoginCode, verifyLoginCode } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

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
    try {
      await sendLoginCode(email);
      setCodeSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyLoginCode(email, code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.cta, fontFamily: fonts.heading }]}>
        ANIME DUEL
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        Devine le personnage !
      </Text>

      <View style={styles.oauthSection}>
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: '#4285F4' }]}
          onPress={() => handleOAuth('GOOGLE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: '#5865F2' }]}
          onPress={() => handleOAuth('DISCORD')}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>Discord</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: colors.text }]}
          onPress={() => handleOAuth('APPLE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { fontFamily: fonts.bodyBold, color: colors.background }]}>
            Apple
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted, fontFamily: fonts.body }]}>ou</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.emailSection}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: fonts.body }]}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!codeSent ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleSendCode}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>Recevoir un code</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: fonts.body }]}
              placeholder="Code a 6 chiffres"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.cta }]}
              onPress={handleVerifyCode}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>Verifier</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  oauthSection: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  oauthBtn: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
  },
  emailSection: {
    width: '100%',
    gap: 12,
  },
  input: {
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
