import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Platform } from 'react-native';
import { getAccessToken } from './auth';

const getApiUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:3001/graphql';
  // Android emulator uses 10.0.2.2 to reach host machine
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001/graphql';
  // iOS simulator uses localhost
  return 'http://localhost:3001/graphql';
};

const httpLink = createHttpLink({
  uri: getApiUrl(),
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
