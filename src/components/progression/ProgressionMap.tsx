import { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { LevelNode } from './LevelNode';
import { CloudEffect } from './CloudEffect';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_SPACING = 110; // Plus d'espace pour que la ligne ne touche pas les chiffres
const PATH_AMPLITUDE = SCREEN_WIDTH * 0.30; // Courbes moins larges

interface ProgressionMapProps {
  currentLevel: number;
  maxLevel: number;
  onPlayLevel?: () => void;
}

export function ProgressionMap({ currentLevel, maxLevel, onPlayLevel }: ProgressionMapProps) {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const totalLevels = maxLevel;
  const totalHeight = totalLevels * NODE_SPACING + 250;

  useEffect(() => {
    const targetY = (totalLevels - currentLevel) * NODE_SPACING - 200;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
    }, 300);
  }, [currentLevel, totalLevels]);

  const getNodeX = (index: number) => {
    const centerX = SCREEN_WIDTH / 2;
    // Zigzag avec courbes plus douces pour éviter que la ligne touche les chiffres
    const offset = Math.sin(index * 1.0) * PATH_AMPLITUDE;
    return centerX + offset;
  };

  const getNodeY = (index: number) => {
    return totalHeight - 190 - index * NODE_SPACING;
  };

  const getStatus = (level: number) => {
    if (level < currentLevel) return 'completed' as const;
    if (level === currentLevel) return 'current' as const;
    return 'locked' as const;
  };

  const isMilestone = (level: number) => level % 5 === 0;
  const getMilestoneStars = (level: number) => Math.min(7, Math.ceil(level / 5));

  const buildPathD = () => {
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

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ height: totalHeight, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Background gradient effect */}
      <View style={[styles.bgGradientTop, { backgroundColor: isDark ? '#0a1628' : '#E3F2FD' }]} />
      <View style={[styles.bgGradientBottom, { backgroundColor: isDark ? '#1a0a28' : '#FFF3E0' }]} />

      {/* Clouds scattered */}
      <CloudEffect width={140} opacity={0.4} color={isDark ? '#1F3039' : '#BBDEFB'} />
      <View style={{ position: 'absolute', top: 80, right: 10 }}>
        <CloudEffect width={100} opacity={0.3} color={isDark ? '#2B4150' : '#B3E5FC'} />
      </View>
      <View style={{ position: 'absolute', top: NODE_SPACING * 3, left: 5 }}>
        <CloudEffect width={120} opacity={0.35} color={isDark ? '#1F3039' : '#C8E6C9'} />
      </View>
      <View style={{ position: 'absolute', top: NODE_SPACING * 6, right: 0 }}>
        <CloudEffect width={130} opacity={0.3} color={isDark ? '#2B4150' : '#FFECB3'} />
      </View>

      {/* Locked area clouds (Palier 1 and above - from level 16+) */}
      {currentLevel <= 15 && totalLevels > 15 && (
        <View
          style={[
            styles.lockedOverlay,
            {
              top: 0,
              height: getNodeY(15) + 40,
            },
          ]}
        >
          {/* Dense cloud coverage for paid tiers */}
          {Array.from({ length: Math.ceil((getNodeY(15) + 40) / 80) }, (_, i) => {
            const topPosition = i * 80;
            const isLeft = i % 2 === 0;
            const opacity = 0.35 + (i * 0.08);
            const width = 120 + i * 15;

            return (
              <View
                key={`locked-cloud-${i}`}
                style={{
                  position: 'absolute',
                  top: topPosition,
                  [isLeft ? 'left' : 'right']: 10,
                }}
              >
                <CloudEffect
                  width={Math.min(width, SCREEN_WIDTH - 20)}
                  opacity={Math.min(opacity, 0.7)}
                  color={isDark ? '#37515E' : '#E0E0E0'}
                />
              </View>
            );
          })}
        </View>
      )}

      {/* Path line */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={SCREEN_WIDTH}
        height={totalHeight}
      >
        <Path
          d={buildPathD()}
          stroke={colors.border}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        {/* Completed path overlay */}
        <Path
          d={buildPathD()}
          stroke={colors.primary}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${currentLevel * NODE_SPACING}`}
          strokeDashoffset={0}
          opacity={0.8}
        />
      </Svg>

      {/* Level nodes */}
      {Array.from({ length: totalLevels }, (_, i) => {
        const level = i + 1;
        const x = getNodeX(i);
        const y = getNodeY(i);

        return (
          <View
            key={level}
            style={[
              styles.nodePosition,
              { left: x - 28, top: y - 28 },
            ]}
          >
            <LevelNode
              level={level}
              status={getStatus(level)}
              isMilestone={isMilestone(level)}
              milestoneStars={getMilestoneStars(level)}
              onPress={getStatus(level) === 'current' ? onPlayLevel : undefined}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    opacity: 0.5,
  },
  bgGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    opacity: 0.3,
  },
  lockedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nodePosition: {
    position: 'absolute',
    width: 56,
    alignItems: 'center',
  },
});
