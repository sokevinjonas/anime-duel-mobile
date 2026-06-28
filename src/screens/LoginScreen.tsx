import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { loginWithOAuth, sendLoginCode, verifyLoginCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleOAuth = async (provider: string) => {
    try {
      // TODO: implement real OAuth flow with expo-auth-session
      await loginWithOAuth(provider, 'placeholder-token');
      navigation.replace('Home');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleSendCode = async () => {
    try {
      await sendLoginCode(email);
      setCodeSent(true);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyLoginCode(email, code);
      navigation.replace('Home');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anime Duel</Text>
      <Text style={styles.subtitle}>Devine le personnage !</Text>

      <View style={styles.oauthSection}>
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: '#4285F4' }]}
          onPress={() => handleOAuth('GOOGLE')}
        >
          <Text style={styles.btnText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: '#5865F2' }]}
          onPress={() => handleOAuth('DISCORD')}
        >
          <Text style={styles.btnText}>Discord</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.oauthBtn, { backgroundColor: '#000' }]}
          onPress={() => handleOAuth('APPLE')}
        >
          <Text style={styles.btnText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.emailSection}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!codeSent ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSendCode}>
            <Text style={styles.btnText}>Recevoir un code</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Code à 6 chiffres"
              placeholderTextColor="#666"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyCode}>
              <Text style={styles.btnText}>Vérifier</Text>
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
    backgroundColor: '#1a1a2e',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
  },
  oauthSection: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  oauthBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 12,
  },
  emailSection: {
    width: '100%',
    gap: 12,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  primaryBtn: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
