import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CharacterPicker } from '../components/CharacterPicker';
import { SharinganEyeIcon } from '../components/icons/SharinganEyeIcon';
import { getSocket, connectSocket } from '../services/socket';
import { getAccessToken } from '../services/auth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

type MatchRoute = RouteProp<RootStackParamList, 'Match'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Match'>;

type GamePhase = 'connecting' | 'waiting' | 'choosing' | 'playing' | 'finished';

interface QuestionEntry {
  playerId: string;
  question: string;
  answer: 'YES' | 'NO' | 'PARTIALLY';
  turnNumber: number;
}

export function MatchScreen() {
  const route = useRoute<MatchRoute>();
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { roomCode: joinCode } = route.params || {};

  const [phase, setPhase] = useState<GamePhase>('connecting');
  const [myRoomCode, setMyRoomCode] = useState('');
  const [question, setQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [result, setResult] = useState<{ winnerId: string | null; reason: string } | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [myUserId] = useState('current-user-id'); // TODO: get from auth context

  const setupSocket = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    const socket = connectSocket(token);

    socket.on('match:created', (data: { roomCode: string }) => {
      setMyRoomCode(data.roomCode);
      setPhase('waiting');
    });

    socket.on('match:player_joined', () => {
      setPhase('choosing');
      setShowCharPicker(true);
    });

    socket.on('match:start', (data: { activePlayerId: string; timerEnd: number }) => {
      setPhase('playing');
      setIsMyTurn(data.activePlayerId === myUserId);
      updateTimer(data.timerEnd);
    });

    socket.on('turn:ai_response', (data: QuestionEntry) => {
      setQuestions((prev) => [...prev, data]);
    });

    socket.on('turn:end', (data: { activePlayerId: string; timerEnd: number }) => {
      setIsMyTurn(data.activePlayerId === myUserId);
      updateTimer(data.timerEnd);
    });

    socket.on('turn:sharingan_result', (data: { eliminatedGroup: string }) => {
      Alert.alert('Sharingan', `Éliminé : ${data.eliminatedGroup}`);
    });

    socket.on('turn:answer_wrong', () => {
      Alert.alert('Raté', 'Ce n\'est pas le bon personnage. Continue !');
    });

    socket.on('match:victory', (data: { winnerId: string; reason: string }) => {
      setPhase('finished');
      setResult(data);
    });

    socket.on('match:end', () => {
      setPhase('finished');
    });

    socket.on('match:opponent_left', (data: { winnerId: string }) => {
      setPhase('finished');
      setResult({ winnerId: data.winnerId, reason: 'forfeit' });
    });

    socket.on('match:error', (data: { message: string }) => {
      Alert.alert('Erreur', data.message);
    });

    if (joinCode) {
      socket.emit('match:join', { userId: myUserId, username: 'Player', roomCode: joinCode });
      setPhase('choosing');
      setShowCharPicker(true);
    } else {
      socket.emit('match:create', { userId: myUserId, username: 'Player' });
    }
  }, [joinCode, myUserId]);

  useEffect(() => {
    setupSocket();
    return () => {
      const socket = getSocket();
      socket.emit('match:leave');
      socket.disconnect();
    };
  }, [setupSocket]);

  const updateTimer = (timerEnd: number) => {
    const remaining = Math.max(0, Math.floor((timerEnd - Date.now()) / 1000));
    setTimerSeconds(remaining);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleCharSelect = (char: { id: string; name: string }) => {
    setSelectedChar(char.name);
    setShowCharPicker(false);
    const socket = getSocket();
    socket.emit('match:choose_char', { characterId: char.id });
  };

  const handleAskQuestion = () => {
    if (!question.trim() || !isMyTurn) return;
    const socket = getSocket();
    socket.emit('turn:question', { question: question.trim() });
    setQuestion('');
  };

  const handleUseSharingan = () => {
    if (!isMyTurn) return;
    const socket = getSocket();
    socket.emit('turn:use_sharingan');
  };

  const handleSubmitGuess = () => {
    if (!guess.trim()) return;
    const socket = getSocket();
    socket.emit('turn:submit_answer', { answer: guess.trim() });
    setGuess('');
  };

  if (phase === 'connecting') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.statusText, { color: colors.text, fontFamily: fonts.body }]}>Connexion...</Text>
      </View>
    );
  }

  if (phase === 'waiting') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.statusText, { color: colors.text, fontFamily: fonts.body }]}>En attente d'un adversaire</Text>
        <Text style={[styles.codeDisplay, { color: colors.cta, fontFamily: fonts.heading }]}>{myRoomCode}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fonts.body }]}>Partage ce code a ton ami</Text>
      </View>
    );
  }

  if (phase === 'choosing') {
    return (
      <View style={styles.center}>
        {selectedChar ? (
          <>
            <Text style={styles.statusText}>Personnage choisi !</Text>
            <Text style={styles.selectedChar}>{selectedChar}</Text>
            <Text style={styles.hint}>En attente de l'adversaire...</Text>
          </>
        ) : (
          <Text style={styles.statusText}>Choisis ton personnage...</Text>
        )}
        <CharacterPicker
          visible={showCharPicker}
          onSelect={handleCharSelect}
          onClose={() => setShowCharPicker(false)}
        />
      </View>
    );
  }

  if (phase === 'finished') {
    const won = result?.winnerId === myUserId;
    return (
      <View style={styles.center}>
        <Text style={styles.resultTitle}>
          {result?.winnerId === null ? 'Match nul !' : won ? 'Victoire !' : 'Défaite...'}
        </Text>
        <Text style={styles.resultReason}>
          {result?.reason === 'guessed' && 'Personnage deviné !'}
          {result?.reason === 'forfeit' && 'Adversaire déconnecté'}
          {result?.reason === 'draw' && 'Personne n\'a trouvé'}
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.backBtnText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <View style={styles.topBar}>
        <Text style={styles.turnIndicator}>
          {isMyTurn ? 'Ton tour' : 'Tour adverse'}
        </Text>
        <Text style={styles.timer}>{timerSeconds}s</Text>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(_, i) => i.toString()}
        style={styles.questionsList}
        renderItem={({ item }) => (
          <View style={styles.questionRow}>
            <Text style={styles.questionText}>{item.question}</Text>
            <Text
              style={[
                styles.answerBadge,
                item.answer === 'YES' && styles.answerYes,
                item.answer === 'NO' && styles.answerNo,
                item.answer === 'PARTIALLY' && styles.answerPartial,
              ]}
            >
              {item.answer === 'YES' ? 'Oui' : item.answer === 'NO' ? 'Non' : 'Partiellement'}
            </Text>
          </View>
        )}
      />

      <View style={styles.actionBar}>
        {isMyTurn && (
          <>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.questionInput}
                placeholder="Pose ta question..."
                placeholderTextColor="#666"
                value={question}
                onChangeText={setQuestion}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleAskQuestion}>
                <Text style={styles.sendBtnText}>?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.sharinganBtn, { backgroundColor: colors.warning }]} onPress={handleUseSharingan}>
                <SharinganEyeIcon size={18} color={colors.error} />
                <Text style={styles.sharinganBtnText}>Sharingan</Text>
              </TouchableOpacity>
              <View style={styles.guessRow}>
                <TextInput
                  style={styles.guessInput}
                  placeholder="Deviner..."
                  placeholderTextColor="#666"
                  value={guess}
                  onChangeText={setGuess}
                />
                <TouchableOpacity style={styles.guessBtn} onPress={handleSubmitGuess}>
                  <Text style={styles.guessBtnText}>Deviner</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 24,
  },
  statusText: { fontSize: 20, color: '#fff', marginBottom: 16 },
  codeDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e94560',
    letterSpacing: 6,
    marginBottom: 8,
  },
  hint: { fontSize: 14, color: '#aaa' },
  selectedChar: { fontSize: 24, fontWeight: 'bold', color: '#e94560', marginBottom: 8 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', color: '#e94560', marginBottom: 12 },
  resultReason: { fontSize: 16, color: '#aaa', marginBottom: 32 },
  backBtn: { backgroundColor: '#e94560', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  gameContainer: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 50 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  turnIndicator: { fontSize: 16, fontWeight: '600', color: '#fff' },
  timer: { fontSize: 18, fontWeight: 'bold', color: '#e94560' },
  questionsList: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  questionText: { flex: 1, fontSize: 14, color: '#fff', marginRight: 8 },
  answerBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  answerYes: { backgroundColor: '#2ecc71', color: '#fff' },
  answerNo: { backgroundColor: '#e74c3c', color: '#fff' },
  answerPartial: { backgroundColor: '#f39c12', color: '#fff' },
  actionBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  questionInput: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendBtn: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  sharinganBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sharinganBtnText: { color: '#000', fontWeight: '600' },
  guessRow: { flex: 1, flexDirection: 'row', gap: 8 },
  guessInput: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  guessBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  guessBtnText: { color: '#fff', fontWeight: '600' },
});
