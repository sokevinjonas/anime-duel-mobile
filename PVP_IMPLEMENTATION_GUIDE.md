# 🎮 Guide d'implémentation PvP - Match entre amis

**Status:** Backend ✅ Complet | Frontend ⏳ En cours  
**Date:** 2026-07-01

---

## ✅ Backend Complet (3 commits)

### Phase 1: Lobby création & config
- `match:create` accepte `betAmount` + `maxQuestions` (5/10/15/18)
- Expiration 2min auto (120s)
- Events: `match:created`, `match:lobby_expired`, `match:abandon_lobby`
- Vérification berry avant lock

### Phase 2: Sélection personnage
- `match:choose_char` → sélection (highlight)
- `match:confirm_char` → validation (bouton séparé)
- Timeout 20s → random character si pas choisi
- Animation 3s (dice/sharingan) avant démarrage
- Random qui commence (backend)

### Phase 3: Tours de jeu
- Timer 20s par tour (était 15s)
- `turn:question` → envoie question à adversaire
- `turn:answer` → adversaire choisit YES/NO/PARTIALLY
- `turn:answer_received` → réponse broadcast
- `turn:timeout` → skip tour si timer = 0
- Quota de questions → `match:quota_reached`

---

## ⏳ Frontend En cours

### ✅ Modals créés
- `CreateMatchModal.tsx` - Config avant création (bet + questions)
- `JoinLobbyModal.tsx` - Infos lobby + Accept/Decline
- `StartAnimationModal.tsx` - Animation 3s Sharingan

### 🔄 MatchScreen à refactoriser

**Nouveau flow requis:**

#### 1. Écran d'entrée (avant connexion)
```tsx
// 2 boutons:
<Button onPress={handleShowCreateModal}>Créer une partie</Button>
<Button onPress={handleShowJoinInput}>Rejoindre (code)</Button>

// States:
const [showCreateModal, setShowCreateModal] = useState(false);
const [showJoinInput, setShowJoinInput] = useState(false);
const [joinCodeInput, setJoinCodeInput] = useState('');
```

#### 2. Création → Attente (2min)
```tsx
// Après création:
setPhase('waiting');
setMyRoomCode(data.roomCode);
setExpiresAt(data.expiresAt);

// UI:
- Affiche code en GROS
- Bouton "Copier le code" (Clipboard.setString)
- Bouton "Partager" (Share.share avec WhatsApp, etc.)
- Timer countdown 2min
- Bouton "Abandonner" → emit match:abandon_lobby

// Timer expiration:
const expirationTimer = setTimeout(() => {
  // Retour accueil
  navigation.goBack();
}, expiresAt - Date.now());
```

#### 3. Rejoindre → Modal validation
```tsx
// Quand user entre code:
socket.emit('match:join_request', { roomCode });

// Backend répond:
socket.on('match:lobby_info', (info) => {
  setLobbyInfo(info);
  setShowJoinModal(true);
});

// User clique "Accepter":
socket.emit('match:join_accept', { username: user.username, roomCode });

// Si pas assez berry:
socket.on('match:join_declined', (data) => {
  // Afficher ResponseModal avec data.message
});
```

#### 4. Sélection personnage (20s)
```tsx
// Backend: match:character_selection_start { duration: 20000 }
setPhase('choosing');
setShowCharPicker(true);
setCharSelectionDeadline(Date.now() + 20000);

// Dans CharacterPicker:
const [selectedCharId, setSelectedCharId] = useState(null);
const [confirmedCharId, setConfirmedCharId] = useState(null);

// Clic personnage → highlight
onSelectChar={(char) => {
  setSelectedCharId(char.id);
  socket.emit('match:choose_char', { characterId: char.id });
}}

// Bouton "Valider" séparé:
<Button 
  disabled={!selectedCharId || confirmedCharId}
  onPress={() => {
    socket.emit('match:confirm_char');
    setConfirmedCharId(selectedCharId);
  }}
>
  VALIDER
</Button>

// Timer 20s countdown:
useEffect(() => {
  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((charSelectionDeadline - Date.now()) / 1000));
    setCharSelectionTimer(remaining);
    
    if (remaining === 0 && !confirmedCharId) {
      socket.emit('match:character_timeout');
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [charSelectionDeadline, confirmedCharId]);

// Backend auto-select random:
socket.on('match:character_auto_selected', (data) => {
  if (data.userId === myUserId) {
    setConfirmedCharId('random');
    setShowCharPicker(false);
  }
});
```

#### 5. Animation démarrage (3s)
```tsx
socket.on('match:start_animation', (data) => {
  setShowStartAnimation(true);
  
  setTimeout(() => {
    setShowStartAnimation(false);
  }, data.duration);
});

<StartAnimationModal 
  visible={showStartAnimation}
  starterName={activePlayerId === myUserId ? 'Tu' : opponentUsername}
/>
```

