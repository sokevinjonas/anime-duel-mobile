import { ApolloClient, InMemoryCache, ApolloLink, Observable, from } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Platform } from 'react-native';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth';

const getApiUrl = () => {
  if (Platform.OS === 'web') return process.env.EXPO_PUBLIC_API_URL_WEB;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_API_URL_ANDROID;
  return process.env.EXPO_PUBLIC_API_URL_IOS;
};

const httpLink = new HttpLink({
  uri: getApiUrl(),
});

// @ts-ignore - setContext is deprecated but new API has type issues
const authLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

// Refresh token automatique quand le token expire
// @ts-ignore - onError is deprecated but new API has type issues
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // Token expiré, tenter de refresh
        return new Observable((observer) => {
          (async () => {
            try {
              const refreshToken = await getRefreshToken();
              if (!refreshToken) {
                await clearTokens();
                forward(operation).subscribe(observer);
                return;
              }

              // Appeler l'endpoint de refresh
              const response = await fetch(`${getApiUrl()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: `
                    mutation RefreshToken($input: RefreshTokenInput!) {
                      refreshToken(input: $input) {
                        accessToken
                        refreshToken
                        isNewUser
                      }
                    }
                  `,
                  variables: { input: { refreshToken } },
                }),
              });

              const result = await response.json();
              if (result.data?.refreshToken) {
                await saveTokens(
                  result.data.refreshToken.accessToken,
                  result.data.refreshToken.refreshToken
                );
                // Retry la requête avec le nouveau token
                forward(operation).subscribe(observer);
              } else {
                await clearTokens();
                forward(operation).subscribe(observer);
              }
            } catch (error) {
              await clearTokens();
              forward(operation).subscribe(observer);
            }
          })();
        });
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
