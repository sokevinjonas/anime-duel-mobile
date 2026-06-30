# Frontend Test Checklist - Anime Duel Mobile

## 🎮 Mode Solo (SoloGameScreen)

### ✅ Tests de Base
- [ ] L'écran se charge sans erreurs
- [ ] Le compteur de questions s'affiche (X/10)
- [ ] Le bouton Sharingan s'affiche avec le compteur (3)
- [ ] Le chat affiche le premier message de l'IA

### ✅ Timer (DOIT ÊTRE ABSENT)
- [ ] ❌ Pas de timer visible en haut à droite
- [ ] ❌ Pas de compte à rebours
- [ ] ✅ Mode solo = pas de pression de temps

### ✅ Questions
- [ ] Peut taper une question dans l'input
- [ ] Le bouton "envoyer" (icône) fonctionne
- [ ] La question apparaît dans le chat (bulle bleue à droite)
- [ ] L'animation "L'IA répond..." s'affiche avec les points animés
- [ ] La réponse de l'IA apparaît après (Oui/Non/Peut-être)
- [ ] Le compteur de questions s'incrémente (1/10 → 2/10)

### ✅ Sharingan
- [ ] Cliquer sur le bouton Sharingan affiche l'animation
- [ ] Un indice apparaît dans le chat après 2s (💡 Indice: ...)
- [ ] Le compteur de Sharingan décrémente (3 → 2)
- [ ] Le modal se ferme automatiquement après 2s
- [ ] Le bouton devient grisé quand il n'en reste plus (0)

### ✅ Deviner le personnage
- [ ] Peut taper le nom dans l'input "Devine le personnage"
- [ ] Le bouton "VALIDER" est actif quand il y a du texte
- [ ] Cliquer sur "VALIDER" affiche un Alert de confirmation
- [ ] L'Alert affiche: "Tu crois que c'est: [nom]"
- [ ] Bouton "Non, corriger" ferme l'Alert
- [ ] Bouton "Oui, valider!" soumet la réponse
- [ ] En cas de succès: écran de victoire avec "Bravo!"
- [ ] En cas d'échec: écran de défaite avec "Réessaye"

### ✅ Navigation
- [ ] Bouton retour en haut à gauche fonctionne
- [ ] Si partie en cours: Alert "Quitter la partie?"
- [ ] Message "Partie sauvegardée" s'affiche
- [ ] Retourne à l'écran d'accueil

### ✅ UI/UX
- [ ] Interface utilise les couleurs du thème (pas noir hardcodé)
- [ ] Mode sombre fonctionne correctement
- [ ] Mode clair fonctionne correctement
- [ ] Pas d'erreur "Unexpected text node" dans la console
- [ ] Le scroll du chat fonctionne
- [ ] Les messages sont bien alignés (joueur à droite, IA à gauche)

---

## 🤝 Mode PvP (MatchScreen)

### ✅ Connexion & Attente
- [ ] Option "Créer une partie" génère un code
- [ ] Le code s'affiche clairement (6 caractères)
- [ ] Message "En attente d'un adversaire"
- [ ] Option "Rejoindre" permet d'entrer un code
- [ ] Quand un ami rejoint: message de confirmation

### ✅ Sélection de personnage (7s timeout)
- [ ] Modal de sélection de personnages s'affiche
- [ ] Peut sélectionner un personnage
- [ ] Message "Personnage choisi!" s'affiche
- [ ] Si adversaire aussi choisi: "L'adversaire a aussi choisi!"
- [ ] Si timeout (7s): personnage auto-sélectionné par le backend
- [ ] Phase passe à "playing" quand les 2 ont choisi

### ✅ Timer (15s par tour)
- [ ] Timer s'affiche en haut à droite (format: "15s")
- [ ] Timer décrémente chaque seconde (15, 14, 13...)
- [ ] Indicateur de tour: "Ton tour" (vert) ou "Tour adverse" (orange)
- [ ] Background du header change selon le tour
- [ ] Quand timer atteint 0: auto-submit réponse vide
- [ ] Timer se reset à 15s au prochain tour

### ✅ Questions
- [ ] Input "Pose ta question..." actif pendant son tour
- [ ] Bouton "?" pour envoyer la question
- [ ] Animation "L'adversaire répond..." s'affiche
- [ ] Points animés (. → .. → ...)
- [ ] La réponse apparaît dans la liste (Oui/Non/Partiellement)
- [ ] L'historique des questions/réponses s'affiche
- [ ] Input désactivé pendant le tour adverse

