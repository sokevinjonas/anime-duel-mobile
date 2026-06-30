import Svg, { Path, Circle } from 'react-native-svg';

interface BerryIconProps {
  size?: number;
  color?: string;
}

export function BerryIcon({ size = 24, color = '#6B46C1' }: BerryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Berry body - gradient purple */}
      <Circle cx="12" cy="14" r="7" fill={color} opacity="0.9" />
      <Circle cx="12" cy="14" r="7" fill="url(#berryGradient)" />

      {/* Leaf */}
      <Path
        d="M12 7C12 7 10 5 8 5C6 5 5 6 5 8C5 10 7 12 8 12C9 12 10 11 11 10L12 7Z"
        fill="#10B981"
      />

      {/* Berry dots pattern */}
      <Circle cx="10" cy="13" r="1" fill="#8B5CF6" />
      <Circle cx="14" cy="13" r="1" fill="#8B5CF6" />
      <Circle cx="12" cy="16" r="1" fill="#8B5CF6" />
      <Circle cx="10" cy="15" r="0.8" fill="#8B5CF6" />
      <Circle cx="14" cy="15" r="0.8" fill="#8B5CF6" />
    </Svg>
  );
}
