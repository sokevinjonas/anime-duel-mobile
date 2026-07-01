# 📋 Frontend TODO - Nanika Mobile App

**Date**: 2026-07-01  
**Status**: 🔧 En cours de refonte UI/UX

---

## 🎯 Vue d'ensemble

Ce document liste **toutes les pages, fonctionnalités et éléments** qui restent à implémenter, améliorer ou refaire dans l'app mobile Nanika.

**Principe de design**: Garder le thème **gamifié à la Duolingo** (animations joyeuses, feedback immédiat, progression visible) mais avec la palette de couleurs et l'identité visuelle de **Nanika**.

---

## 🚀 Pages manquantes

### 1. **Onboarding (2 pages)** ⭐ PRIORITÉ HAUTE

**Status**: ❌ Manquant  
**Description**: Séquence d'introduction pour les nouveaux utilisateurs (première ouverture de l'app)

#### Page 1 - Bienvenue
- **Background**: Image animée (ex: personnages d'anime en arrière-plan flou)
- **Contenu**:
  - Logo Nanika (grand, centré)
  - Titre: "Bienvenue dans Nanika"
  - Texte: "Devine tes personnages d'anime préférés dans des duels épiques !"
  - Bouton: "Suivant" (CTA coloré)
- **Animation**: Fade-in progressif, logo bounce

#### Page 2 - Comment jouer
- **Background**: Image thématique (duels, questions)
- **Contenu**:
  - Illustration/icône: 💬 Questions
  - Titre: "Pose des questions"
  - Texte: "Devine le personnage de ton adversaire en posant des questions stratégiques"
  - Liste à puces:
    - ⚡ Utilise ton Chakra pour jouer
    - 👁️ Le Sharingan t'aide à éliminer des personnages
    - 🫐 Gagne des Berry pour progresser
  - Bouton: "Commencer" → Redirige vers LoginScreen
- **Animation**: Slide horizontale entre les 2 pages

**Technique**:
- Utiliser `react-native-onboarding-swiper` ou custom avec `FlatList` horizontal
- Sauvegarder dans AsyncStorage: `onboarding_seen: true`
- Navigation: `OnboardingScreen` → `LoginScreen` → `MainTabs`

---

## 🎨 Pages à refaire/améliorer

### 2. **LoginScreen** ⭐ PRIORITÉ HAUTE

**Status**: ⚠️ À améliorer  
**Problèmes actuels**:
- Pas de background image
- Nom "ANIME DUEL" au lieu de "NANIKA"
- Bouton Apple à supprimer
- Code OTP affiché dans la même page (pas optimal)

#### Améliorations demandées:

**Visual**:
- **Background image**: Image d'anime en arrière-plan avec overlay sombre (opacity 0.7)
- **Logo Nanika**: Remplacer "ANIME DUEL" par logo Nanika (si disponible) ou texte stylisé
- **Tagline**: "Deviens un maître de la devinette !" ou "L'univers des anime te défie"

**Modifications du code**:
```tsx
// Supprimer le bouton Apple
// AVANT:
<TouchableOpacity onPress={() => handleOAuth('APPLE')}>
  <Text>Apple</Text>
</TouchableOpacity>

// APRÈS: Supprimer complètement

// Changer le titre
// AVANT:
<Text>ANIME DUEL</Text>

// APRÈS:
<Text style={styles.logo}>NANIKA</Text>
```

**Structure proposée**:
1. Background image (ImageBackground)
2. Logo Nanika (centré, haut de page)
3. Tagline
4. Boutons OAuth (Google, Discord seulement)
5. Divider "ou"
6. Input email
7. Bouton "Recevoir un code"
8. Lien "Problème de connexion ?"

---

### 3. **OTP Verification (nouvelle page)** ⭐ PRIORITÉ HAUTE

**Status**: ❌ Manquant (actuellement dans LoginScreen)  
**Description**: Page séparée pour la saisie du code OTP à 6 chiffres

#### Structure proposée:

**Fichier**: `src/screens/OTPScreen.tsx`

**Navigation**:
- LoginScreen → Bouton "Recevoir un code" → `OTPScreen` avec param `{ email }`
- OTPScreen → Vérification réussie → `MainTabs`

**UI Design**:
- Background image (même que LoginScreen)
- Header:
  - Bouton "← Retour"
  - Titre: "Vérifie ton email"
- Contenu:
  - Texte: "Code envoyé à {email}"
  - Input OTP: 6 cases séparées (1 chiffre par case)
  - Animation: Focus automatique case suivante
  - Bouton: "Vérifier"
  - Lien: "Renvoyer le code" (avec cooldown 30s)
- Loading state pendant la vérification

**Technique**:
```tsx
// Navigation depuis LoginScreen
const handleSendCode = async () => {
  await sendLoginCode(email);
  navigation.navigate('OTP', { email });
};

// OTPScreen avec react-native-otp-input ou custom
import OTPTextInput from 'react-native-otp-textinput';
```

---

### 4. **WelcomeGiftModal** ⚠️ UI/UX à revoir

**Status**: ⚠️ Fonctionnel mais design à améliorer  
**Problèmes**:
- Récompenses affichées (10 Pièces, 3 Sharingan) ne correspondent pas au business model
- Manque d'animation "explosion de confettis"
- Texte générique

#### Corrections business model:
```tsx
// Business model: 500 Berry + 5 Sharingan + 8 Chakra
// AVANT:
<Text>10 Pièces</Text>
<Text>3 Sharingan</Text>

// APRÈS:
<View style={styles.rewardCard}>
  <Text>🫐 500 Berry</Text>
</View>
<View style={styles.rewardCard}>
  <Text>👁️ 5 Sharingan</Text>
</View>
<View style={styles.rewardCard}>
  <Text>⚡ 8 Chakra</Text>
</View>
```

#### Améliorations UI/UX:
1. **Animation d'ouverture**: 
   - Cadeau qui "explose" avec confettis (`react-native-confetti-cannon`)
   - Récompenses qui apparaissent une par une avec bounce
2. **Carte gradient**: Utiliser LinearGradient pour chaque récompense
3. **Son**: Ajouter un son de célébration (optionnel)
4. **Texte personnalisé**: "Bienvenue dans Nanika, {username} !" (si username disponible)

**Utiliser `/ui-page`**: Oui, pour tester différentes variantes de design

---

### 5. **MissionsScreen** ⚠️ Design à améliorer

**Status**: ⚠️ Fonctionnel mais design basique  
**Problèmes**:
- Design "liste simple" sans gamification
- Pas de feedback visuel pour missions complétées
- Manque d'animations

#### Améliorations proposées:

**Structure gamifiée**:
1. **Header animé**:
   - Icône mission avec effet pulse
   - Titre "Missions d'Arc"
   - Compteur: "X/Y missions complétées"
   - Barre de progression globale

2. **Cards missions**:
   - Fond gradient selon statut:
     - En cours: gradient bleu/violet
     - Complétée: gradient vert/jaune (glow effect)
     - Réclamée: gris désaturé avec ✓
   - Animation:
     - Shake quand mission complétée
     - Confettis quand récompense réclamée

3. **Groupement par Arc**:
   - Accordéon collapsible
   - Arc actuel ouvert par défaut
   - Arcs futurs verrouillés (icône cadenas 🔒)

**Exemple de carte mission**:
```tsx
<LinearGradient
  colors={completed ? ['#2ecc71', '#27ae60'] : ['#3498db', '#2980b9']}
  style={styles.missionCard}
>
  <View style={styles.missionIcon}>
    {completed ? '✅' : '🎯'}
  </View>
  <View style={styles.missionContent}>
    <Text style={styles.missionLabel}>{label}</Text>
    <ProgressBar current={currentValue} target={targetValue} />
  </View>
  {completed && !claimed && (
    <Button3D title="RÉCLAMER" onPress={handleClaim} />
  )}
</LinearGradient>
```

---

### 6. **SocialScreen** ⚠️ Design à améliorer

**Status**: ⚠️ Fonctionnel mais basique  
**Problèmes**:
- Design trop simple
- Manque de feedback visuel
- Pas d'historique des matchs récents
- Pas de liste d'amis

#### Améliorations proposées:

**Structure complète**:

1. **Section Créer une partie**:
   - Card avec illustration (2 personnages face à face)
   - Bouton 3D "CRÉER" (gros, coloré)
   - Animation hover/press

2. **Section Rejoindre**:
   - Input code avec animation (chaque lettre dans une case)
   - Bouton "REJOINDRE"
   - Validation en temps réel (6 caractères requis)

3. **Section Historique récent** (nouveau):
   - Liste des 5 derniers matchs
   - Afficher: Adversaire, Résultat (W/L), Date
   - Bouton "Revanche" si adversaire en ligne

4. **Section Amis** (nouveau):
   - Liste des amis ajoutés
   - Statut: En ligne/Hors ligne
   - Bouton "Inviter" pour envoyer une invitation
   - Feature à implémenter backend aussi

**Utiliser `/ui-page`**: Oui, pour tester layout et animations

---

### 7. **MatchScreen - Flow création/join salon** 🔴 CRITIQUE

**Status**: ⚠️ Fonctionnel mais UI/UX problématique  
**Problèmes identifiés**:
- Flow trop complexe (6 phases)
- Transitions pas claires
- Anomalies d'état (race conditions possibles)
- Design incohérent entre phases
- Manque de feedback visuel

#### Anomalies détectées:

1. **Phase "entry"**:
   - Affichage joinInput toggle pas smooth
   - Pas de loading state quand on join

2. **Phase "waiting"**:
   - Timer pas toujours synchronisé
   - Bouton "Abandonner" trop visible (devrait être discret)

3. **Phase "choosing"**:
   - CharPicker s'ouvre automatiquement (pas de contrôle)
   - Confirmation "VALIDER" pas assez visible
   - Timer selection 20s trop court (feedback utilisateur)

4. **Phase "playing"**:
   - Input question et input guess sur même ligne (confusing)
   - Bouton Sharingan pas assez mis en avant
   - Historique questions manque de scroll to bottom auto

5. **Phase "finished"**:
   - Pas d'animation de victoire/défaite
   - Récompenses affichées de façon basique

#### Refonte complète demandée:

**Utiliser `/ui-page`**: OUI, OBLIGATOIRE pour chaque phase

**Nouveau flow proposé**:

```
1. EntryScreen (choix Créer/Rejoindre)
   └─ Design: 2 grosses cards avec illustrations

2. CreateLobbyScreen (config match)
   └─ Modal avec sliders (paris, nb questions)
   └─ Génère code automatiquement
   └─ Redirige vers WaitingScreen

3. WaitingScreen (attente adversaire)
   └─ Code en gros au centre
   └─ Boutons Copier/Partager bien visibles
   └─ Timer circulaire (countdown visuel)
   └─ Animation "recherche adversaire" (dots animés)

4. JoinLobbyScreen (saisie code)
   └─ Input 6 cases séparées
   └─ Validation auto quand 6 caractères
   └─ Affiche infos lobby (mise, host)
   └─ Boutons Accepter/Refuser

5. CharacterSelectionScreen
   └─ Grid de personnages (pagination)
   └─ Card sélectionné: highlight glow
   └─ Bouton VALIDER en bas (toujours visible)
   └─ Timer circulaire en haut à droite
   └─ Notification quand adversaire confirme

6. StartAnimationScreen
   └─ Animation "VS"
   └─ Affichage "Tu commences" ou "Adversaire commence"
   └─ Countdown 3-2-1-GO

7. GameScreen
   └─ Refonte complète layout:
      - Top: Timer + Indicateur tour
      - Middle: Historique questions (auto-scroll)
      - Bottom: Zone actions
        - Input question + bouton ?
        - Bouton Sharingan (gros, centré)
        - Input deviner + bouton DEVINER

8. ResultScreen
   └─ Animation victoire: confettis + son
   └─ Animation défaite: écran gris + particules
   └─ Affichage récompenses avec animation
   └─ Boutons: Revanche / Retour accueil
```

**Technique**:
- Séparer chaque phase en screen séparé (pas de mega-component)
- Utiliser stack navigation avec transitions custom
- Gérer état avec Context API (MatchContext)
- Améliorer gestion socket events (éviter race conditions)

---

## 🆕 Pages/Features à créer

### 8. **DailyMissionsScreen** ❌ Manquant

**Status**: ❌ Non implémenté (backend OK)  
**Description**: Afficher les 3 missions journalières

#### Backend disponible:
```graphql
query DailyMissions {
  dailyMissions {
    id
    missionType
    label
    targetValue
    currentValue
    completed
    rewardBerry
  }
}

mutation ClaimDailyReward($missionId: String!) {
  claimDailyReward(missionId: $missionId) {
    success
    berry
  }
}
```

#### UI proposée:
- Header: "Quêtes du jour" + timer reset (minuit)
- 3 cards horizontales (slider)
- Chaque card:
  - Icône mission
  - Label
  - Progression (barre)
  - Récompense (Berry)
  - Bouton "Réclamer" si complétée
- Animation: Refresh automatique chaque jour
- Notification push: "Nouvelles quêtes disponibles !"

**Navigation**:
- Ajouter dans HomeScreen: Bouton "📜 Quêtes du jour"
- Ou ajouter tab dans MissionsScreen: "Arc Missions" | "Daily Quests"

---

### 9. **ProfileScreen - Onglet Statistiques** ⚠️ Incomplet

**Status**: ⚠️ Basique  
**À ajouter**:
- Statistiques détaillées:
  - Winrate (%)
  - Total matchs (solo + PvP)
  - Streak record (Training Days)
  - Palier max atteint
  - Personnages favoris (top 3)
- Graphiques:
  - Évolution Berry (7 derniers jours)
  - Répartition victoires/défaites (pie chart)
- Historique:
  - Derniers 10 matchs
  - Achievements débloqués

**Utiliser `/ui-page`**: Oui, pour tester layout stats

---

### 10. **NotificationsScreen** ❌ Manquant

**Status**: ❌ Non implémenté  
**Description**: Centre de notifications in-app

#### Notifications à gérer:
1. **Systèmes**:
   - Chakra rechargé
   - Streak en danger (20h si pas connecté)
   - Mission complétée
   - Palier débloqué

2. **Sociales**:
   - Ami t'a invité en duel
   - Adversaire a rejoint ton lobby
   - Revanche demandée

3. **Événements**:
   - Événement hebdo commence
   - Offre Pack Rookie disponible
   - Ninja Pass expire bientôt

**UI proposée**:
- Liste de notifications avec badge "New"
- Filtres: Toutes / Non lues / Importantes
- Actions: Marquer comme lu / Supprimer
- Deep links: Click → redirige vers la feature

**Technique**:
- Backend: Table `notifications` avec types
- Push notifications: Expo Notifications
- Badge count sur TabBar

---

## 🎨 Refonte thème & design system

### 11. **Nouvelle palette de couleurs Nanika** ⭐ IMPORTANT

**Status**: ⚠️ Actuellement copie Duolingo  
**Objectif**: Garder le style gamifié mais avec identité Nanika

#### Palette proposée (anime/manga inspired):

```typescript
// src/theme/colors.ts
export const nanikaColors = {
  // Primaires
  primary: '#FF6B6B',      // Rouge énergique (chakra)
  secondary: '#4ECDC4',    // Cyan mystique (eau/ice)
  accent: '#FFE66D',       // Jaune doré (lumière)
  
  // Backgrounds
  background: '#1A1A2E',   // Bleu nuit profond
  surface: '#16213E',      // Bleu marine
  surfaceElevated: '#0F3460', // Bleu-gris
  
  // Textes
  text: '#EAEAEA',         // Blanc cassé
  textSecondary: '#A8A8A8', // Gris clair
  textMuted: '#6C6C6C',    // Gris moyen
  
  // Feedbacks
  success: '#06D6A0',      // Vert turquoise
  warning: '#FFB703',      // Orange vif
  error: '#EF476F',        // Rose-rouge
  info: '#118AB2',         // Bleu info
  
  // Spécifiques Nanika
  chakra: '#5B9CFF',       // Bleu chakra
  berry: '#B565FF',        // Violet berry
  sharingan: '#FF3366',    // Rouge sharingan
  
  // Paliers (arcs)
  arc0: '#94D2BD',         // Vert menthe
  arc1: '#FFB703',         // Orange
  arc2: '#CA6702',         // Orange foncé
  arc3: '#BB3E03',         // Rouge-orange
  arc4: '#9B2226',         // Rouge profond
  arc5: '#660708',         // Bordeaux
};
```

#### Gradients à définir:
```typescript
export const nanikaGradients = {
  primary: ['#FF6B6B', '#EE5A6F'],
  chakra: ['#5B9CFF', '#4785E8'],
  victory: ['#06D6A0', '#04B584'],
  defeat: ['#EF476F', '#D63651'],
  rare: ['#FFE66D', '#FFB703'],
  epic: ['#B565FF', '#9747FF'],
  legendary: ['#FF3366', '#CC0052'],
};
```

#### Composants à mettre à jour:
- Button3D: Utiliser nouvelles couleurs
- Cards: Appliquer gradients
- Modals: Background avec overlay Nanika
- Badges: Couleurs par rareté

**Tâche**: Remplacer progressivement les couleurs Duolingo

---

### 12. **Animations & Micro-interactions** ⚠️ À enrichir

**Status**: ⚠️ Basiques  
**Objectif**: Plus de feedback visuel gamifié

#### Animations à ajouter:

**Globales**:
- Page transitions: Slide avec fade
- Button press: Scale + haptic feedback
- Loading: Spinner custom (shuriken qui tourne)
- Success: Confetti explosion
- Error: Shake animation

**Spécifiques**:
- **Berry gain**: Coins qui volent vers le compteur
- **Chakra refill**: Barre qui pulse avec particles
- **Sharingan use**: Flash rouge + eye rotation
- **Level up**: Explosion de lumière + son
- **Mission complete**: Checkmark animé + bounce

**Technique**:
- `react-native-reanimated` pour perfs
- `lottie-react-native` pour animations complexes
- `react-native-haptic-feedback` pour vibrations

---

## 🔧 Bugs & Anomalies à corriger

### 13. **Liste des bugs identifiés**

1. **MatchScreen - Race conditions**:
   - Socket events reçus dans le mauvais ordre
   - État `phase` peut sauter des étapes
   - **Fix**: Refonte state machine avec Context

2. **CharacterPicker - Scroll lag**:
   - FlatList lag avec 100+ personnages
   - **Fix**: Virtualisation + pagination

3. **Timer countdown - Drift**:
   - Timer peut dériver (différence client/serveur)
   - **Fix**: Sync avec timestamp serveur

4. **Navigation back - Memory leak**:
   - Socket non déconnecté sur unmount
   - **Fix**: Cleanup dans useEffect return

5. **Keyboard - Input caché**:
   - Input question caché par keyboard
   - **Fix**: KeyboardAvoidingView

6. **AsyncStorage - Crash**:
   - Crash si quota dépassé
   - **Fix**: Error handling + cleanup vieux data

7. **ImageBackground - Performance**:
   - Images non optimisées (trop lourdes)
   - **Fix**: Resize + compression + cache

---

## 📱 Features UX à améliorer

### 14. **Onboarding progressif**

**Concept**: Tutoriel intégré dans le premier match

1. Premier duel solo:
   - Overlays avec instructions
   - "Pose ta première question ici 👇"
   - "Utilise le Sharingan pour éliminer 👁️"
   - "Devine le personnage ! 🎯"

2. Tooltips contextuels:
   - Apparaissent la première fois
   - Sauvegarder dans AsyncStorage: `tooltip_{name}_seen`

3. Coach virtuel (optionnel):
   - Personnage mascotte qui guide
   - Apparaît dans les moments clés

---

### 15. **Feedback & satisfaction**

**À implémenter**:

1. **Haptic feedback**:
   - Button press: Light impact
   - Success: Success notification
   - Error: Error notification
   - Level up: Heavy impact

2. **Sounds** (optionnel):
   - Click button: Soft click
   - Win: Victory fanfare
   - Lose: Sad trombone
   - Berry gain: Coin sound
   - Chakra refill: Energy charge

3. **Toasts & Snackbars**:
   - Messages de feedback temporaires
   - Utiliser `react-native-toast-message`

4. **Confirmation dialogs**:
   - Actions destructives (forfeit match)
   - Dépenses importantes (achats)

---

## 🚀 Roadmap de développement

### Phase 1 - Fondations (Semaine 1-2)
- [ ] Page Onboarding (2 pages)
- [ ] Refonte LoginScreen (background + Nanika branding)
- [ ] Page OTPScreen séparée
- [ ] Nouvelle palette couleurs Nanika
- [ ] Update WelcomeGiftModal (récompenses correctes)

### Phase 2 - Core UX (Semaine 3-4)
- [ ] Refonte MatchScreen (flow complet)
- [ ] Amélioration SocialScreen
- [ ] Amélioration MissionsScreen
- [ ] Page DailyMissionsScreen
- [ ] Animations & micro-interactions

### Phase 3 - Features secondaires (Semaine 5-6)
- [ ] ProfileScreen - Stats complètes
- [ ] NotificationsScreen
- [ ] Tutoriel intégré (onboarding progressif)
- [ ] Haptic feedback généralisé
- [ ] Sounds (optionnel)

### Phase 4 - Polish & Tests (Semaine 7-8)
- [ ] Correction bugs identifiés
- [ ] Tests utilisateurs (feedback)
- [ ] Optimisation performances
- [ ] Accessibilité (a11y)
- [ ] Documentation technique

---

## 🎯 Priorités

### 🔴 Critique (blocker release)
1. Onboarding (obligatoire pour nouveaux users)
2. LoginScreen refonte (branding Nanika)
3. MatchScreen refonte (UX cassée actuellement)
4. WelcomeGiftModal (données incorrectes)

### 🟠 Important (amélioration UX)
5. OTPScreen séparé
6. SocialScreen redesign
7. MissionsScreen redesign
8. DailyMissionsScreen
9. Nouvelle palette couleurs

### 🟡 Nice to have (polish)
10. Animations enrichies
11. ProfileScreen stats
12. NotificationsScreen
13. Sounds & haptics
14. Tutoriel progressif

---

## 📝 Notes techniques

### Outils recommandés

**Design & Prototypage**:
- Figma: Mockups et prototypes
- LottieFiles: Animations complexes
- ColorHunt: Inspiration palettes

**Développement**:
- `react-native-reanimated`: Animations performantes
- `react-native-gesture-handler`: Gestures fluides
- `react-native-svg`: Icônes customs
- `expo-linear-gradient`: Gradients
- `react-native-confetti-cannon`: Confettis
- `lottie-react-native`: Animations Lottie
- `react-native-toast-message`: Toasts

**Testing**:
- `@testing-library/react-native`: Tests composants
- `detox`: Tests E2E
- TestFlight (iOS) / Internal Testing (Android): Beta testing

### Commande `/ui-page`

**Utiliser pour**:
- LoginScreen background variants
- WelcomeGiftModal layouts
- MissionsScreen cards design
- SocialScreen layout
- MatchScreen phases design
- DailyMissionsScreen cards

**Process**:
1. Décrire le composant/page souhaité
2. Générer 2-3 variantes
3. Tester dans l'app
4. Itérer jusqu'à satisfaction
5. Implémenter la version finale

---

## 🤝 Propositions & Suggestions

### Proposition 1: Système d'achievements
- Débloquer badges pour actions spécifiques
- Ex: "100 victoires", "Streak 30 jours", "Sharingan master"
- Afficher dans ProfileScreen
- Récompenses: Berry, titres, avatars

### Proposition 2: Mode entraînement
- Jouer contre IA sans dépenser Chakra
- Personnages spécifiques pour pratiquer
- Accès limité (3/jour gratuit)

### Proposition 3: Replay système
- Enregistrer matchs PvP
- Revoir ses matchs passés
- Partager replays avec amis

### Proposition 4: Classement amis
- Leaderboard privé entre amis
- Comparer stats
- Rivalité saine

### Proposition 5: Customisation avatar
- Choisir avatar parmi personnages débloqués
- Cadres de profil à débloquer
- Titres honorifiques

---

## ✅ Checklist avant release

- [ ] Toutes les pages critiques implémentées
- [ ] Branding Nanika complet (logo, couleurs, textes)
- [ ] Flow PvP fonctionnel sans bugs
- [ ] Onboarding clair pour nouveaux users
- [ ] Tests sur iOS et Android
- [ ] Optimisation bundle size (<50MB)
- [ ] Temps de chargement <3s
- [ ] Crash rate <1%
- [ ] App store assets (screenshots, description)
- [ ] Privacy policy & Terms of service

---

**Dernière mise à jour**: 2026-07-01  
**Maintenu par**: Équipe Dev Nanika
