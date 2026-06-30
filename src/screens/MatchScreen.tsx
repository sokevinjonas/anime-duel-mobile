import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CharacterPicker } from '../components/CharacterPicker';
import { SharinganEyeIcon } from '../components/icons/SharinganEyeIcon';
import { getSocket, connectSocket } from '../services/socket';
import { getAccessToken } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
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
  const { user } = useAuth();
  const { roomCode: joinCode } = route.params || {};

  const [phase, setPhase] = useState<GamePhase>('connecting');
  const [myRoomCode, setMyRoomCode] = useState('');
  const [question, setQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [result, setResult] = useState<{ winnerId: string | null; reason: string; berryReward?: number; sharinganReward?: number } | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [myUserId] = useState(user?.id || '');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [opponentSelected, setOpponentSelected] = useState(false);
  const [typingDots, setTypingDots] = useState('.');
  const characterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerEndRef = useRef<number | null>(null);

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
      // Start 7s character selection timeout
      if (characterTimeoutRef.current) clearTimeout(characterTimeoutRef.current);
      characterTimeoutRef.current = setTimeout(() => {
        socket.emit('match:character_timeout');
      }, 7000);
    });

    socket.on('match:character_selected', (data: { userId: string }) => {
      if (data.userId !== myUserId) {
        setOpponentSelected(true);
      }
    });

    socket.on('match:character_auto_selected', (data: { characterId: string; userId: string }) => {
      if (data.userId !== myUserId) {
        setOpponentSelected(true);
      }
    });

    socket.on('match:start', (data: { activePlayerId: string; timerEnd: number }) => {
      setPhase('playing');
      setIsMyTurn(data.activePlayerId === myUserId);
      timerEndRef.current = data.timerEnd;
      updateTimer(data.timerEnd);
      if (characterTimeoutRef.current) clearTimeout(characterTimeoutRef.current);
    });

    socket.on('turn:ai_response', (data: QuestionEntry) => {
      setQuestions((prev) => [...prev, data]);
      setWaitingForResponse(false);
    });

    socket.on('turn:end', (data: { activePlayerId: string; timerEnd: number }) => {
      setIsMyTurn(data.activePlayerId === myUserId);
      setWaitingForResponse(false);
      timerEndRef.current = data.timerEnd;
      updateTimer(data.timerEnd);
    });

    socket.on('turn:timeout', () => {
      // Timer expired, auto-submit empty answer
      if (isMyTurn) {
        socket.emit('turn:submit_answer', { answer: '' });
      }
    });

    socket.on('turn:sharingan_used', (data: { userId: string; hint: string }) => {
      if (data.userId !== myUserId) {
        setQuestions((prev) => [...prev, {
          playerId: data.userId,
          question: `💡 Indice: ${data.hint}`,
          answer: 'PARTIALLY' as const,
          turnNumber: 0,
        }]);
      }
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
      if (characterTimeoutRef.current) clearTimeout(characterTimeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      socket.emit('match:leave');
      socket.disconnect();
    };
  }, [setupSocket]);

  const updateTimer = (timerEnd: number) => {
    const remaining = Math.max(0, Math.floor((timerEnd - Date.now()) / 1000));
    setTimerSeconds(remaining);
  };

  // Backend-driven timer: update every 1s by calculating remaining time from timerEnd
  useEffect(() => {
    if (phase !== 'playing' || !timerEndRef.current) return;

    const interval = setInterval(() => {
      if (timerEndRef.current) {
        const remaining = Math.max(0, Math.floor((timerEndRef.current - Date.now()) / 1000));
        setTimerSeconds(remaining);

        // Auto-timeout when timer reaches 0
        if (remaining <= 0) {
          const socket = getSocket();
          socket.emit('turn:submit_answer', { answer: '' });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Animate typing dots when waiting for opponent
  useEffect(() => {
    if (!waitingForResponse) {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      return;
    }

    typingIntervalRef.current = setInterval(() => {
      setTypingDots((prev) => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [waitingForResponse]);

  const handleGoBack = useCallback(() => {
    if (phase === 'playing') {
      Alert.alert(
        'Quitter le match ?',
        'Ton adversaire remportera la victoire. Es-tu sûr ?',
        [
          { text: 'Continuer', style: 'cancel' },
          {
            text: 'Quitter',
            style: 'destructive',
            onPress: () => {
              const socket = getSocket();
              socket.emit('match:forfeit');
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [phase, navigation]);

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
    setWaitingForResponse(true); // Show waiting indicator
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        {selectedChar ? (
          <>
            <Text style={[styles.statusText, { color: colors.text, fontFamily: fonts.body }]}>Personnage choisi !</Text>
            <Text style={[styles.selectedChar, { color: colors.cta, fontFamily: fonts.heading }]}>{selectedChar}</Text>
            {opponentSelected ? (
              <Text style={[styles.hint, { color: colors.success, fontFamily: fonts.body }]}>L'adversaire a aussi choisi !</Text>
            ) : (
              <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fonts.body }]}>En attente de l'adversaire...</Text>
            )}
          </>
        ) : (
          <Text style={[styles.statusText, { color: colors.text, fontFamily: fonts.body }]}>Choisis ton personnage...</Text>
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultTitle, { color: won ? colors.success : colors.error, fontFamily: fonts.heading }]}>
          {result?.winnerId === null ? 'Match nul !' : won ? '🎉 Victoire !' : '😔 Défaite'}
        </Text>
        <Text style={[styles.resultReason, { color: colors.text, fontFamily: fonts.body }]}>
          {result?.reason === 'guessed' && 'Personnage deviné !'}
          {result?.reason === 'forfeit' && 'Adversaire déconnecté'}
          {result?.reason === 'draw' && 'Personne n\'a trouvé'}
        </Text>

        {/* Rewards */}
        {won && (result?.berryReward || result?.sharinganReward) && (
          <View style={[styles.rewardsContainer, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.rewardsTitle, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
              Récompenses:
            </Text>
            {result?.berryReward ? (
              <Text style={[styles.rewardText, { color: colors.warning, fontFamily: fonts.body }]}>
                🫐 +{result.berryReward} Berry
              </Text>
            ) : null}
            {result?.sharinganReward ? (
              <View style={styles.rewardRow}>
                <SharinganEyeIcon size={18} color={colors.error} />
                <Text style={[styles.rewardText, { color: colors.error, fontFamily: fonts.body }]}>
                  +{result.sharinganReward} Sharingan
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={[styles.backBtnText, { fontFamily: fonts.bodyBold }]}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.gameContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: isMyTurn ? colors.success + '20' : colors.warning + '20', borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backIconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.turnIndicator, { color: isMyTurn ? colors.success : colors.warning, fontFamily: fonts.bodyBold }]}>
          {isMyTurn ? 'Ton tour' : 'Tour adverse'}
        </Text>
        <Text style={[styles.timer, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{timerSeconds}s</Text>
      </View>

      {waitingForResponse && (
        <View style={[styles.waitingContainer, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.waitingText, { color: colors.text, fontFamily: fonts.body }]}>
            L'adversaire répond{typingDots}
          </Text>
        </View>
      )}

      <FlatList
        data={questions}
        keyExtractor={(_, i) => i.toString()}
        style={styles.questionsList}
        renderItem={({ item }) => (
          <View style={[styles.questionRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.text, fontFamily: fonts.body }]}>{item.question}</Text>
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

      <View style={[styles.actionBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        {isMyTurn && (
          <>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.questionInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border }]}
                placeholder="Pose ta question..."
                placeholderTextColor={colors.textMuted}
                value={question}
                onChangeText={setQuestion}
              />
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={handleAskQuestion}>
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
                  style={[styles.guessInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.success }]}
                  placeholder="Deviner..."
                  placeholderTextColor={colors.textMuted}
                  value={guess}
                  onChangeText={setGuess}
                />
                <TouchableOpacity style={[styles.guessBtn, { backgroundColor: colors.success }]} onPress={handleSubmitGuess}>
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
    padding: 24,
  },
  statusText: { fontSize: 20, marginBottom: 16 },
  waitingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  waitingText: { fontSize: 14, textAlign: 'center' },
  codeDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 8,
  },
  hint: { fontSize: 14 },
  selectedChar: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  resultReason: { fontSize: 16, marginBottom: 32 },
  rewardsContainer: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    gap: 8,
  },
  rewardsTitle: { fontSize: 16, marginBottom: 4 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rewardText: { fontSize: 14 },
  backBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  gameContainer: { flex: 1, paddingTop: 50 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backIconBtn: { padding: 8 },
  turnIndicator: { flex: 1, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  timer: { fontSize: 18, fontWeight: 'bold' },
  questionsList: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  questionText: { flex: 1, fontSize: 14, marginRight: 8 },
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
  actionBar: { padding: 16, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  questionInput: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  sendBtn: {
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
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  guessBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  guessBtnText: { color: '#fff', fontWeight: '600' },
});