#### 6. Tours de jeu (20s timer)
```tsx
// Backend envoie match:start:
socket.on('match:start', (data) => {
  setPhase('playing');
  setIsMyTurn(data.activePlayerId === myUserId);
  setTimerEnd(data.timerEnd);
});

// Timer countdown (20s):
useEffect(() => {
  if (phase !== 'playing' || !timerEnd) return;
  
  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((timerEnd - Date.now()) / 1000));
    setTimerSeconds(remaining);
    
    if (remaining === 0 && isMyTurn) {
      socket.emit('turn:timeout');
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [phase, timerEnd, isMyTurn]);

// Poser question:
const handleAskQuestion = () => {
  if (!question.trim() || !isMyTurn) return;
  socket.emit('turn:question', { question });
  setQuestion('');
  setWaitingForAnswer(true);
};

// Afficher question reçue:
socket.on('turn:question_asked', (data) => {
  if (data.playerId !== myUserId) {
    // C'est la question de l'adversaire → afficher boutons Oui/Non/Peut-être
    setPendingQuestion(data.question);
    setShowAnswerButtons(true);
  } else {
    // Ma propre question → juste l'afficher
    setQuestions(prev => [...prev, { 
      playerId: data.playerId, 
      question: data.question,
      answer: null,
      turnNumber: data.turnNumber 
    }]);
  }
});

// Répondre à la question:
const handleAnswer = (answer: 'YES' | 'NO' | 'PARTIALLY') => {
  socket.emit('turn:answer', { answer });
  setShowAnswerButtons(false);
  setPendingQuestion(null);
};

// UI boutons réponse:
{showAnswerButtons && pendingQuestion && (
  <View style={styles.answerButtons}>
    <Text>Question: {pendingQuestion}</Text>
    <View style={styles.btnRow}>
      <Button onPress={() => handleAnswer('YES')}>Oui</Button>
      <Button onPress={() => handleAnswer('NO')}>Non</Button>
      <Button onPress={() => handleAnswer('PARTIALLY')}>Peut-être</Button>
    </View>
  </View>
)}

// Réponse reçue:
socket.on('turn:answer_received', (data) => {
  setQuestions(prev => prev.map(q => 
    q.question === data.question 
      ? { ...q, answer: data.answer }
      : q
  ));
  setWaitingForAnswer(false);
});

// Nouveau tour:
socket.on('turn:end', (data) => {
  setIsMyTurn(data.activePlayerId === myUserId);
  setTimerEnd(data.timerEnd);
  setTimerSeconds(20);
});

// Timeout tour:
socket.on('turn:timeout_occurred', (data) => {
  // Afficher toast: "X a dépassé le temps"
});
```

#### 7. Animation "En cours..."
```tsx
// Pendant waitingForAnswer:
{waitingForAnswer && (
  <View style={styles.typingContainer}>
    <ActivityIndicator size="small" color={colors.primary} />
    <Text>L'adversaire répond{typingDots}</Text>
  </View>
)}

// Typing dots animation:
useEffect(() => {
  if (!waitingForAnswer) {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    return;
  }
  
  typingIntervalRef.current = setInterval(() => {
    setTypingDots(prev => prev === '...' ? '.' : prev + '.');
  }, 500);
  
  return () => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
  };
}, [waitingForAnswer]);
```

#### 8. Partage code (WhatsApp, etc.)
```tsx
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';

// Copier:
const handleCopyCode = async () => {
  await Clipboard.setStringAsync(myRoomCode);
  // Toast: "Code copié!"
};

// Partager:
const handleShareCode = async () => {
  await Share.share({
    message: `Rejoins ma partie Nanika!\nCode: ${myRoomCode}`,
    title: 'Partie Nanika',
  });
};
```

---

## 📋 Checklist finale

### Backend ✅
- [x] Modal config (bet + questions)
- [x] Expiration 2min lobby
- [x] Join request + validation berry
- [x] Sélection + Bouton Valider
- [x] Timeout 20s → random character
- [x] Animation 3s + random starter
- [x] Timer 20s par tour
- [x] Q&A flow (question → answer → switch)
- [x] Timeout tour → skip

### Frontend ⏳
- [x] CreateMatchModal
- [x] JoinLobbyModal
- [x] StartAnimationModal
- [ ] MatchScreen refactor complet
- [ ] Écran entrée (créer/rejoindre)
- [ ] Attente 2min + copier/partager
- [ ] CharacterPicker avec bouton Valider
- [ ] Timer sélection 20s
- [ ] Animation démarrage integration
- [ ] Tours de jeu UI (timer 20s)
- [ ] Boutons Oui/Non/Peut-être
- [ ] Animation "En cours..."
- [ ] Historique Q&A
- [ ] Sharingan button
- [ ] Submit guess

---

## 🚀 Prochaines étapes

1. **Refactoriser MatchScreen** avec nouveau flow
2. **Modifier CharacterPicker** pour ajouter bouton Valider
3. **Tester flow complet** end-to-end
4. **Polish UI/UX** (animations, feedback)

**Estimation:** 2-3h implémentation frontend complète

---

**Backend commits:**
- `6d41d3a` - Phase 1 (lobby)
- `036059b` - Phase 2 (character selection)
- `ea83d60` - Phase 3 (Q&A turns)

**Frontend commits:**
- `0fe3278` - Modals UI
