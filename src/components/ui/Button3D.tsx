import { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
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
  color,
  darkColor,
  textColor = '#FFFFFF',
  style,
  size = 'medium',
  disabled = false,
}: Button3DProps) {
  const { colors } = useTheme();
  const resolvedColor = color || colors.primary;
  const resolvedDarkColor = darkColor || colors.primaryDark;
  const translateY = useRef(new Animated.Value(0)).current;

  const heights = { small: 42, medium: 50, large: 58 };
  const fontSizes = { small: 14, medium: 16, large: 18 };
  const shadowHeight = { small: 3, medium: 4, large: 5 };

  const handlePressIn = () => {
    Animated.timing(translateY, {
      toValue: shadowHeight[size],
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const bottomShadow = translateY.interpolate({
    inputRange: [0, shadowHeight[size]],
    outputRange: [shadowHeight[size], 0],
  });

  return (
    <Animated.View
      style={[
        styles.shadowBase,
        {
          backgroundColor: resolvedDarkColor,
          borderRadius: 16,
          minHeight: heights[size],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          transform: [{ translateY }],
          marginBottom: bottomShadow,
        }}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: resolvedColor,
              minHeight: heights[size] - shadowHeight[size],
            },
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
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
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowBase: {
    overflow: 'hidden',
  },
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
