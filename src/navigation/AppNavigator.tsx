import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { MatchScreen } from '../screens/MatchScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Catalog: undefined;
  Match: { matchId?: string; roomCode?: string };
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
