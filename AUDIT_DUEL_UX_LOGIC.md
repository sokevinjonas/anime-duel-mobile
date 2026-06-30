# 🎮 Audit UX & Logique - Pages Duel Solo & PvP

## 📊 RÉSUMÉ EXÉCUTIF

### Pages auditées
- ✅ **SoloGameScreen** - Duel contre IA (deviner le personnage)
- ✅ **MatchScreen** - PvP en temps réel via Socket.IO

### Issues trouvées : **12 totales**
- 🔴 **Critiques** : 4 (logique bloquante)
- 🟡 **Majeurs** : 5 (UX/friction)
- 🟢 **Mineurs** : 3 (polish)

---

## 🔴 ISSUES CRITIQUES (Logique)

### 1. **SoloGameScreen: Timer manquant**
**Severity:** 🔴 CRITIQUE  
**File:** `SoloGameScreen.tsx`  
**Issue:** Pas de timer visible pour les 10 questions. L'utilisateur ne sait pas combien de temps il reste.

**Backend attend:** Limiter par question ? Par session ?  
**Solution UX:**
- Afficher timer dégressif (60s par question)
- Stop auto si timeout
- Visual warning à 10s

**Code fix needed:**
```tsx
const [timePerQuestion] = useState(60); // secondes
const [remainingTime, setRemainingTime] = useState(60);
// useEffect pour décrémenter
```

---

### 2. **SoloGameScreen: Quota questions non visible**
**Severity:** 🔴 CRITIQUE  
**File:** `SoloGameScreen.tsx` line 267  
**Issue:** Compteur `{turnNumber}/{maxQuestions}` n'indique pas clairement le quota.

**Problème:** Si je pose 5 questions et quota=10, le compteur dit "5/10" mais ne dit pas **"Encore 5 questions"**

**Solution UX:**
```tsx
// Avant: {turnNumber}/{maxQuestions}
// Après:
<Text>Question {turnNumber} / {maxQuestions}</Text>
<ProgressBar progress={turnNumber / maxQuestions} />
```

---

### 3. **MatchScreen: PvP - `myUserId` hardcodé**
**Severity:** 🔴 CRITIQUE  
**File:** `MatchScreen.tsx` line 50  
**Issue:** `const [myUserId] = useState('current-user-id'); // TODO`

**Impact:** Socket events comparent `myUserId` mais c'est toujours 'current-user-id' → **tour jamais change !**

**Fix:**
```tsx
const { user } = useAuth(); // from context
const [myUserId] = useState(user?.id || ''); // get real ID
```

---

### 4. **MatchScreen: Backend sync - Sharingan/Joker manquant**
**Severity:** 🔴 CRITIQUE  
**File:** `MatchScreen.tsx`  
**Issue:** Pas d'event socket pour `handleUseSharingan`. PvP n'implémente pas les indices.

**Backend attend:** Event `turn:sharingan_used` ?  
**Solution:**
```tsx
socket.on('turn:sharingan_used', (data: { userId: string; hint: string }) => {
  if (data.userId !== myUserId) {
    setMessages(prev => [...prev, { type: 'ai', text: `💡 Indice: ${data.hint}` }]);
  }
});
```

---

## 🟡 ISSUES MAJEURS (UX/Friction)

### 5. **SoloGameScreen: Pas de confirmation avant deviner**
**Severity:** 🟡 MAJEUR  
**Issue:** Cliquer "VALIDER" directement ferme le jeu. Pas de "Es-tu sûr?"

**UX Problem:** User peut finir sans vouloir.

