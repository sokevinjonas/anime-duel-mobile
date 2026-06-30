import { View, Modal, StyleSheet, Animated, Text } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface SharinganModalProps {
  visible: boolean;
  duration?: number;
  variant?: 'eye' | 'flash' | 'smoke';
  onHide?: () => void;
}

export function SharinganModal({
  visible,
  duration = 2000,
  variant = 'eye',
  onHide,
}: SharinganModalProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (variant === 'eye') {
        animateEye();
      } else if (variant === 'flash') {
        animateFlash();
      } else if (variant === 'smoke') {
        animateSmoke();
      }
    }
  }, [visible, variant]);

  const animateEye = () => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    rotateAnim.setValue(0);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onHide?.();
      });
    }, duration - 400);
  };

  const animateFlash = () => {
    scaleAnim.setValue(2);
    opacityAnim.setValue(1);

    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(duration - 1000),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const animateSmoke = () => {
    scaleAnim.setValue(3);
    opacityAnim.setValue(1);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(duration - 1200),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={[styles.overlay, { backgroundColor: variant === 'flash' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)' }]}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
              ...(variant === 'eye' && { transform: [{ scale: scaleAnim }, { rotate: rotation }] }),
            },
          ]}
        >
          {/* Sharingan Eye */}
          <View style={styles.eyeContainer}>
            {/* Outer red circle */}
            <View style={[styles.eyeOuter, { borderColor: colors.error }]} />

            {/* Inner circle with pupil */}
            <View style={[styles.eyeInner, { backgroundColor: colors.error }]}>
              {/* Pupil */}
              <View style={styles.pupil} />

              {/* Tomoe (comma shapes) */}
              <View style={[styles.tomoe, styles.tomoe1]} />
              <View style={[styles.tomoe, styles.tomoe2]} />
              <View style={[styles.tomoe, styles.tomoe3]} />
            </View>
          </View>

          {variant === 'eye' && (
            <Text style={[styles.label, { color: colors.text }]}>Sharingan!</Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    gap: 20,
  },
  eyeContainer: {
    position: 'relative',
    width: 120,
    height: 120,
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
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
