# Résumé des modifications - Palette Nanika Violet Mystique

## ✅ Déjà fait

### 1. Nouvelle palette `colors.ts`
- **Light**: primary violet `#7C5CE7`, secondary turquoise `#00C9B7`, accent rose `#FF6B9D`
- **Dark**: primary lavande `#9B7FE8`, secondary cyan néon `#00E5CC`
- Ajout de `colors.google` / `colors.googleDark` pour OAuth
- Support complet dark/light mode

### 2. `ThemeContext.tsx`
- Toggle dark/light avec `mode`, `setMode()`, `toggleTheme()`
- Persisté dans AsyncStorage
- Support 'light' | 'dark' | 'system'

### 3. `Button3D.tsx`
- Vrai effet 3D Duolingo avec animation press-in
- Ombre bottom qui se révèle
- Spring bounce-back
- Couleurs du thème par défaut

### 4. Icônes SVG
- **BerryIcon**, **ChakraIcon**, **SharinganIcon** : dégradés, highlights 3D, ombres au sol

### 5. LoginScreen
- ✅ Supprimé bouton Discord
- ✅ Utilise `colors.google` pour le bouton Google
- ✅ Refait en LinearGradient (sans ImageBackground sombre)
- ✅ Design propre, lisible en light & dark

### 6. OTPScreen
- ✅ Refait complètement avec design moderne
- ✅ Icon circle animé
- ✅ 6 inputs OTP avec borders dynamiques
- ✅ LinearGradient background
- ✅ Lisible en light & dark

---

## 🔧 À faire (OnboardingScreen)

### Problème actuel
- Mockup interactif trop complexe (GameplayMockup component)
- Pas responsive (utilise `Dimensions.get('window')` statique au lieu de `useWindowDimensions()`)
- Page 2 avec mockup JSX au lieu d'une image

### Solution proposée
1. **Générer l'image mockup** avec Gemini (voir `GEMINI_PROMPT_ONBOARDING_MOCKUP.md`)
2. **Supprimer** le composant `GameplayMockup`
3. **Utiliser** `useWindowDimensions()` pour responsive
4. **Afficher l'image** générée à la place du mockup JSX

### Étapes
```bash
# 1. Générer l'image avec Gemini
# Utiliser le prompt dans GEMINI_PROMPT_ONBOARDING_MOCKUP.md
# Sauvegarder en: assets/onboarding/onboarding-2-gameplay.png

# 2. Modifier OnboardingScreen.tsx
# - Importer useWindowDimensions
# - Remplacer SCREEN_WIDTH/HEIGHT par des hooks
# - Supprimer GameplayMockup component
# - Ajouter l'image dans PAGES[1].backgroundImage ou comme <Image> dans la page 2
```

---

## 🐛 Problème backend

### Erreur `sendLoginCode`
```
Cannot read properties of undefined (reading 'ip')
at ThrottlerGuard.getTracker
```

**Cause**: Le ThrottlerGuard NestJS ne peut pas lire `context.ip` dans un resolver GraphQL.

**Solution** (voir `BACKEND_FIX_SENDLOGINCODE.md`):
1. Créer un `GraphqlThrottlerGuard` custom
2. OU configurer le context GraphQL: `context: ({ req, res }) => ({ req, res })`
3. OU désactiver temporairement le throttle avec `@SkipThrottle()`

---

## 📝 Fichiers créés

- `BACKEND_FIX_SENDLOGINCODE.md` : Documentation fix backend
- `GEMINI_PROMPT_ONBOARDING_MOCKUP.md` : Prompt pour générer l'image
- `SUMMARY_CHANGES.md` : Ce fichier

---

## 🎨 Prochaines étapes recommandées

1. **Toggle theme dans ProfileScreen**
   - Ajouter un switch pour basculer light/dark/system
   - Utiliser `colors, mode, setMode` du ThemeContext

2. **Tester visuellement**
   ```bash
   npx expo start
   # Tester les 2 modes (light/dark)
   # Vérifier LoginScreen, OTPScreen, OnboardingScreen
   ```

3. **Générer l'image mockup**
   - Utiliser Gemini avec le prompt fourni
   - Ou utiliser Figma/Canva si Gemini échoue

4. **Finir OnboardingScreen**
   - Intégrer l'image générée
   - Rendre responsive avec `useWindowDimensions()`
   - Tester sur tablette/différentes tailles

5. **Fix backend**
   - Appliquer une des 3 solutions du BACKEND_FIX_SENDLOGINCODE.md
   - Tester `sendLoginCode` mutation

---

## Commandes utiles

```bash
# Compiler TypeScript
npx tsc --noEmit --skipLibCheck

# Lancer l'app
npx expo start

# Clear cache si problèmes
npx expo start --clear

# Tester sur device physique
npx expo start --tunnel
```
