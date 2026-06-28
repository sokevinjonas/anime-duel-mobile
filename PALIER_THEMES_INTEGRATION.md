# Intégration des Thèmes de Paliers

## 📁 Structure créée

```
src/
  theme/
    palierThemes.ts          # Configuration des 6 paliers
  components/
    progression/
      PalierAvatar.tsx       # Avatar de personnage avec gradient border
      ThemedBackground.tsx   # Background image avec overlay
      
assets/
  paliers/                   # Avatars de personnages (PNG 200x200px)
    palier-0-gon.png
    palier-1-goku.png
    palier-2-luffy.png
    palier-3-zenitsu.png
    palier-4-tanjiro.png
    palier-5-todoroki.png
    
  backgrounds/               # Images de fond (JPG 1080x1920px)
    palier-0-nature.jpg
    palier-1-fire.jpg
    palier-2-ocean.jpg
    palier-3-lightning.jpg
    palier-4-forest.jpg
    palier-5-ice.jpg
```

## 🎨 Paliers définis

| Palier | Niveaux | Thème | Personnage | Couleurs |
|--------|---------|-------|------------|----------|
| 0 | 1-15 | Débutant | Gon Freecss | Vert nature |
| 1 | 16-40 | Guerrier du Feu | Son Goku | Rouge/Orange |
| 2 | 41-65 | Pirate des Mers | Monkey D. Luffy | Bleu océan |
| 3 | 66-90 | Maître de la Foudre | Zenitsu | Violet/Jaune |
| 4 | 91-115 | Gardien de la Forêt | Tanjiro | Vert forêt |
| 5 | 116-140 | Seigneur de Glace | Todoroki | Cyan/Blanc |

## 🔧 Prochaines étapes

### 1. Intégrer dans ProgressionMap.tsx

```typescript
import { PALIER_THEMES, getPalierTheme } from '../../theme/palierThemes';
import { PalierAvatar } from './PalierAvatar';
import { ThemedBackground } from './ThemedBackground';

// Dans le composant
const currentTheme = getPalierTheme(currentLevel);

// Rendre les backgrounds par palier
{PALIER_THEMES.map((theme) => {
  const startY = getNodeY(theme.endLevel);
  const endY = getNodeY(theme.startLevel);
  const height = endY - startY + 200;
  
  return (
    <ThemedBackground
      key={theme.palier}
      theme={theme}
      startY={startY}
      height={height}
    />
  );
})}

// Rendre l'avatar au début de chaque palier
{PALIER_THEMES.map((theme) => {
  if (theme.palier === 0) return null; // Pas d'avatar pour Palier 0
  
  const avatarY = getNodeY(theme.startLevel - 1);
  const avatarX = SCREEN_WIDTH / 2;
  
  return (
    <View
      key={`avatar-${theme.palier}`}
      style={{
        position: 'absolute',
        top: avatarY - 60,
        left: avatarX - 80,
      }}
    >
      <PalierAvatar theme={theme} size={140} />
    </View>
  );
})}
```

### 2. Adapter les couleurs du path selon le palier

```typescript
// Pour chaque segment du path
const segmentTheme = getPalierTheme(level);
const themeColors = isDark ? segmentTheme.colors.dark : segmentTheme.colors.light;

<Path
  stroke={level <= currentLevel ? themeColors.pathCompleted : themeColors.pathBase}
  strokeWidth={6}
/>
```

### 3. Installer les dépendances manquantes

```bash
npx expo install expo-linear-gradient
```

### 4. Ajouter les images

**Option A : Placeholders temporaires**
- Utiliser des images Unsplash avec des couleurs correspondantes
- Générer des avatars avec Midjourney/DALL-E

**Option B : Images finales**
- Trouver des images libres de droits
- Optimiser avec ImageOptim/TinyPNG
- Redimensionner aux bonnes dimensions

## 🎯 Résultat attendu

- ✅ Chaque palier a son background unique
- ✅ Avatar de personnage anime au début de chaque palier
- ✅ Transition fluide entre les thèmes
- ✅ Couleurs du path qui changent selon le palier
- ✅ Nuages thématisés selon les couleurs du palier
- ✅ Support light/dark mode pour chaque thème

## ⚠️ Notes importantes

1. **Performance** : Les images de background doivent être optimisées (< 500KB)
2. **Mémoire** : Utiliser `resizeMode="cover"` pour éviter les problèmes
3. **Transitions** : Ajouter des LinearGradient entre paliers pour smooth transition
4. **Scroll** : Le background change selon la position du scroll (détection de zone visible)

## 🚀 Commandes utiles

```bash
# Vérifier la taille des images
du -h assets/paliers/* assets/backgrounds/*

# Optimiser les images (si ImageMagick installé)
for file in assets/backgrounds/*.jpg; do
  convert "$file" -resize 1080x1920^ -quality 85 "$file"
done

# Tester le build
npx expo start --clear
```
