import { Modal, View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { SharinganEyeIcon } from './icons/SharinganEyeIcon';

interface StartAnimationModalProps {
  visible: boolean;
  starterName?: string;
}

export function StartAnimationModal({ visible, starterName }: StartAnimationModalProps) {
  const { colors } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Scale pulse
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: colors.background + 'DD' }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }, { scale: scaleAnim }],
            },
          ]}
        >
          <SharinganEyeIcon size={100} color={colors.error} />
        </Animated.View>

        <Text style={[styles.text, { color: colors.text, fontFamily: fonts.heading }]}>
          Début du match...
        </Text>

        {starterName && (
          <Text style={[styles.starterText, { color: colors.primary, fontFamily: fonts.bodyBold }]}>
            {starterName} commence !
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    padding: 20,
  },
  text: {
    fontSize: 24,
  },
  starterText: {
    fontSize: 18,
  },
});
