import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';

interface CloudEffectProps {
  width?: number;
  opacity?: number;
  color?: string;
}

export function CloudEffect({ width = 120, opacity = 0.6, color = '#FFFFFF' }: CloudEffectProps) {
  const height = width * 0.4;

  return (
    <View style={[styles.container, { width, height, opacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <RadialGradient id="cloud" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="70%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width * 0.3} cy={height * 0.6} rx={width * 0.25} ry={height * 0.4} fill="url(#cloud)" />
        <Ellipse cx={width * 0.55} cy={height * 0.45} rx={width * 0.3} ry={height * 0.45} fill="url(#cloud)" />
        <Ellipse cx={width * 0.75} cy={height * 0.6} rx={width * 0.22} ry={height * 0.35} fill="url(#cloud)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute' },
});
