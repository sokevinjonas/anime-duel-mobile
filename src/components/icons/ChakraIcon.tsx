import Svg, { Path, Defs, LinearGradient, Stop, Circle, Ellipse } from 'react-native-svg';

interface ChakraIconProps {
  size?: number;
  color?: string;
}

export function ChakraIcon({ size = 24, color = '#38BDF8' }: ChakraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="chakraGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#7DD3FC" />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
        <LinearGradient id="chakraGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Glow behind */}
      <Circle cx="12" cy="12" r="10" fill="url(#chakraGlow)" opacity="0.3" />

      {/* Shadow */}
      <Ellipse cx="12" cy="22" rx="4" ry="1" fill="#000" opacity="0.12" />

      {/* Lightning bolt */}
      <Path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill="url(#chakraGrad)"
      />

      {/* 3D highlight on bolt */}
      <Path
        d="M12.5 3L5.5 12.5h5.5l-0.5 4.5 6-8h-5l0.5-6z"
        fill="#BAE6FD"
        opacity="0.45"
      />

      {/* Sparks */}
      <Circle cx="6" cy="8" r="0.8" fill="#7DD3FC" opacity="0.7" />
      <Circle cx="18" cy="16" r="0.6" fill="#7DD3FC" opacity="0.6" />
    </Svg>
  );
}
