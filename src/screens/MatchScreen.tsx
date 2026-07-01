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
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CharacterPicker } from '../components/CharacterPicker';
import { CreateMatchModal } from '../components/CreateMatchModal';
import { JoinLobbyModal } from '../components/JoinLobbyModal';
import { StartAnimationModal } from '../components/StartAnimationModal';
import { SharinganEyeIcon } from '../components/icons/SharinganEyeIcon';
import { getSocket, connectSocket } from '../services/socket';
import { getAccessToken } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

type MatchRoute = RouteProp<RootStackParamList, 'Match'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Match'>;

type Phase = 'entry' | 'waiting' | 'choosing' | 'animation' | 'playing' | 'finished';

interface QuestionEntry {
  playerId: string;
  question: string;
  answer: 'YES' | 'NO' | 'PARTIALLY' | null;
  turnNumber: number;
}

interface LobbyInfo {
  roomCode: string;
  hostUsername: string;
  betAmount: number;
  maxQuestions: number;
  expiresIn: number;
}

export function MatchScreen() {
  const route = useRoute<MatchRoute>();
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { roomCode: joinCodeParam } = route.params || {};

  // Phase management
  const [phase, setPhase] = useState<Phase>('entry');

  // Entry phase
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Waiting phase
  const [myRoomCode, setMyRoomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [waitingTimer, setWaitingTimer] = useState(120);

  // Join flow
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  // Character selection phase
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [selectedCharName, setSelectedCharName] = useState<string | null>(null);
  const [confirmedChar, setConfirmedChar] = useState(false);
  const [charSelectionTimer, setCharSelectionTimer] = useState(20);
  const [charSelectionDeadline, setCharSelectionDeadline] = useState<number | null>(null);
  const [opponentSelected, setOpponentSelected] = useState(false);
  const [opponentConfirmed, setOpponentConfirmed] = useState(false);

  // Start animation
  const [showStartAnimation, setShowStartAnimation] = useState(false);
  const [starterName, setStarterName] = useState<string | null>(null);

  // Playing phase
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [question, setQuestion] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [showAnswerButtons, setShowAnswerButtons] = useState(false);
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [typingDots, setTypingDots] = useState('.');
  const [guess, setGuess] = useState('');

  // Finished phase
  const [result, setResult] = useState<{
    winnerId: string | null;
    reason: string;
    berryReward?: number;
    sharinganReward?: number;
  } | null>(null);

  const myUserId = user?.id || '';
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const expirationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup socket and event handlers
  const setupSocket = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    const socket = connectSocket(token);

    // Lobby events
    socket.on('match:created', (data: { roomCode: string; expiresAt: number }) => {
      setMyRoomCode(data.roomCode);
      setExpiresAt(data.expiresAt);
      setPhase('waiting');
    });

    socket.on('match:lobby_info', (info: LobbyInfo) => {
      setLobbyInfo(info);
      setShowJoinModal(true);
      setJoinLoading(false);
    });

    socket.on('match:lobby_expired', () => {
      Alert.alert('Lobby expiré', 'Le lobby a expiré après 2 minutes', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    });

    socket.on('match:join_declined', (data: { message: string }) => {
      Alert.alert('Erreur', data.message);
      setShowJoinModal(false);
      setJoinLoading(false);
    });

    // Character selection events
    socket.on('match:player_joined', () => {
      setPhase('choosing');
      setShowCharPicker(true);
    });

    socket.on('match:character_selection_start', (data: { duration: number }) => {
      setPhase('choosing');
      setShowCharPicker(true);
      const deadline = Date.now() + data.duration;
      setCharSelectionDeadline(deadline);
      setCharSelectionTimer(Math.floor(data.duration / 1000));
    });

    socket.on('match:character_selected', (data: { userId: string }) => {
      if (data.userId !== myUserId) {
        setOpponentSelected(true);
      }
    });

    socket.on('match:character_confirmed', (data: { userId: string }) => {
      if (data.userId !== myUserId) {
        setOpponentConfirmed(true);
      }
    });

    socket.on('match:character_auto_selected', (data: { characterId: string; userId: string }) => {
      if (data.userId === myUserId) {
        setConfirmedChar(true);
        setShowCharPicker(false);
      } else {
        setOpponentConfirmed(true);
      }
    });

    // Start animation
    socket.on('match:start_animation', (data: { activePlayerId: string; duration: number }) => {
      setShowStartAnimation(true);
      setStarterName(data.activePlayerId === myUserId ? 'Tu commences' : 'Adversaire commence');

      setTimeout(() => {
        setShowStartAnimation(false);
      }, data.duration);
    });

    // Game start
    socket.on('match:start', (data: { activePlayerId: string; timerEnd: number }) => {
      setPhase('playing');
      setIsMyTurn(data.activePlayerId === myUserId);
      setTimerEnd(data.timerEnd);
      setTimerSeconds(Math.max(0, Math.floor((data.timerEnd - Date.now()) / 1000)));
    });

    // Turn events
    socket.on('turn:question_asked', (data: { playerId: string; question: string; turnNumber: number }) => {
      if (data.playerId !== myUserId) {
        // Opponent's question - show answer buttons
        setPendingQuestion(data.question);
        setShowAnswerButtons(true);
      }

      // Add to history (answer will be filled later)
      setQuestions((prev) => [
        ...prev,
        {
          playerId: data.playerId,
          question: data.question,
          answer: null,
          turnNumber: data.turnNumber,
        },
      ]);
    });

    socket.on('turn:answer_received', (data: { question: string; answer: 'YES' | 'NO' | 'PARTIALLY' }) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.question === data.question ? { ...q, answer: data.answer } : q
        )
      );
      setWaitingForAnswer(false);
      setPendingQuestion(null);
      setShowAnswerButtons(false);
    });

    socket.on('turn:end', (data: { activePlayerId: string; timerEnd: number }) => {
      setIsMyTurn(data.activePlayerId === myUserId);
      setTimerEnd(data.timerEnd);
      setTimerSeconds(Math.max(0, Math.floor((data.timerEnd - Date.now()) / 1000)));
    });

    socket.on('turn:timeout_occurred', (data: { userId: string }) => {
      // Could show a toast here
      console.log('Turn timeout for user:', data.userId);
    });

    // Match end events
    socket.on('match:victory', (data: { winnerId: string; reason: string; berryReward?: number; sharinganReward?: number }) => {
      setPhase('finished');
      setResult(data);
    });

    socket.on('match:cancelled', () => {
      Alert.alert('Match annulé', 'Le match a été annulé', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    });

    socket.on('match:end', (data: any) => {
      setPhase('finished');
      setResult(data);
    });

    socket.on('match:error', (data: { message: string }) => {
      Alert.alert('Erreur', data.message);
    });

    // If joinCode in params, auto-join
    if (joinCodeParam) {
      setJoinLoading(true);
      socket.emit('match:join_request', { roomCode: joinCodeParam });
    }
  }, [joinCodeParam, myUserId, navigation]);

  useEffect(() => {
    setupSocket();
    return () => {
      const socket = getSocket();
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (expirationTimerRef.current) clearTimeout(expirationTimerRef.current);
      socket.emit('match:leave');
      socket.disconnect();
    };
  }, [setupSocket]);

  // Waiting lobby timer (2min countdown)
  useEffect(() => {
    if (phase !== 'waiting' || !expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setWaitingTimer(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        // Auto-return when lobby expires
        navigation.goBack();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, expiresAt, navigation]);

  // Character selection timer (20s countdown)
  useEffect(() => {
    if (phase !== 'choosing' || !charSelectionDeadline) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((charSelectionDeadline - Date.now()) / 1000));
      setCharSelectionTimer(remaining);

      if (remaining === 0 && !confirmedChar) {
        const socket = getSocket();
        socket.emit('match:character_timeout');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, charSelectionDeadline, confirmedChar]);

  // Game turn timer (20s countdown)
  useEffect(() => {
    if (phase !== 'playing' || !timerEnd) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((timerEnd - Date.now()) / 1000));
      setTimerSeconds(remaining);

      if (remaining === 0 && isMyTurn) {
        const socket = getSocket();
        socket.emit('turn:timeout');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, timerEnd, isMyTurn]);

  // Typing dots animation
  useEffect(() => {
    if (!waitingForAnswer) {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setTypingDots('.');
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
  }, [waitingForAnswer]);

  // Handlers
  const handleCreateMatch = (betAmount: number, maxQuestions: number) => {
    const socket = getSocket();
    socket.emit('match:create', {
      userId: myUserId,
      username: user?.username || 'Player',
      betAmount,
      maxQuestions,
    });
    setShowCreateModal(false);
  };

  const handleJoinWithCode = () => {
    if (!joinCodeInput.trim()) {
      Alert.alert('Erreur', 'Entre un code de partie valide');
      return;
    }
    const socket = getSocket();
    setJoinLoading(true);
    socket.emit('match:join_request', { roomCode: joinCodeInput.trim() });
  };

  const handleAcceptJoin = () => {
    const socket = getSocket();
    socket.emit('match:join_accept', {
      username: user?.username || 'Player',
      roomCode: lobbyInfo?.roomCode,
    });
    setShowJoinModal(false);
  };

  const handleDeclineJoin = () => {
    setShowJoinModal(false);
    setLobbyInfo(null);
    navigation.goBack();
  };

  const handleAbandonLobby = () => {
    Alert.alert('Abandonner', 'Es-tu sûr de vouloir abandonner le lobby ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: () => {
          const socket = getSocket();
          socket.emit('match:abandon_lobby');
          navigation.goBack();
        },
      },
    ]);
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(myRoomCode);
    Alert.alert('Copié!', 'Code copié dans le presse-papier');
  };

  const handleShareCode = async () => {
    await Share.share({
      message: `Rejoins ma partie Nanika!\nCode: ${myRoomCode}`,
      title: 'Partie Nanika',
    });
  };

  const handleCharSelect = (char: { id: string; name: string }) => {
    setSelectedCharId(char.id);
    setSelectedCharName(char.name);
    // Keep picker open - user must click VALIDER button to confirm
    const socket = getSocket();
    socket.emit('match:choose_char', { characterId: char.id });
  };

  const handleConfirmChar = () => {
    if (!selectedCharId || confirmedChar) return;
    const socket = getSocket();
    socket.emit('match:confirm_char');
    setConfirmedChar(true);
    setShowCharPicker(false); // Only close after confirmation
  };

  const handleAskQuestion = () => {
    if (!question.trim() || !isMyTurn || waitingForAnswer) return;
    const socket = getSocket();
    socket.emit('turn:question', { question: question.trim() });
    setQuestion('');
    setWaitingForAnswer(true);
  };

  const handleAnswer = (answer: 'YES' | 'NO' | 'PARTIALLY') => {
    const socket = getSocket();
    socket.emit('turn:answer', { answer });
    setShowAnswerButtons(false);
    setPendingQuestion(null);
  };

  const handleSubmitGuess = () => {
    if (!guess.trim() || !isMyTurn) return;
    const socket = getSocket();
    socket.emit('turn:submit_answer', { answer: guess.trim() });
    setGuess('');
  };

  const handleUseSharingan = () => {
    if (!isMyTurn) return;
    const socket = getSocket();
    socket.emit('turn:use_sharingan');
  };

  const handleGoBack = () => {
    if (phase === 'playing') {
      Alert.alert('Quitter le match ?', 'Ton adversaire remportera la victoire. Es-tu sûr ?', [
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
      ]);
    } else {
      navigation.goBack();
    }
  };

  // Render phases

  // 1. Entry screen
  if (phase === 'entry') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.entryTitle, { color: colors.text, fontFamily: fonts.heading }]}>
          Match entre amis
        </Text>

        <View style={styles.entryButtons}>
          <TouchableOpacity
            style={[styles.entryBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add-circle-outline" size={24} color="#FFF" />
            <Text style={[styles.entryBtnText, { fontFamily: fonts.bodyBold }]}>
              Créer une partie
            </Text>
          </TouchableOpacity>

          {!showJoinInput ? (
            <TouchableOpacity
              style={[styles.entryBtn, { backgroundColor: colors.success }]}
              onPress={() => setShowJoinInput(true)}
            >
              <MaterialIcons name="login" size={24} color="#FFF" />
              <Text style={[styles.entryBtnText, { fontFamily: fonts.bodyBold }]}>
                Rejoindre
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.joinInputContainer}>
              <TextInput
                style={[
                  styles.joinInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                    fontFamily: fonts.body,
                  },
                ]}
                placeholder="Entre le code..."
                placeholderTextColor={colors.textMuted}
                value={joinCodeInput}
                onChangeText={setJoinCodeInput}
                autoCapitalize="characters"
                autoFocus
              />
              <TouchableOpacity
                style={[styles.joinBtn, { backgroundColor: colors.success }]}
                onPress={handleJoinWithCode}
              >
                <Text style={[styles.joinBtnText, { fontFamily: fonts.bodyBold }]}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={[styles.backLinkText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            ← Retour
          </Text>
        </TouchableOpacity>

        <CreateMatchModal
          visible={showCreateModal}
          onConfirm={handleCreateMatch}
          onCancel={() => setShowCreateModal(false)}
        />

        <JoinLobbyModal
          visible={showJoinModal}
          lobbyInfo={lobbyInfo}
          loading={joinLoading}
          onAccept={handleAcceptJoin}
          onDecline={handleDeclineJoin}
        />
      </View>
    );
  }

  // 2. Waiting lobby
  if (phase === 'waiting') {
    const minutes = Math.floor(waitingTimer / 60);
    const seconds = waitingTimer % 60;
    const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.statusText, { color: colors.text, fontFamily: fonts.body }]}>
          En attente d'un adversaire
        </Text>

        <View style={[styles.codeContainer, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={[styles.codeLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Code de la partie
          </Text>
          <Text style={[styles.codeDisplay, { color: colors.primary, fontFamily: fonts.heading }]}>
            {myRoomCode}
          </Text>
        </View>

        <View style={styles.shareButtons}>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.success }]}
            onPress={handleCopyCode}
          >
            <MaterialIcons name="content-copy" size={20} color="#FFF" />
            <Text style={[styles.shareBtnText, { fontFamily: fonts.bodyBold }]}>Copier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.primary }]}
            onPress={handleShareCode}
          >
            <MaterialIcons name="share" size={20} color="#FFF" />
            <Text style={[styles.shareBtnText, { fontFamily: fonts.bodyBold }]}>Partager</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.timerText, { color: colors.warning, fontFamily: fonts.bodyBold }]}>
          ⏱️ {timeDisplay}
        </Text>

        <TouchableOpacity
          style={[styles.abandonBtn, { backgroundColor: colors.error }]}
          onPress={handleAbandonLobby}
        >
          <Text style={[styles.abandonBtnText, { fontFamily: fonts.bodyBold }]}>Abandonner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Character selection
  if (phase === 'choosing') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.statusText, { color: colors.text, fontFamily: fonts.heading }]}>
          Sélection du personnage
        </Text>

        <Text style={[styles.timerText, { color: colors.warning, fontFamily: fonts.bodyBold }]}>
          ⏱️ {charSelectionTimer}s
        </Text>

        {selectedCharId && !confirmedChar && (
          <View style={[styles.selectedCharContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.selectedCharLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              ✓ Sélectionné:
            </Text>
            <Text style={[styles.selectedCharName, { color: colors.primary, fontFamily: fonts.heading }]}>
              {selectedCharName}
            </Text>
            <Text style={[styles.hintText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Clic sur VALIDER en bas du menu
            </Text>
          </View>
        )}

        {confirmedChar && (
          <View style={[styles.confirmedContainer, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
            <MaterialIcons name="check-circle" size={48} color={colors.success} />
            <Text style={[styles.confirmedText, { color: colors.success, fontFamily: fonts.bodyBold }]}>
              Personnage validé !
            </Text>
            {opponentConfirmed ? (
              <Text style={[styles.statusHint, { color: colors.success, fontFamily: fonts.body }]}>
                L'adversaire a aussi validé !
              </Text>
            ) : (
              <Text style={[styles.statusHint, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                En attente de l'adversaire...
              </Text>
            )}
          </View>
        )}

        {!selectedCharId && (
          <TouchableOpacity
            style={[styles.selectBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowCharPicker(true)}
          >
            <Text style={[styles.selectBtnText, { fontFamily: fonts.bodyBold }]}>
              Choisir un personnage
            </Text>
          </TouchableOpacity>
        )}

        {selectedCharId && !confirmedChar && (
          <TouchableOpacity
            style={[styles.changeBtn, { backgroundColor: colors.warning }]}
            onPress={() => setShowCharPicker(true)}
          >
            <Text style={[styles.changeBtnText, { fontFamily: fonts.bodyBold }]}>
              Changer de personnage
            </Text>
          </TouchableOpacity>
        )}

        <CharacterPicker
          visible={showCharPicker}
          onSelect={handleCharSelect}
          onClose={() => setShowCharPicker(false)}
          selectedId={selectedCharId}
          onConfirm={handleConfirmChar}
          showConfirmButton={true}
          disabled={confirmedChar}
        />
      </View>
    );
  }

  // 4. Start animation
  if (phase === 'animation' || showStartAnimation) {
    return (
      <StartAnimationModal visible={showStartAnimation} starterName={starterName || undefined} />
    );
  }

  // 5. Finished
  if (phase === 'finished') {
    const won = result?.winnerId === myUserId;
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text
          style={[
            styles.resultTitle,
            { color: won ? colors.success : colors.error, fontFamily: fonts.heading },
          ]}
        >
          {result?.winnerId === null ? 'Match nul !' : won ? '🎉 Victoire !' : '😔 Défaite'}
        </Text>
        <Text style={[styles.resultReason, { color: colors.text, fontFamily: fonts.body }]}>
          {result?.reason === 'guessed' && 'Personnage deviné !'}
          {result?.reason === 'forfeit' && 'Adversaire déconnecté'}
          {result?.reason === 'draw' && "Personne n'a trouvé"}
          {result?.reason === 'quota_reached' && 'Quota de questions atteint'}
        </Text>

        {won && (result?.berryReward || result?.sharinganReward) && (
          <View
            style={[
              styles.rewardsContainer,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}
          >
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
          <Text style={[styles.backBtnText, { fontFamily: fonts.bodyBold }]}>
            Retour à l'accueil
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 6. Playing phase
  return (
    <View style={[styles.gameContainer, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isMyTurn ? colors.success + '20' : colors.warning + '20',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backIconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.turnIndicator,
            { color: isMyTurn ? colors.success : colors.warning, fontFamily: fonts.bodyBold },
          ]}
        >
          {isMyTurn ? 'Ton tour' : 'Tour adverse'}
        </Text>
        <Text style={[styles.timer, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
          {timerSeconds}s
        </Text>
      </View>

      {waitingForAnswer && (
        <View
          style={[
            styles.waitingContainer,
            { backgroundColor: colors.surface, borderColor: colors.primary },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.waitingText, { color: colors.text, fontFamily: fonts.body }]}>
            L'adversaire répond{typingDots}
          </Text>
        </View>
      )}

      {showAnswerButtons && pendingQuestion && (
        <View
          style={[
            styles.answerButtonsContainer,
            { backgroundColor: colors.warning + '20', borderColor: colors.warning },
          ]}
        >
          <Text style={[styles.pendingQuestionText, { color: colors.text, fontFamily: fonts.bodyBold }]}>
            Question de l'adversaire:
          </Text>
          <Text style={[styles.pendingQuestion, { color: colors.text, fontFamily: fonts.body }]}>
            {pendingQuestion}
          </Text>
          <View style={styles.answerBtnRow}>
            <TouchableOpacity
              style={[styles.answerBtn, { backgroundColor: colors.success }]}
              onPress={() => handleAnswer('YES')}
            >
              <Text style={[styles.answerBtnText, { fontFamily: fonts.bodyBold }]}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerBtn, { backgroundColor: colors.error }]}
              onPress={() => handleAnswer('NO')}
            >
              <Text style={[styles.answerBtnText, { fontFamily: fonts.bodyBold }]}>Non</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerBtn, { backgroundColor: colors.warning }]}
              onPress={() => handleAnswer('PARTIALLY')}
            >
              <Text style={[styles.answerBtnText, { fontFamily: fonts.bodyBold }]}>Peut-être</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={questions}
        keyExtractor={(_, i) => i.toString()}
        style={styles.questionsList}
        renderItem={({ item }) => (
          <View style={[styles.questionRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.text, fontFamily: fonts.body }]}>
              {item.question}
            </Text>
            {item.answer && (
              <Text
                style={[
                  styles.answerBadge,
                  item.answer === 'YES' && styles.answerYes,
                  item.answer === 'NO' && styles.answerNo,
                  item.answer === 'PARTIALLY' && styles.answerPartial,
                ]}
              >
                {item.answer === 'YES' ? 'Oui' : item.answer === 'NO' ? 'Non' : 'Peut-être'}
              </Text>
            )}
          </View>
        )}
      />

      <View
        style={[
          styles.actionBar,
          { borderTopColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        {isMyTurn && !showAnswerButtons && (
          <>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.questionInput,
                  {
                    backgroundColor: colors.surfaceElevated,
                    color: colors.text,
                    borderColor: colors.border,
                    fontFamily: fonts.body,
                  },
                ]}
                placeholder="Pose ta question..."
                placeholderTextColor={colors.textMuted}
                value={question}
                onChangeText={setQuestion}
                editable={!waitingForAnswer}
              />
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: waitingForAnswer ? 0.5 : 1 }]}
                onPress={handleAskQuestion}
                disabled={waitingForAnswer}
              >
                <Text style={styles.sendBtnText}>?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.sharinganBtn, { backgroundColor: colors.warning }]}
                onPress={handleUseSharingan}
              >
                <SharinganEyeIcon size={18} color={colors.error} />
                <Text style={styles.sharinganBtnText}>Sharingan</Text>
              </TouchableOpacity>
              <View style={styles.guessRow}>
                <TextInput
                  style={[
                    styles.guessInput,
                    {
                      backgroundColor: colors.surfaceElevated,
                      color: colors.text,
                      borderColor: colors.success,
                      fontFamily: fonts.body,
                    },
                  ]}
                  placeholder="Deviner..."
                  placeholderTextColor={colors.textMuted}
                  value={guess}
                  onChangeText={setGuess}
                />
                <TouchableOpacity
                  style={[styles.guessBtn, { backgroundColor: colors.success }]}
                  onPress={handleSubmitGuess}
                >
                  <Text style={[styles.guessBtnText, { fontFamily: fonts.bodyBold }]}>Deviner</Text>
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
  entryTitle: {
    fontSize: 28,
    marginBottom: 40,
  },
  entryButtons: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  entryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  entryBtnText: {
    color: '#FFF',
    fontSize: 18,
  },
  joinInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  joinInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  joinBtn: {
    width: 70,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 16,
  },
  backLink: {
    marginTop: 32,
  },
  backLinkText: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 20,
    marginBottom: 24,
  },
  codeContainer: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
  },
  codeDisplay: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 16,
  },
  timerText: {
    fontSize: 24,
    marginBottom: 16,
  },
  abandonBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  abandonBtnText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedCharContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    minWidth: 280,
  },
  selectedCharLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCharName: {
    fontSize: 24,
  },
  hintText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  confirmBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 8,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 18,
  },
  confirmedContainer: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  confirmedText: {
    fontSize: 20,
  },
  statusHint: {
    fontSize: 14,
  },
  selectBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  selectBtnText: {
    color: '#FFF',
    fontSize: 16,
  },
  changeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  changeBtnText: {
    color: '#000',
    fontSize: 14,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultReason: {
    fontSize: 16,
    marginBottom: 32,
  },
  rewardsContainer: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    gap: 8,
  },
  rewardsTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontSize: 14,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gameContainer: {
    flex: 1,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backIconBtn: {
    padding: 8,
  },
  turnIndicator: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  waitingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  answerButtonsContainer: {
    padding: 16,
    margin: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  pendingQuestionText: {
    fontSize: 14,
  },
  pendingQuestion: {
    fontSize: 16,
  },
  answerBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  answerBtnText: {
    color: '#FFF',
    fontSize: 14,
  },
  questionsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  answerBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  answerYes: {
    backgroundColor: '#2ecc71',
    color: '#fff',
  },
  answerNo: {
    backgroundColor: '#e74c3c',
    color: '#fff',
  },
  answerPartial: {
    backgroundColor: '#f39c12',
    color: '#fff',
  },
  actionBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
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
  sendBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sharinganBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sharinganBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  guessRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
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
  guessBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
