import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

const TAB_CONFIG: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; label: string }> = {
  Home: { icon: 'home', label: 'Accueil' },
  Solo: { icon: 'sports-esports', label: 'Solo' },
  Leaderboard: { icon: 'leaderboard', label: 'Classement' },
  Profile: { icon: 'person', label: 'Profil' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: isDark ? 'rgba(31, 48, 57, 0.97)' : 'rgba(255, 255, 255, 0.97)',
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tabInfo = TAB_CONFIG[route.name];
          if (!tabInfo) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabItem,
                isFocused && { backgroundColor: colors.primary + '15' },
                pressed && styles.tabItemPressed,
              ]}
            >
              <MaterialIcons
                name={tabInfo.icon}
                size={24}
                color={isFocused ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.primary : colors.textMuted,
                    fontFamily: isFocused ? fonts.bodyBold : fonts.body,
                  },
                ]}
              >
                {tabInfo.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  inner: {
    flexDirection: 'row',
    height: 56,
    paddingTop: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 6,
    gap: 3,
  },
  tabItemPressed: {
    transform: [{ scale: 0.92 }],
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
