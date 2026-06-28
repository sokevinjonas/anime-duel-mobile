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
      <View style={styles.center}>
        <Text style={styles.title}>Mode Solo</Text>

        <View style={styles.difficultyRow}>
          {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.diffText, difficulty === d && styles.diffTextActive]}>
                {d === 'EASY' ? 'Facile' : d === 'MEDIUM' ? 'Moyen' : 'Difficile'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.modeBtn} onPress={handleStartPlayerGuesses}>
          <Text style={styles.modeBtnText}>Je devine</Text>
          <Text style={styles.modeBtnSub}>L'IA choisit un personnage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.modeBtn, styles.modeBtnAlt]} onPress={handleStartAiGuesses}>
          <Text style={styles.modeBtnText}>L'IA devine</Text>
          <Text style={styles.modeBtnSub}>Tu choisis, l'IA pose les questions</Text>
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
      <View style={styles.center}>
        <Text style={styles.resultTitle}>{result?.won ? 'Victoire !' : 'Défaite...'}</Text>
        <Text style={styles.resultMsg}>{result?.message}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'playing_ai') {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.header}>L'IA pose les questions</Text>
        <FlatList
          data={questions}
          keyExtractor={(_, i) => i.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.qRow}>
              <Text style={styles.qText}>{item.question}</Text>
              <Text style={styles.qAnswer}>{item.answer}</Text>
            </View>
          )}
        />
        <View style={styles.aiQuestionBox}>
          <Text style={styles.aiQuestionLabel}>L'IA demande :</Text>
          <Text style={styles.aiQuestionText}>{aiQuestion}</Text>
          <View style={styles.answerBtns}>
            <TouchableOpacity style={[styles.ansBtn, styles.yesBg]} onPress={() => handleAnswerAi('YES')}>
              <Text style={styles.ansBtnText}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ansBtn, styles.partialBg]} onPress={() => handleAnswerAi('PARTIALLY')}>
              <Text style={styles.ansBtnText}>Partiellement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ansBtn, styles.noBg]} onPress={() => handleAnswerAi('NO')}>
              <Text style={styles.ansBtnText}>Non</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <Text style={styles.header}>Devine le personnage</Text>
      <FlatList
        data={questions}
        keyExtractor={(_, i) => i.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.qRow}>
            <Text style={styles.qText}>{item.question}</Text>
            <Text style={styles.qAnswer}>{item.answer}</Text>
          </View>
        )}
      />
      <View style={styles.actionBar}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question..."
            placeholderTextColor="#666"
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity style={styles.askBtn} onPress={handleAsk}>
            <Text style={styles.askBtnText}>?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.jokerBtn} onPress={handleJoker}>
            <Text style={styles.jokerText}>Joker</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.guessInput}
            placeholder="Deviner..."
            placeholderTextColor="#666"
            value={guess}
            onChangeText={setGuess}
          />
          <TouchableOpacity style={styles.guessBtn} onPress={handleGuess}>
            <Text style={styles.guessBtnText}>Go</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 32 },
  difficultyRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  diffBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#555' },
  diffBtnActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  diffText: { color: '#aaa', fontWeight: '600' },
  diffTextActive: { color: '#fff' },
  modeBtn: { backgroundColor: '#e94560', borderRadius: 12, padding: 20, width: '100%', marginBottom: 16 },
  modeBtnAlt: { backgroundColor: '#16213e', borderWidth: 1, borderColor: '#e94560' },
  modeBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  modeBtnSub: { fontSize: 13, color: '#ccc', marginTop: 4 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', color: '#e94560', marginBottom: 12 },
  resultMsg: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  backBtn: { backgroundColor: '#e94560', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  gameContainer: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  list: { flex: 1, paddingHorizontal: 16 },
  qRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  qText: { flex: 1, color: '#fff', fontSize: 14 },
  qAnswer: { color: '#e94560', fontWeight: '600', fontSize: 13 },
  actionBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: { flex: 1, backgroundColor: '#16213e', borderRadius: 8, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#333' },
  askBtn: { backgroundColor: '#e94560', borderRadius: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
  askBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  bottomRow: { flexDirection: 'row', gap: 8 },
  jokerBtn: { backgroundColor: '#8e44ad', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, justifyContent: 'center' },
  jokerText: { color: '#fff', fontWeight: '600' },
  guessInput: { flex: 1, backgroundColor: '#16213e', borderRadius: 8, padding: 10, color: '#fff', borderWidth: 1, borderColor: '#2ecc71' },
  guessBtn: { backgroundColor: '#2ecc71', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  guessBtnText: { color: '#fff', fontWeight: '600' },
  aiQuestionBox: { padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  aiQuestionLabel: { color: '#aaa', fontSize: 13, marginBottom: 6 },
  aiQuestionText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  answerBtns: { flexDirection: 'row', gap: 10 },
  ansBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  yesBg: { backgroundColor: '#2ecc71' },
  partialBg: { backgroundColor: '#f39c12' },
  noBg: { backgroundColor: '#e74c3c' },
  ansBtnText: { color: '#fff', fontWeight: '600' },
});
