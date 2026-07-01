import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CharacterPicker } from '../components/CharacterPicker';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const START_PLAYER_GUESSES = gql`
  mutation StartSoloPlayerGuesses($difficulty: String!, $maxQuestions: Int) {
    startSoloPlayerGuesses(difficulty: $difficulty, maxQuestions: $maxQuestions) {
      sessionId
      maxQuestions
    }
  }
`;

const START_AI_GUESSES = gql`
  mutation StartSoloAiGuesses($difficulty: String!, $characterId: String!, $maxQuestions: Int) {
    startSoloAiGuesses(difficulty: $difficulty, characterId: $characterId, maxQuestions: $maxQuestions) {
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
    }
  }
`;

const USE_JOKER = gql`
  mutation SoloUseJoker($sessionId: String!) {
    soloUseJoker(sessionId: $sessionId) {
      eliminatedGroup
      eliminatedCharacters
    }
  }
`;

const ANSWER_AI = gql`
  mutation SoloAnswerAi($sessionId: String!, $answer: String!) {
    soloAnswerAi(sessionId: $sessionId, answer: $answer) {
      nextQuestion
      aiGuess
      aiCorrect
      turnNumber
    }
  }
`;

type Phase = 'menu' | 'playing_guess' | 'playing_ai' | 'finished';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface QEntry {
  question: string;
  answer: string;
  turn: number;
}

