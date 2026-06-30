import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';
import { ChakraIcon, BerryIcon } from '../icons';

interface EnergyBarProps {
  current: number;
  max: number;
  berry?: number;
  onEnergyPress?: () => void;
}

export function EnergyBar({ current, max, berry, onEnergyPress }: EnergyBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Chakra */}
      <TouchableOpacity
        style={[styles.item, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        onPress={onEnergyPress}
        activeOpacity={0.7}
      >
        <ChakraIcon size={18} color={colors.primary} />
        <Text style={[styles.value, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          {current}/{max}
        </Text>
      </TouchableOpacity>

      {/* Berry */}
      {berry !== undefined && (
        <View style={[styles.item, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <BerryIcon size={18} color={colors.warning} />
          <Text style={[styles.value, { color: colors.text, fontFamily: fonts.bodyBold }]}>
            {berry}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  value: {
    fontSize: 14,
  },
});
