import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from '../components/ui/Button3D';
import { ProgressionMap } from '../components/progression/ProgressionMap';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const currentLevel = 7;
  const maxLevel = 15;

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TODO: call backend mutation startSoloPlayerGuesses with level-based difficulty
    console.log(`Starting match at level ${currentLevel}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with safe area */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 12) + 8,
            backgroundColor: isDark ? 'rgba(31, 48, 57, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.logo, { color: colors.primary, fontFamily: fonts.bodyBlack }]}>
          ANIME DUEL
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate('Missions')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="assignment" size={22} color={colors.cta} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="store" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate('Catalog')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="collections" size={22} color={colors.orange} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progression Map - fills remaining space */}
      <View style={styles.mapContainer}>
        <ProgressionMap currentLevel={currentLevel} maxLevel={maxLevel} onPlayLevel={handlePlay} />
      </View>

      {/* Floating Play Button - positioned above tab bar */}
      <View
        style={[
          styles.fab,
          {
            bottom: Math.max(insets.bottom, 12) + 68, // tab bar height + spacing
          },
        ]}
      >
        <Button3D
          title="JOUER"
          color={colors.primary}
          darkColor={colors.primaryDark}
          onPress={handlePlay}
          size="large"
          style={styles.playButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logo: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mapContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  playButton: {
    paddingHorizontal: 48,
    borderRadius: 50,
    minWidth: 160,
  },
});
