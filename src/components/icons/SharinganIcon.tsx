import Svg, { Circle, Path, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

interface SharinganIconProps {
  size?: number;
  color?: string;
}

export function SharinganIcon({ size = 24, color = '#EF4444' }: SharinganIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <RadialGradient id="sharinganGrad" cx="50%" cy="40%" r="50%">
          <Stop offset="0%" stopColor="#FCA5A5" />
          <Stop offset="60%" stopColor={color} />
          <Stop offset="100%" stopColor="#991B1B" />
        </RadialGradient>
      </Defs>

      {/* Shadow */}
      <Ellipse cx="12" cy="22.5" rx="5" ry="1.2" fill="#000" opacity="0.12" />

      {/* Outer ring glow */}
      <Circle cx="12" cy="12" r="11" fill="#FCA5A5" opacity="0.15" />

      {/* Main eye */}
      <Circle cx="12" cy="12" r="9.5" fill="url(#sharinganGrad)" />

      {/* Black outer ring */}
      <Circle cx="12" cy="12" r="9.5" fill="none" stroke="#1A0505" strokeWidth="0.8" />

      {/* Tomoe (3 comma shapes) */}
      <Path
        d="M12 5C10.5 6.5 10.5 8 11.5 9C12 9.5 12.5 9.3 12.8 8.8C13.2 8 13 6.5 12 5Z"
        fill="#1A0505"
      />
      <Path
        d="M17.5 11C16 12.3 15 12.5 14.5 12C14 11.5 14.2 10.5 15 9.5C15.8 8.5 17 8.8 17.5 11Z"
        fill="#1A0505"
      />
      <Path
        d="M8.5 15.5C9.5 14 10 13.2 10.5 13.5C11 14 10.5 15 9.5 16C8.5 17 7.5 16.5 8.5 15.5Z"
        fill="#1A0505"
      />

      {/* Center pupil */}
      <Circle cx="12" cy="12" r="2.8" fill="#1A0505" />
      <Circle cx="12" cy="12" r="1.2" fill="#7F1D1D" />

      {/* 3D highlight */}
      <Ellipse cx="10" cy="9.5" rx="2.5" ry="2" fill="#FCA5A5" opacity="0.25" />
    </Svg>
  );
}