export function SoloScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<QEntry[]>([]);
  const [question, setQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [result, setResult] = useState<{ won: boolean; message: string } | null>(null);
  const [showCharPicker, setShowCharPicker] = useState(false);

  const [startPlayerGuesses] = useMutation<any>(START_PLAYER_GUESSES);
  const [startAiGuesses] = useMutation<any>(START_AI_GUESSES);
  const [askQuestion] = useMutation<any>(ASK_QUESTION);
  const [submitGuess] = useMutation<any>(SUBMIT_GUESS);
  const [useJoker] = useMutation<any>(USE_JOKER);
  const [answerAi] = useMutation<any>(ANSWER_AI);

  const handleStartPlayerGuesses = async () => {
    const { data } = await startPlayerGuesses({
      variables: { difficulty, maxQuestions: 10 },
    });
    setSessionId(data.startSoloPlayerGuesses.sessionId);
    setPhase('playing_guess');
  };

  const handleStartAiGuesses = () => {
    setShowCharPicker(true);
  };

  const handleCharSelected = async (char: { id: string; name: string }) => {
    setShowCharPicker(false);
    const { data } = await startAiGuesses({
      variables: { difficulty, characterId: char.id, maxQuestions: 10 },
    });
    setSessionId(data.startSoloAiGuesses.sessionId);
    setAiQuestion(data.startSoloAiGuesses.firstQuestion);
    setPhase('playing_ai');
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const { data } = await askQuestion({
      variables: { sessionId, question: question.trim() },
    });
    const r = data.soloAskQuestion;
    setQuestions((prev) => [...prev, { question: question.trim(), answer: r.answer, turn: r.turnNumber }]);
    setQuestion('');
    if (r.quotaReached) {
      Alert.alert('Quota atteint', 'Soumets ta réponse finale !');
    }
  };

  const handleGuess = async () => {
    if (!guess.trim()) return;
    const { data } = await submitGuess({
      variables: { sessionId, guess: guess.trim() },
    });
    if (data.soloSubmitGuess.correct) {
      setPhase('finished');
      setResult({ won: true, message: 'Tu as trouvé le personnage !' });
    } else {
      Alert.alert('Raté', 'Ce n\'est pas le bon personnage.');
    }
    setGuess('');
  };

  const handleJoker = async () => {
    const { data } = await useJoker({ variables: { sessionId } });
    Alert.alert('Joker', `Éliminé : ${data.soloUseJoker.eliminatedGroup}`);
  };

  const handleAnswerAi = async (answer: 'YES' | 'NO' | 'PARTIALLY') => {
    const { data } = await answerAi({ variables: { sessionId, answer } });
    const r = data.soloAnswerAi;

    setQuestions((prev) => [...prev, { question: aiQuestion, answer, turn: r.turnNumber }]);

    if (r.aiGuess) {
      setPhase('finished');
      setResult({
        won: !r.aiCorrect,
        message: r.aiCorrect
          ? `L'IA a deviné : ${r.aiGuess} !`
          : `L'IA s'est trompée : "${r.aiGuess}". Tu gagnes !`,
      });
    } else if (r.nextQuestion) {
      setAiQuestion(r.nextQuestion);
    }
  };

  if (phase === 'menu') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Mode Solo</Text>

        <View style={styles.difficultyRow}>
          {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.diffBtn, { borderColor: colors.border }, difficulty === d && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.diffText, { color: colors.textSecondary, fontFamily: fonts.body }, difficulty === d && { color: colors.text }]}>
                {d === 'EASY' ? 'Facile' : d === 'MEDIUM' ? 'Moyen' : 'Difficile'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.modeBtn, { backgroundColor: colors.primary }]} onPress={handleStartPlayerGuesses}>
          <Text style={[styles.modeBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Je devine</Text>
          <Text style={[styles.modeBtnSub, { color: colors.textSecondary, fontFamily: fonts.body }]}>L'IA choisit un personnage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.modeBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }]} onPress={handleStartAiGuesses}>
          <Text style={[styles.modeBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>L'IA devine</Text>
          <Text style={[styles.modeBtnSub, { color: colors.textSecondary, fontFamily: fonts.body }]}>Tu choisis, l'IA pose les questions</Text>
        </TouchableOpacity>

        <CharacterPicker
          visible={showCharPicker}
          onSelect={handleCharSelected}
          onClose={() => setShowCharPicker(false)}
        />
      </View>
    );
  }

  if (phase === 'finished') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultTitle, { color: colors.primary, fontFamily: fonts.heading }]}>{result?.won ? 'Victoire !' : 'Défaite...'}</Text>
        <Text style={[styles.resultMsg, { color: colors.textSecondary, fontFamily: fonts.body }]}>{result?.message}</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'playing_ai') {
    return (
      <View style={[styles.gameContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text, fontFamily: fonts.heading }]}>L'IA pose les questions</Text>
        <FlatList
          data={questions}
          keyExtractor={(_, i) => i.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.qRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.qText, { color: colors.text, fontFamily: fonts.body }]}>{item.question}</Text>
              <Text style={[styles.qAnswer, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{item.answer}</Text>
            </View>
          )}
        />
        <View style={[styles.aiQuestionBox, { borderTopColor: colors.border }]}>
          <Text style={[styles.aiQuestionLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>L'IA demande :</Text>
          <Text style={[styles.aiQuestionText, { color: colors.text, fontFamily: fonts.bodyBold }]}>{aiQuestion}</Text>
          <View style={styles.answerBtns}>
            <TouchableOpacity style={[styles.ansBtn, { backgroundColor: colors.success }]} onPress={() => handleAnswerAi('YES')}>
              <Text style={[styles.ansBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ansBtn, { backgroundColor: colors.warning }]} onPress={() => handleAnswerAi('PARTIALLY')}>
              <Text style={[styles.ansBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Partiellement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ansBtn, { backgroundColor: colors.error }]} onPress={() => handleAnswerAi('NO')}>
              <Text style={[styles.ansBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Non</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.gameContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text, fontFamily: fonts.heading }]}>Devine le personnage</Text>
      <FlatList
        data={questions}
        keyExtractor={(_, i) => i.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.qRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.qText, { color: colors.text, fontFamily: fonts.body }]}>{item.question}</Text>
            <Text style={[styles.qAnswer, { color: colors.primary, fontFamily: fonts.bodyBold }]}>{item.answer}</Text>
          </View>
        )}
      />
      <View style={[styles.actionBar, { borderTopColor: colors.border }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Pose ta question..."
            placeholderTextColor={colors.textMuted}
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity style={[styles.askBtn, { backgroundColor: colors.primary }]} onPress={handleAsk}>
            <Text style={[styles.askBtnText, { color: colors.text, fontFamily: fonts.heading }]}>?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <TouchableOpacity style={[styles.jokerBtn, { backgroundColor: colors.berry }]} onPress={handleJoker}>
            <Text style={[styles.jokerText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Joker</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.guessInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.success }]}
            placeholder="Deviner..."
            placeholderTextColor={colors.textMuted}
            value={guess}
            onChangeText={setGuess}
          />
          <TouchableOpacity style={[styles.guessBtn, { backgroundColor: colors.success }]} onPress={handleGuess}>
            <Text style={[styles.guessBtnText, { color: colors.text, fontFamily: fonts.bodyBold }]}>Go</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, marginBottom: 32 },
  difficultyRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  diffBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1 },
  diffText: { fontSize: 14 },
  modeBtn: { borderRadius: 12, padding: 20, width: '100%', marginBottom: 16 },
  modeBtnText: { fontSize: 18 },
  modeBtnSub: { fontSize: 13, marginTop: 4 },
  resultTitle: { fontSize: 32, marginBottom: 12 },
  resultMsg: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  backBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  backBtnText: { fontSize: 16 },
  gameContainer: { flex: 1, paddingTop: 60 },
  header: { fontSize: 20, textAlign: 'center', marginBottom: 12 },
  list: { flex: 1, paddingHorizontal: 16 },
  qRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  qText: { flex: 1, fontSize: 14 },
  qAnswer: { fontSize: 13 },
  actionBar: { padding: 16, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: { flex: 1, borderRadius: 8, padding: 12, borderWidth: 1 },
  askBtn: { borderRadius: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
  askBtnText: { fontSize: 20 },
  bottomRow: { flexDirection: 'row', gap: 8 },
  jokerBtn: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, justifyContent: 'center' },
  jokerText: {},
  guessInput: { flex: 1, borderRadius: 8, padding: 10, borderWidth: 1 },
  guessBtn: { borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  guessBtnText: {},
  aiQuestionBox: { padding: 16, borderTopWidth: 1 },
  aiQuestionLabel: { fontSize: 13, marginBottom: 6 },
  aiQuestionText: { fontSize: 16, marginBottom: 16 },
  answerBtns: { flexDirection: 'row', gap: 10 },
  ansBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  ansBtnText: {},
});
