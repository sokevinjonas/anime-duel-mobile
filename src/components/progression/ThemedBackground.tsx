import { ImageBackground, View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { PalierTheme } from '../../theme/palierThemes';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ThemedBackgroundProps {
  theme: PalierTheme;
  startY: number;
  height: number;
}

export function ThemedBackground({ theme, startY, height }: ThemedBackgroundProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? theme.colors.dark : theme.colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          top: startY,
          height: height,
        },
      ]}
    >
      {/* Background image */}
      <ImageBackground
        source={theme.background.imagePath}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient overlay for readability */}
        <LinearGradient
          colors={[
            `${theme.background.overlayColor}${Math.round(theme.background.overlayOpacity * 255).toString(16).padStart(2, '0')}`,
            `${theme.background.overlayColor}${Math.round((theme.background.overlayOpacity - 0.2) * 255).toString(16).padStart(2, '0')}`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.overlay}
        />

        {/* Additional dark overlay for dark mode */}
        {isDark && (
          <View
            style={[
              styles.darkOverlay,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            ]}
          />
        )}
      </ImageBackground>

      {/* Top fade transition */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'transparent']}
        style={styles.topFade}
        pointerEvents="none"
      />

      {/* Bottom fade transition */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0)']}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
});
