import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { Platform } from 'react-native';
import { getAccessToken } from './auth';

const getApiUrl = () => {
  if (Platform.OS === 'web') return process.env.EXPO_PUBLIC_API_URL_WEB;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_API_URL_ANDROID;
  return process.env.EXPO_PUBLIC_API_URL_IOS;
};

const httpLink = new HttpLink({
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
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
