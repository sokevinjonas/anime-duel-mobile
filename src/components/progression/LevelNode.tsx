import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';
import { DragonBall } from './DragonBall';

type NodeStatus = 'completed' | 'current' | 'locked';

interface LevelNodeProps {
  level: number;
  status: NodeStatus;
  isMilestone?: boolean;
  milestoneStars?: number;
  onPress?: () => void;
}

export function LevelNode({ level, status, isMilestone = false, milestoneStars = 1, onPress }: LevelNodeProps) {
  const { colors } = useTheme();

  const nodeSize = isMilestone ? 56 : 44;
  const bgColor =
    status === 'completed' ? colors.primary :
    status === 'current' ? colors.orange :
    colors.border;
  const borderColor =
    status === 'completed' ? colors.primaryDark :
    status === 'current' ? colors.orangeDark :
    colors.borderDark;

  const isClickable = status === 'current';

  const handlePress = () => {
    if (!isClickable || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  const content = (
    <>
      {isMilestone && status !== 'locked' ? (
        <DragonBall stars={milestoneStars} size={nodeSize} />
      ) : (
        <View
          style={[
            styles.node,
            {
              width: nodeSize,
              height: nodeSize,
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderBottomWidth: status === 'locked' ? 3 : 4,
            },
          ]}
        >
          {status === 'completed' && (
            <MaterialIcons name="check" size={24} color="#FFF" />
          )}
          {status === 'current' && (
            <MaterialIcons name="play-arrow" size={20} color="#FFF" />
          )}
          {status === 'locked' && (
            <MaterialIcons name="lock" size={20} color={colors.textMuted} />
          )}
        </View>
      )}
      <Text
        style={[
          styles.levelText,
          {
            color: status === 'locked' ? colors.textMuted : colors.text,
            fontFamily: fonts.bodyBold,
          },
        ]}
      >
        {level}
      </Text>
    </>
  );

  if (isClickable) {
    return (
      <TouchableOpacity style={styles.nodeWrapper} onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.nodeWrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  nodeWrapper: { alignItems: 'center', gap: 4 },
  node: {
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: { fontSize: 16, fontWeight: '700' },
});
