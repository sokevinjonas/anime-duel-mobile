import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ShenronPathProps {
  totalLevels: number;
  currentLevel: number;
  nodeSpacing: number;
  totalHeight: number;
  getNodeX: (index: number) => number;
  getNodeY: (index: number) => number;
}

export function ShenronPath({
  totalLevels,
  currentLevel,
  nodeSpacing,
  totalHeight,
  getNodeX,
  getNodeY,
}: ShenronPathProps) {
  const buildBodyPath = () => {
    let d = '';
    for (let i = 0; i < totalLevels; i++) {
      const x = getNodeX(i);
      const y = getNodeY(i);
      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        const prevX = getNodeX(i - 1);
        const prevY = getNodeY(i - 1);
        const cpX = (prevX + x) / 2;
        d += ` Q ${cpX} ${(prevY + y) / 2} ${x} ${y}`;
      }
    }
    return d;
  };

  const bodyPath = buildBodyPath();

  return (
    <Svg
      width={SCREEN_WIDTH}
      height={totalHeight}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Defs>
        <LinearGradient id="shenronBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#1B5E20" />
          <Stop offset="50%" stopColor="#2E7D32" />
          <Stop offset="100%" stopColor="#388E3C" />
        </LinearGradient>
        <LinearGradient id="shenronBodyLight" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#43A047" />
          <Stop offset="50%" stopColor="#66BB6A" />
          <Stop offset="100%" stopColor="#43A047" />
        </LinearGradient>
        <LinearGradient id="shenronBelly" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#FFF176" />
          <Stop offset="50%" stopColor="#FFEE58" />
          <Stop offset="100%" stopColor="#FFF176" />
        </LinearGradient>
      </Defs>

      {/* Corps principal - ombre */}
      <Path
        d={bodyPath}
        stroke="#1B5E20"
        strokeWidth={32}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.4}
      />

      {/* Corps principal - base */}
      <Path
        d={bodyPath}
        stroke="url(#shenronBody)"
        strokeWidth={28}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Corps - reflet clair */}
      <Path
        d={bodyPath}
        stroke="url(#shenronBodyLight)"
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />

      {/* Ventre jaune (ligne centrale) */}
      <Path
        d={bodyPath}
        stroke="url(#shenronBelly)"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />

      {/* Ecailles - petits cercles le long du corps */}
      {Array.from({ length: Math.floor(totalLevels * 2) }, (_, i) => {
        const t = i / (totalLevels * 2);
        const idx = t * (totalLevels - 1);
        const floorIdx = Math.floor(idx);
        const ceilIdx = Math.min(floorIdx + 1, totalLevels - 1);
        const frac = idx - floorIdx;
        const x = getNodeX(floorIdx) * (1 - frac) + getNodeX(ceilIdx) * frac;
        const y = getNodeY(floorIdx) * (1 - frac) + getNodeY(ceilIdx) * frac;
        return (
          <Circle
            key={i}
            cx={x + (i % 2 === 0 ? 10 : -10)}
            cy={y}
            r={3}
            fill="#1B5E20"
            opacity={0.3}
          />
        );
      })}
    </Svg>
  );
}
