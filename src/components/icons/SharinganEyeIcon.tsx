import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface SharinganEyeIconProps {
  size?: number;
  color?: string;
}

export function SharinganEyeIcon({ size = 24, color }: SharinganEyeIconProps) {
  const { colors } = useTheme();
  const eyeColor = color || colors.error;
  const scale = size / 120;

  return (
    <View style={[styles.container, { width: size, height: size, transform: [{ scale }] }]}>
      {/* Outer red circle */}
      <View style={[styles.eyeOuter, { borderColor: eyeColor }]} />

      {/* Inner circle with pupil */}
      <View style={[styles.eyeInner, { backgroundColor: eyeColor }]}>
        {/* Pupil */}
        <View style={styles.pupil} />

        {/* Tomoe (comma shapes) */}
        <View style={[styles.tomoe, styles.tomoe1]} />
        <View style={[styles.tomoe, styles.tomoe2]} />
        <View style={[styles.tomoe, styles.tomoe3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  eyeInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000',
  },
  tomoe: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 50,
    backgroundColor: '#000',
  },
  tomoe1: {
    top: 10,
    left: 12,
  },
  tomoe2: {
    bottom: 12,
    right: 10,
  },
  tomoe3: {
    bottom: 10,
    left: 8,
  },
});
