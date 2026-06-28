import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';
import { PalierTheme } from '../../theme/palierThemes';

interface PalierAvatarProps {
  theme: PalierTheme;
  size?: number;
  showName?: boolean;
}

export function PalierAvatar({ theme, size = 120, showName = true }: PalierAvatarProps) {
  const { colors, isDark } = useTheme();
  const themeColors = isDark ? theme.colors.dark : theme.colors.light;

  return (
    <View style={[styles.container, { width: size + 40 }]}>
      {/* Glow effect background */}
      <View
        style={[
          styles.glow,
          {
            width: size + 30,
            height: size + 30,
            backgroundColor: themeColors.primary,
            opacity: 0.2,
          },
        ]}
      />

      {/* Avatar circle with gradient border */}
      <LinearGradient
        colors={[themeColors.primary, themeColors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.avatarBorder,
          {
            width: size + 10,
            height: size + 10,
          },
        ]}
      >
        <View
          style={[
            styles.avatarInner,
            {
              width: size,
              height: size,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Image
            source={theme.avatar.imagePath}
            style={[styles.avatarImage, { width: size, height: size }]}
            resizeMode="cover"
          />
        </View>
      </LinearGradient>

      {/* Character name badge */}
      {showName && (
        <View
          style={[
            styles.nameBadge,
            {
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.8)'
                : 'rgba(255, 255, 255, 0.95)',
              borderColor: themeColors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.palierLabel,
              {
                color: themeColors.primary,
                fontFamily: fonts.bodyBold,
              },
            ]}
          >
            {theme.name}
          </Text>
          <Text
            style={[
              styles.characterName,
              {
                color: colors.textSecondary,
                fontFamily: fonts.body,
              },
            ]}
          >
            {theme.avatar.character}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  avatarBorder: {
    borderRadius: 9999,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    borderRadius: 9999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    borderRadius: 9999,
  },
  nameBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  palierLabel: {
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  characterName: {
    fontSize: 11,
    marginTop: 2,
  },
});
