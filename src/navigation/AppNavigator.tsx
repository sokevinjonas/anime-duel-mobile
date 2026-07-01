import { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OTPScreen } from '../screens/OTPScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { MatchScreen } from '../screens/MatchScreen';
import { SoloGameScreen } from '../screens/SoloGameScreen';
import { SocialScreen } from '../screens/SocialScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { MissionsScreen } from '../screens/MissionsScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { WheelScreen } from '../screens/WheelScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { getAccessToken } from '../services/auth';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { TabBar } from '../components/layout/TabBar';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  OTP: { email: string };
  MainTabs: undefined;
  Match: { matchId?: string; roomCode?: string };
  SoloGame: undefined;
  Catalog: undefined;
  Shop: undefined;
  Missions: undefined;
  History: undefined;
  Wheel: undefined;
  Events: undefined;
};

export type TabParamList = {
  Home: undefined;
  Social: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();


function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkInitialState() {
      const seen = await AsyncStorage.getItem('onboarding_completed');
      setOnboardingSeen(seen === 'true');

      const token = await getAccessToken();
      setIsLoggedIn(!!token);

      setIsReady(true);
    }
    checkInitialState();
  }, []);

  if (!isReady) {
    return (
      <LinearGradient
        colors={['#1E1537', '#0D0A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color="#58CC02" />
      </LinearGradient>
    );
  }

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!onboardingSeen) return 'Onboarding';
    if (!isLoggedIn) return 'Login';
    return 'MainTabs';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.bodyBold },
          headerShadowVisible: false,
          headerBackTitle: 'Retour',
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Match"
          component={MatchScreen}
          options={{ title: 'Match' }}
        />
        <Stack.Screen
          name="SoloGame"
          component={SoloGameScreen}
          options={{ title: 'Match Solo', headerShown: false }}
        />
        <Stack.Screen
          name="Catalog"
          component={CatalogScreen}
          options={{ title: 'Catalogue' }}
        />
        <Stack.Screen
          name="Shop"
          component={ShopScreen}
          options={{ title: 'Ichiraku Ramen' }}
        />
        <Stack.Screen
          name="Missions"
          component={MissionsScreen}
          options={{ title: 'Missions' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: '📜 Parchemin' }}
        />
        <Stack.Screen
          name="Wheel"
          component={WheelScreen}
          options={{ title: 'Roue du Destin' }}
        />
        <Stack.Screen
          name="Events"
          component={EventsScreen}
          options={{ title: 'Événement Hebdo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
