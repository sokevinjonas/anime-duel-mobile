import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface SharinganIconProps {
  size?: number;
  color?: string;
}

export function SharinganIcon({ size = 24, color = '#EF4444' }: SharinganIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <RadialGradient id="sharinganGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#991B1B" stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Outer circle - red */}
      <Circle cx="12" cy="12" r="10" fill="url(#sharinganGradient)" />

      {/* Black ring */}
      <Circle cx="12" cy="12" r="8.5" fill="none" stroke="#000" strokeWidth="0.8" />

      {/* Tomoe (3 comma shapes) */}
      <Path
        d="M12 6 C10 7, 10 8, 11 9 C11.5 9.5, 12 9.5, 12.5 9 C13 8.5, 13 7.5, 12 6Z"
        fill="#000"
      />
      <Path
        d="M16.5 10.5 C15.5 12, 14.5 12.5, 14 12 C13.5 11.5, 13.5 10.5, 14.5 9.5 C15.5 8.5, 16.5 9, 16.5 10.5Z"
        fill="#000"
      />
      <Path
        d="M16.5 13.5 C15.5 12, 14.5 11.5, 14 12 C13.5 12.5, 13.5 13.5, 14.5 14.5 C15.5 15.5, 16.5 15, 16.5 13.5Z"
        fill="#000"
      />

      {/* Center pupil */}
      <Circle cx="12" cy="12" r="2.5" fill="#000" />
      <Circle cx="12" cy="12" r="1" fill="#991B1B" />
    </Svg>
  );
}
