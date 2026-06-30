import { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
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
  Login: undefined;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = await getAccessToken();
      setIsLoggedIn(!!token);
      setIsReady(true);
    }
    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.bodyBold },
          headerShadowVisible: false,
          headerBackTitle: 'Retour',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
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
          options={{ title: 'Historique' }}
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
