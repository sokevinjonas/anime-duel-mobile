import { View, StyleSheet } from 'react-native';
import Svg, { Circle, RadialGradient, Stop, Defs } from 'react-native-svg';

interface DragonBallProps {
  stars: number;
  size?: number;
}

export function DragonBall({ stars, size = 40 }: DragonBallProps) {
  const starPositions = getStarPositions(stars, size);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFEB3B" />
            <Stop offset="50%" stopColor="#FF9800" />
            <Stop offset="100%" stopColor="#E65100" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="url(#ballGrad)" />
        <Circle cx={size * 0.35} cy={size * 0.35} r={size * 0.12} fill="rgba(255,255,255,0.4)" />
        {starPositions.map((pos, i) => (
          <Circle key={i} cx={pos.x} cy={pos.y} r={size * 0.06} fill="#D32F2F" />
        ))}
      </Svg>
    </View>
  );
}

function getStarPositions(count: number, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.18;
  const positions: { x: number; y: number }[] = [];

  if (count === 1) {
    positions.push({ x: cx, y: cy });
  } else {
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      positions.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }
  }
  return positions;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
