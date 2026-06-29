import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

interface EnergyBarProps {
  current: number;
  max: number;
  coins?: number;
  gems?: number;
}

export function EnergyBar({ current, max, coins, gems }: EnergyBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Energy */}
      <View style={[styles.item, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <MaterialIcons name="favorite" size={18} color="#FF6B6B" />
        <Text style={[styles.value, { color: colors.text, fontFamily: fonts.bodyBold }]}>
          {current}/{max}
        </Text>
      </View>

      {/* Coins */}
      {coins !== undefined && (
        <View style={[styles.item, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <MaterialIcons name="toll" size={18} color="#FFD93D" />
          <Text style={[styles.value, { color: colors.text, fontFamily: fonts.bodyBold }]}>
            {coins}
          </Text>
        </View>
      )}

      {/* Gems */}
      {gems !== undefined && (
        <View style={[styles.item, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <MaterialIcons name="diamond" size={18} color="#6BCFFF" />
          <Text style={[styles.value, { color: colors.text, fontFamily: fonts.bodyBold }]}>
            {gems}
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
