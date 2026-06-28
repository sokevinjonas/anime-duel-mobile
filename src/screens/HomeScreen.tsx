import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateMatch = () => {
    navigation.navigate('Match', {});
  };

  const handleJoinMatch = () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Entre un code de room');
      return;
    }
    navigation.navigate('Match', { roomCode: roomCode.trim().toUpperCase() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anime Duel</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuBtn} onPress={handleCreateMatch}>
          <Text style={styles.menuBtnText}>Créer un match</Text>
          <Text style={styles.menuBtnSub}>Invite un ami avec un code</Text>
        </TouchableOpacity>

        {!showJoinInput ? (
          <TouchableOpacity
            style={[styles.menuBtn, styles.secondaryBtn]}
            onPress={() => setShowJoinInput(true)}
          >
            <Text style={styles.menuBtnText}>Rejoindre un match</Text>
            <Text style={styles.menuBtnSub}>Entre le code d'un ami</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.joinSection}>
            <TextInput
              style={styles.codeInput}
              placeholder="CODE"
              placeholderTextColor="#666"
              value={roomCode}
              onChangeText={setRoomCode}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity style={styles.joinBtn} onPress={handleJoinMatch}>
              <Text style={styles.joinBtnText}>Rejoindre</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: '#8e44ad' }]}
          onPress={() => navigation.navigate('Solo')}
        >
          <Text style={styles.menuBtnText}>Mode Solo</Text>
          <Text style={styles.menuBtnSub}>Joue contre l'IA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuBtn, styles.catalogBtn]}
          onPress={() => navigation.navigate('Catalog')}
        >
          <Text style={styles.menuBtnText}>Catalogue</Text>
          <Text style={styles.menuBtnSub}>Explore les personnages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: '#f39c12' }]}
          onPress={() => navigation.navigate('Missions')}
        >
          <Text style={styles.menuBtnText}>Missions</Text>
          <Text style={styles.menuBtnSub}>Tâches journalières</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: '#2ecc71' }]}
          onPress={() => navigation.navigate('Shop')}
        >
          <Text style={styles.menuBtnText}>Boutique</Text>
          <Text style={styles.menuBtnSub}>Jokers & Progression</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: '#3498db' }]}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.menuBtnText}>Classement</Text>
          <Text style={styles.menuBtnSub}>Top joueurs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: '#34495e' }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.menuBtnText}>Historique</Text>
          <Text style={styles.menuBtnSub}>Tes anciens matchs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuBtn, styles.profileBtn]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.menuBtnText}>Mon Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 48,
  },
  menu: { gap: 16 },
  menuBtn: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 20,
  },
  secondaryBtn: { backgroundColor: '#16213e', borderWidth: 1, borderColor: '#e94560' },
  catalogBtn: { backgroundColor: '#16213e' },
  profileBtn: { backgroundColor: '#333' },
  menuBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  menuBtnSub: { fontSize: 13, color: '#ccc', marginTop: 4 },
  joinSection: {
    flexDirection: 'row',
    gap: 12,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  joinBtn: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  joinBtnText: { color: '#fff', fontWeight: '600' },
});