**Solution:**
```tsx
const handleSubmitGuess = () => {
  Alert.alert(
    'Confirmer ta réponse?',
    `Tu crois que c'est: ${guess}`,
    [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui!', onPress: confirmGuess }
    ]
  );
};
```

---

### 6. **MatchScreen: Pas de feedback visuel pendant qu'on attend la réponse**
**Severity:** 🟡 MAJEUR  
**Issue:** Après avoir posé une question, rien n'indique que on attend la réponse de l'adversaire.

**UX Fix:**
```tsx
// Ajouter spinner + "En attente de la réponse..."
{isWaitingForResponse && (
  <View style={styles.waitingIndicator}>
    <ActivityIndicator />
    <Text>En attente de la réponse de ton adversaire...</Text>
  </View>
)}
```

---

### 7. **MatchScreen: Timer pas réinitialisé après chaque tour**
**Severity:** 🟡 MAJEUR  
**Issue:** `timerSeconds` se met à jour mais pas reset à 60s chaque nouveau tour.

**Code Fix:**
```tsx
socket.on('turn:end', (data: { activePlayerId: string; timerEnd: number }) => {
  setIsMyTurn(data.activePlayerId === myUserId);
  setTimerSeconds(60); // RESET!
  updateTimer(data.timerEnd);
});
```

---

### 8. **SoloGameScreen: Pas de "Partie sauvegardée" feedback**
**Severity:** 🟡 MAJEUR  
**Issue:** Pas de toast/alert quand on quitte mid-game. L'utilisateur croit pas que c'est sauvegardé.

**Solution:** Toast simple
```tsx
Toast.show({
  type: 'success',
  text1: 'Partie sauvegardée',
  duration: 2000,
});
```

---

### 9. **MatchScreen: Résultats pas clairs**
**Severity:** 🟡 MAJEUR  
**File:** `MatchScreen.tsx` line 48  
**Issue:** `result: { winnerId, reason }` - pas de calcul des points/récompenses affichées.

**UX Fix:** Montrer le résultat avec détails
```tsx
{result && (
  <ResultScreen
    won={result.winnerId === myUserId}
    berryReward={result.berryReward}
    reason={result.reason}
  />
)}
```

---

## 🟢 ISSUES MINEURS (Polish)

### 10. **SoloGameScreen: Pas de "Prêt?" avant de commencer**
**Severity:** 🟢 MINEUR  
**Issue:** Game démarre direct sans animation de démarrage.

**Polish:**
```tsx
if (sessionId && messages.length === 0) {
  return <StartGameAnimation onReady={handleStartAnimation} />;
}
```

---

### 11. **MatchScreen: Pas d'indication qui joue maintenant**
**Severity:** 🟢 MINEUR  
**Issue:** Pas visible si c'est "Mon tour" ou "Attendre adversaire".

**Polish:**
```tsx
<View style={styles.turnIndicator}>
  <Text style={{ color: isMyTurn ? colors.success : colors.warning }}>
    {isMyTurn ? '🎯 Ton tour!' : '⏳ Tour de l\'adversaire'}
  </Text>
</View>
```

---

### 12. **Both Screens: Pas de "Quitter?"  confirmation cohérente**
**Severity:** 🟢 MINEUR  
**Issue:** SoloGameScreen a confirmation, MatchScreen pas.

**Standardize:**
```tsx
const handleGoBack = useCallback(() => {
  if (gameInProgress) {
    Alert.alert('Quitter?', 'Perds ta progression', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: () => navigation.goBack() }
    ]);
  } else {
    navigation.goBack();
  }
}, [gameInProgress]);
```

---

## ✅ CHECKLIST DE FIXES

### Priorité 1 (URGENT)
- [ ] Fix `myUserId` hardcodé → get from useAuth()
- [ ] Ajouter Timer visible (60s / question)
- [ ] Ajouter Sharingan Socket events au PvP
- [ ] Afficher "En attente..." feedback

### Priorité 2 (IMPORTANT)
- [ ] Reset timer après chaque tour
- [ ] Confirmation avant deviner (Solo)
- [ ] Afficher résultats avec récompenses
- [ ] Indicateur tour courant (PvP)

### Priorité 3 (NICE-TO-HAVE)
- [ ] Toast "Partie sauvegardée"
- [ ] Animation de démarrage
- [ ] Standardize "Quitter?" flow

---

## 📋 DÉTAILS BACKEND À VÉRIFIER

1. **PvP Turn Logic:**
   - Qui décide `activePlayerId` chaque tour?
   - Timeout automatique si pas de réponse?

2. **Sharingan in PvP:**
   - Event distinct ou same `turn:response`?
   - Consomme-t-il un Sharingan de l'utilisateur?

3. **Results Calculation:**
   - Qui calcule winner/loser?
   - Récompenses: Berry + Sharingan?
   - Penalties pour timeout?

---

## 🎯 PROCHAINES ÉTAPES

1. Implement Priorité 1 fixes
2. Test avec backend
3. Iterate sur UX feedback
4. A/B test result screen

---

**Audit créé:** 2026-06-30  
**Status:** Ready for Implementation
