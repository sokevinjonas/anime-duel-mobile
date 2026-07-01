import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

interface ButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'cta' | 'secondary' | 'ghost';
  color?: string;
  style?: ViewStyle;
  haptic?: boolean;
}

export function Button({
  title,
  subtitle,
  onPress,
  variant = 'primary',
  color,
  style,
  haptic = true,
}: ButtonProps) {
  const { colors } = useTheme();

  const bgColors = {
    primary: colors.primary,
    cta: colors.primary,
    secondary: colors.surface,
    ghost: 'transparent',
  };

  const textColors = {
    primary: '#fff',
    cta: '#fff',
    secondary: colors.text,
    ghost: colors.primary,
  };

  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: color || bgColors[variant],
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[styles.title, { color: textColors[variant], fontFamily: fonts.bodyBold }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: textColors[variant] + 'AA', fontFamily: fonts.body }]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: { fontSize: 16 },
  subtitle: { fontSize: 13, marginTop: 2 },
});