### ✅ Sharingan en PvP
- [ ] Bouton "Sharingan" visible pendant son tour
- [ ] Utiliser Sharingan envoie l'event au backend
- [ ] L'indice apparaît dans l'historique
- [ ] Les deux joueurs voient l'indice
- [ ] Compteur décrémente

### ✅ Deviner
- [ ] Input "Deviner..." actif pendant son tour
- [ ] Bouton "Deviner" pour soumettre
- [ ] Si correct: écran de victoire
- [ ] Si incorrect: message d'erreur
- [ ] La partie continue si incorrect

### ✅ Fin de partie
- [ ] Écran de résultat s'affiche
- [ ] Affiche "🎉 Victoire!" ou "😔 Défaite"
- [ ] Affiche la raison (personnage deviné, adversaire déco, etc.)
- [ ] Affiche les récompenses (Berry, Sharingan)
- [ ] Bouton "Retour à l'accueil" fonctionne

### ✅ UI/UX
- [ ] Interface utilise les couleurs du thème (pas noir hardcodé)
- [ ] Mode sombre fonctionne
- [ ] Mode clair fonctionne
- [ ] Pas d'erreur "Unexpected text node" dans la console
- [ ] Toutes les couleurs sont dynamiques (pas de #1a1a2e, #e94560, etc.)
- [ ] L'historique scroll correctement
- [ ] Les badges de réponse (Oui/Non) ont les bonnes couleurs

---

## 🐛 Bugs Connus à Vérifier

### ❌ Bugs Corrigés
- [x] Timer en mode Solo (retiré ✅)
- [x] Interface noire en PvP (thème corrigé ✅)
- [x] "Unexpected text node" avec messages vides (filtrage ajouté ✅)
- [x] Sharingan ne décrémente pas (corrigé ✅)
- [x] Modal Sharingan ne se ferme pas (corrigé ✅)

### ⚠️ À Tester
- [ ] Bouton VALIDER ne répond pas (debug logs ajoutés)
- [ ] Console logs pour traquer le problème
- [ ] Vérifier si `guessing` reste bloqué à `true`

---

## 🔧 Tests Console (DevTools)

### Messages Attendus
```
handleConfirmGuess called, guess: [nom saisi]
Submitting guess: [nom saisi]
Submit result: { soloSubmitGuess: { correct: true/false } }
```

### Messages d'Erreur
Si le bouton ne fonctionne pas:
```
Submit blocked - guess: [vide ou valeur] sessionId: [null ou valeur]
```

---

## 📱 Tests sur Devices

### iOS
- [ ] iPhone SE (petit écran)
- [ ] iPhone 14 (écran moyen)
- [ ] iPhone 14 Pro Max (grand écran)

### Android
- [ ] Pixel 5 (Android 12+)
- [ ] Samsung Galaxy (Android 11+)
- [ ] Écran tablet (si disponible)

---

## 🎨 Tests de Thème

### Mode Clair
- [ ] Background blanc/clair
- [ ] Texte noir/foncé lisible
- [ ] Boutons colorés (orange, vert)
- [ ] Pas de contraste insuffisant

### Mode Sombre
- [ ] Background noir/foncé
- [ ] Texte blanc/clair lisible
- [ ] Boutons colorés visibles
- [ ] Pas de blanc aveuglant

---

## 🚀 Performance

- [ ] Pas de lag dans les animations
- [ ] Le chat scroll smoothly
- [ ] Les modals s'ouvrent/ferment rapidement
- [ ] Pas de freeze pendant les mutations GraphQL
- [ ] Timer précis (pas de saut de secondes)

---

## ✅ Checklist de Release

- [ ] Tous les tests Solo passent
- [ ] Tous les tests PvP passent
- [ ] Aucune erreur dans la console
- [ ] Thème clair/sombre OK
- [ ] Tests sur 2+ devices
- [ ] Backend sync OK (socket events)
- [ ] Pas de crash pendant 10min de jeu

---

**Date de dernière mise à jour:** 2026-06-30  
**Status:** En cours de test  
**Bugs critiques:** 0  
**Bugs mineurs:** 1 (bouton VALIDER à investiguer)
