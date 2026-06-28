import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { Button3D } from '../components/ui/Button3D';
import { ProgressionMap } from '../components/progression/ProgressionMap';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const currentLevel = 7;
  const maxLevel = 15;

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TODO: call backend mutation startSoloPlayerGuesses with level-based difficulty
    // For now, placeholder alert
    console.log(`Starting match at level ${currentLevel}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.primary, fontFamily: fonts.bodyBlack }]}>
          ANIME DUEL
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Missions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerBtnText, { color: colors.cta, fontFamily: fonts.bodyBold }]}>!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerBtnText, { color: colors.primary, fontFamily: fonts.bodyBold }]}>J</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Catalog')}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerBtnText, { color: colors.orange, fontFamily: fonts.bodyBold }]}>C</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progression Map */}
      <ProgressionMap currentLevel={currentLevel} maxLevel={maxLevel} onPlayLevel={handlePlay} />

      {/* Floating Play Button */}
      <View style={styles.fab}>
        <Button3D
          title="JOUER"
          color={colors.primary}
          darkColor={colors.primaryDark}
          onPress={handlePlay}
          size="large"
          style={{ paddingHorizontal: 48, borderRadius: 50 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  logo: { fontSize: 22 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerBtnText: { fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
});
