import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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

export function SoloGameScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [questions, setQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [startGame, { loading: starting, error: startError }] = useMutation(START_SOLO_GAME);
  const [askQuestion, { loading: asking, error: askError }] = useMutation(ASK_QUESTION);
  const [submitGuess, { loading: guessing, error: guessError }] = useMutation(SUBMIT_GUESS);

  // Auto logout si erreur auth
  useAuthErrorHandler(startError);
  useAuthErrorHandler(askError);
  useAuthErrorHandler(guessError);

  useEffect(() => {
    handleStartGame();
  }, []);

  const handleStartGame = async () => {
    try {
      const { data } = await startGame({ variables: { difficulty: 'EASY' } });
      setSessionId(data.startSoloPlayerGuesses.sessionId);
      setMaxQuestions(data.startSoloPlayerGuesses.maxQuestions);
      if (data.startSoloPlayerGuesses.firstQuestion) {
        setQuestions([{ question: data.startSoloPlayerGuesses.firstQuestion, answer: 'AI started' }]);
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

    try {
      const { data } = await askQuestion({
        variables: { sessionId, question: currentQuestion },
      });

      setQuestions([...questions, { question: currentQuestion, answer: data.soloAskQuestion.answer }]);
      setCurrentQuestion('');

      if (data.soloAskQuestion.quotaReached) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error('Error asking question:', error);
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
            onPress={() => navigation.goBack()}
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          Mode Solo
        </Text>
        <Text style={[styles.questionsCount, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
          {questions.length}/{maxQuestions}
        </Text>
      </View>

      {/* Questions history */}
      <ScrollView style={styles.historyScroll} contentContainerStyle={styles.historyContent}>
        {questions.map((q, idx) => (
          <View
            key={idx}
            style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.questionText, { color: colors.text, fontFamily: fonts.body }]}>
              Q: {q.question}
            </Text>
            <Text style={[styles.answerText, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
              R: {q.answer}
            </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  questionsCount: { fontSize: 16 },
  historyScroll: { flex: 1 },
  historyContent: { padding: 16, gap: 12 },
  questionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  questionText: { fontSize: 15, lineHeight: 22 },
  answerText: { fontSize: 14 },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guessArea: {
    padding: 16,
    gap: 12,
  },
  guessLabel: { fontSize: 14 },
  guessRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  guessInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
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
