import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, Animated, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from '../components/ui/Button3D';
import { useAuthErrorHandler } from '../hooks/useAuthErrorHandler';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const START_SOLO_GAME = gql`
  mutation StartSoloPlayerGuesses($difficulty: String!) {
    startSoloPlayerGuesses(difficulty: $difficulty) {
      sessionId
      maxQuestions
      firstQuestion
    }
  }
`;

const ASK_QUESTION = gql`
  mutation SoloAskQuestion($sessionId: String!, $question: String!) {
    soloAskQuestion(sessionId: $sessionId, question: $question) {
      answer
      turnNumber
      quotaReached
    }
  }
`;

const SUBMIT_GUESS = gql`
  mutation SoloSubmitGuess($sessionId: String!, $guess: String!) {
    soloSubmitGuess(sessionId: $sessionId, guess: $guess) {
      correct
      characterName
    }
  }
`;

const USE_SHARINGAN = gql`
  mutation SoloUseSharingan($sessionId: String!) {
    soloUseSharingan(sessionId: $sessionId) {
      hint
      sharinganRemaining
    }
  }
`;

export function SoloGameScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();

  const scrollViewRef = useRef<ScrollView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sessionIdRef = useRef<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [messages, setMessages] = useState<Array<{ type: 'player' | 'ai'; text: string }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [sharinganRemaining, setJokersRemaining] = useState(3);
  const [aiAvatarUrl, setAiAvatarUrl] = useState<string>('');

  const [startGame, { loading: starting, error: startError }] = useMutation(START_SOLO_GAME);
  const [askQuestion, { loading: asking, error: askError }] = useMutation(ASK_QUESTION);
  const [submitGuess, { loading: guessing, error: guessError }] = useMutation(SUBMIT_GUESS);
  const [useSharingan, { loading: sharinganLoading }] = useMutation(USE_SHARINGAN);

  // Auto logout si erreur auth
  useAuthErrorHandler(startError);
  useAuthErrorHandler(askError);
  useAuthErrorHandler(guessError);

  // Intercepter le back button si partie en cours
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Si pas de session ou partie terminée, laisser quitter
      if (!sessionIdRef.current || gameOver) {
        return;
      }

      // Si partie en cours (sessionId existe et pas gameOver), demander confirmation
      e.preventDefault();

      Alert.alert(
        'Quitter la partie ?',
        'Tu vas perdre 1 Chakra si tu quittes maintenant. Es-tu sûr ?',
        [
          { text: 'Annuler', style: 'cancel', onPress: () => {} },
          {
            text: 'Quitter',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, gameOver]);

  useEffect(() => {
    handleStartGame();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const translateAnswer = (answer: string): string => {
    const translations: Record<string, string> = {
      'YES': 'Oui',
      'NO': 'Non',
      'PARTIALLY': 'Peut-être',
    };
    return translations[answer] || answer;
  };

  const handleStartGame = async () => {
    try {
      const { data } = await startGame({ variables: { difficulty: 'EASY' } });
      const sid = data.startSoloPlayerGuesses.sessionId;
      setSessionId(sid);
      sessionIdRef.current = sid;
      setMaxQuestions(data.startSoloPlayerGuesses.maxQuestions);
      if (data.startSoloPlayerGuesses.firstQuestion) {
        setMessages([{ type: 'ai', text: data.startSoloPlayerGuesses.firstQuestion }]);
      }
    } catch (error: any) {
      console.error('Error starting game:', error);
      // Si pas assez d'énergie, retourner au HomeScreen
      if (error?.message?.includes('Not enough energy') || error?.graphQLErrors?.some((e: any) => e.message?.includes('Not enough energy'))) {
        alert('⚡ Pas assez d\'énergie ! Attends la régénération ou utilise des gems.');
        navigation.goBack();
      }
    }
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || !sessionId) return;

    const question = currentQuestion;
    try {
      // Add player message
      setMessages(prev => [...prev, { type: 'player', text: question }]);
      setCurrentQuestion('');

      const { data } = await askQuestion({
        variables: { sessionId, question },
      });

      // Add AI response
      const translatedAnswer = translateAnswer(data.soloAskQuestion.answer);
      setMessages(prev => [...prev, { type: 'ai', text: translatedAnswer }]);

      if (data.soloAskQuestion.quotaReached) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const handleUseJoker = async () => {
    if (!sessionId || sharinganRemaining <= 0) return;

    try {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      const { data } = await useSharingan({ variables: { sessionId } });

      if (data?.soloUseJoker?.hint) {
        setMessages(prev => [...prev, { type: 'ai', text: `💡 Indice: ${data.soloUseJoker.hint}` }]);
        setJokersRemaining(data.soloUseJoker.sharinganRemaining);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error using joker:', error);
    }
  };

  const handleSubmitGuess = async () => {
    if (!guess.trim() || !sessionId) return;

    try {
      const { data } = await submitGuess({
        variables: { sessionId, guess },
      });

      setGameOver(true);
      setWon(data.soloSubmitGuess.correct);
      // Pas de révélation du personnage dans les paliers
      setCorrectAnswer('');

      if (data.soloSubmitGuess.correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (starting) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          Préparation du match...
        </Text>
      </View>
    );
  }

  if (gameOver) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.resultContainer}>
          <MaterialIcons
            name={won ? 'celebration' : 'mood-bad'}
            size={80}
            color={won ? colors.primary : colors.error}
          />
          <Text style={[styles.resultTitle, { color: colors.text, fontFamily: fonts.heading }]}>
            {won ? 'Victoire !' : 'Défaite'}
          </Text>
          <Text style={[styles.resultText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            {won
              ? 'Bravo ! Tu passes au niveau suivant'
              : 'Réessaye pour trouver le bon personnage'}
          </Text>

          <Button3D
            title="RETOUR"
            color={colors.primary}
            darkColor={colors.primaryDark}
            onPress={handleGoBack}
            size="large"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          Mode Solo
        </Text>
        <View style={styles.headerRight}>
          <Text style={[styles.questionsCount, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
            {messages.length}/{maxQuestions}
          </Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.sharinganBtn, { backgroundColor: sharinganRemaining > 0 ? colors.orange : colors.border }]}
              onPress={handleUseJoker}
              disabled={sharinganRemaining <= 0 || sharinganLoading}
            >
              <Text style={styles.sharinganText}>👁️ {sharinganRemaining}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Chat messages */}
      <ScrollView ref={scrollViewRef} style={styles.historyScroll} contentContainerStyle={styles.historyContent}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.messageRow,
              { justifyContent: msg.type === 'player' ? 'flex-end' : 'flex-start' },
            ]}
          >
            {msg.type === 'ai' && aiAvatarUrl && (
              <Image
                source={{ uri: aiAvatarUrl }}
                style={styles.avatar}
              />
            )}
            <View
              style={[
                styles.messageBubble,
                {
                  backgroundColor: msg.type === 'player' ? colors.primary : colors.surface,
                  borderWidth: msg.type === 'ai' ? 1 : 0,
                  borderColor: msg.type === 'ai' ? colors.border : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: msg.type === 'player' ? '#FFF' : colors.text,
                    fontFamily: fonts.body,
                  },
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input area */}
      <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontFamily: fonts.body }]}
          placeholder="Pose une question..."
          placeholderTextColor={colors.textMuted}
          value={currentQuestion}
          onChangeText={setCurrentQuestion}
          multiline
          maxLength={200}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={handleAskQuestion}
          disabled={asking || !currentQuestion.trim()}
        >
          <MaterialIcons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Guess area */}
      <View style={[styles.guessArea, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.guessLabel, { color: colors.textSecondary, fontFamily: fonts.bodyBold }]}>
          Devine le personnage :
        </Text>
        <View style={styles.guessRow}>
          <TextInput
            style={[styles.guessInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontFamily: fonts.body }]}
            placeholder="Nom du personnage"
            placeholderTextColor={colors.textMuted}
            value={guess}
            onChangeText={setGuess}
          />
          <Button3D
            title="VALIDER"
            color={colors.orange}
            darkColor={colors.orangeDark}
            onPress={handleSubmitGuess}
            size="small"
            disabled={guessing || !guess.trim()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingText: { marginTop: 16, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, flex: 1, marginLeft: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  questionsCount: { fontSize: 16 },
  sharinganBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sharinganText: { fontSize: 16, fontWeight: 'bold' },
  historyScroll: { flex: 1 },
  historyContent: { padding: 12, gap: 12 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '78%',
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guessArea: {
    padding: 12,
    gap: 10,
  },
  guessLabel: { fontSize: 13, fontWeight: '600' },
  guessRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  guessInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 24,
  },
  resultTitle: { fontSize: 32 },
  resultText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
});
