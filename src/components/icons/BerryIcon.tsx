import Svg, { Circle, Path, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

interface BerryIconProps {
  size?: number;
  color?: string;
}

export function BerryIcon({ size = 24, color = '#A855F7' }: BerryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="berryBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#C084FC" />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
        <LinearGradient id="berryLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4ADE80" />
          <Stop offset="100%" stopColor="#22C55E" />
        </LinearGradient>
      </Defs>

      {/* Shadow (3D depth) */}
      <Ellipse cx="12" cy="21" rx="5" ry="1.5" fill="#000" opacity="0.15" />

      {/* Berry body */}
      <Circle cx="12" cy="13" r="7.5" fill="url(#berryBody)" />

      {/* 3D highlight */}
      <Ellipse cx="10" cy="10" rx="3" ry="2.5" fill="#E9D5FF" opacity="0.4" />

      {/* Leaf */}
      <Path
        d="M12 5.5C12 5.5 10 3.5 8 3.5C6 3.5 5 4.5 5 6.5C5 8.5 7 10 8 10C9 10 10 9 11 8L12 5.5Z"
        fill="url(#berryLeaf)"
      />

      {/* Berry seed dots */}
      <Circle cx="9.5" cy="12" r="0.8" fill="#7C3AED" opacity="0.6" />
      <Circle cx="14" cy="12.5" r="0.8" fill="#7C3AED" opacity="0.6" />
      <Circle cx="11.5" cy="15" r="0.8" fill="#7C3AED" opacity="0.6" />
      <Circle cx="10" cy="14.5" r="0.7" fill="#7C3AED" opacity="0.5" />
      <Circle cx="13.5" cy="14.8" r="0.7" fill="#7C3AED" opacity="0.5" />
    </Svg>
  );
}
