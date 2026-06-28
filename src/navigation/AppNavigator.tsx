import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { MatchScreen } from '../screens/MatchScreen';
import { SoloScreen } from '../screens/SoloScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { MissionsScreen } from '../screens/MissionsScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Catalog: undefined;
  Match: { matchId?: string; roomCode?: string };
  Solo: undefined;
  Shop: undefined;
  Missions: undefined;
  Leaderboard: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Catalog" component={CatalogScreen} />
        <Stack.Screen name="Match" component={MatchScreen} />
        <Stack.Screen name="Solo" component={SoloScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="Missions" component={MissionsScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
