import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';

interface ShenronHeadProps {
  size?: number;
}

export function ShenronHead({ size = 60 }: ShenronHeadProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 60 60">
        <Defs>
          <RadialGradient id="headGrad" cx="40%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#66BB6A" />
            <Stop offset="100%" stopColor="#1B5E20" />
          </RadialGradient>
        </Defs>
        {/* Head shape */}
        <Ellipse cx="30" cy="28" rx="22" ry="20" fill="url(#headGrad)" />
        {/* Snout */}
        <Ellipse cx="30" cy="38" rx="14" ry="10" fill="#2E7D32" />
        {/* Eyes */}
        <Circle cx="22" cy="22" r="5" fill="#FF5722" />
        <Circle cx="38" cy="22" r="5" fill="#FF5722" />
        <Circle cx="22" cy="22" r="2.5" fill="#000" />
        <Circle cx="38" cy="22" r="2.5" fill="#000" />
        {/* Nostrils */}
        <Circle cx="26" cy="38" r="2" fill="#1B5E20" />
        <Circle cx="34" cy="38" r="2" fill="#1B5E20" />
        {/* Horns */}
        <Path d="M 18 12 L 12 2 L 20 10 Z" fill="#FFF176" />
        <Path d="M 42 12 L 48 2 L 40 10 Z" fill="#FFF176" />
        {/* Whiskers */}
        <Path d="M 10 30 Q 2 26 0 20" stroke="#2E7D32" strokeWidth="2" fill="none" />
        <Path d="M 50 30 Q 58 26 60 20" stroke="#2E7D32" strokeWidth="2" fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
