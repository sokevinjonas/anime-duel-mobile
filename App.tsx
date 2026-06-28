import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './src/services/apollo';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <StatusBar style="light" />
      <AppNavigator />
    </ApolloProvider>
  );
}
