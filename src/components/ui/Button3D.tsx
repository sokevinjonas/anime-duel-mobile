import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { fonts } from '../../theme/fonts';

interface Button3DProps {
  title: string;
  onPress: () => void;
  color?: string;
  darkColor?: string;
  textColor?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export function Button3D({
  title,
  onPress,
  color = '#58CC02',
  darkColor = '#46A302',
  textColor = '#FFFFFF',
  style,
  size = 'medium',
  disabled = false,
}: Button3DProps) {
  const heights = { small: 42, medium: 50, large: 56 };
  const fontSizes = { small: 14, medium: 16, large: 18 };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: color,
          borderBottomColor: darkColor,
          minHeight: heights[size],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: fontSizes[size],
            fontFamily: fonts.bodyBold,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
