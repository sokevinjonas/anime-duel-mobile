import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ChakraIconProps {
  size?: number;
  color?: string;
}

export function ChakraIcon({ size = 24, color = '#3B82F6' }: ChakraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="chakraGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Lightning bolt - main shape */}
      <Path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill="url(#chakraGradient)"
        stroke="#1E40AF"
        strokeWidth="0.5"
      />

      {/* Energy glow effect - inner highlight */}
      <Path
        d="M13 3L5 13h6l-1 6 8-10h-6l1-6z"
        fill="#93C5FD"
        opacity="0.6"
      />

      {/* Small spark details */}
      <Path d="M11 7L10 9L12 8L11 7Z" fill="#DBEAFE" opacity="0.8" />
      <Path d="M15 15L14 17L16 16L15 15Z" fill="#DBEAFE" opacity="0.8" />
    </Svg>
  );
}
