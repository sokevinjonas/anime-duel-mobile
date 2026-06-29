import { ApolloClient, InMemoryCache, ApolloLink, Observable, from } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Platform } from 'react-native';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth';

declare module '@apollo/client' {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      interface WatchQuery {
        errorPolicy: 'all';
      }
      interface Query {
        errorPolicy: 'all';
      }
      interface Mutate {
        errorPolicy: 'all';
      }
    }
  }
}

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

// Gestion des erreurs d'authentification
// @ts-ignore - onError is deprecated but new API has type issues
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const isAuthError =
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.message?.includes('User not found') ||
        err.message?.includes('Unauthorized');

      if (isAuthError) {
        if (__DEV__) console.log('UNAUTHENTICATED error detected');

        // Token invalide ou utilisateur supprimé
        return new Observable((observer) => {
          (async () => {
            try {
              const refreshToken = await getRefreshToken();

              // Pas de refresh token ou refresh échoue → déconnecter
              if (!refreshToken) {
                if (__DEV__) console.log('No refresh token, clearing tokens');
                await clearTokens();
                // Recharger la page pour rediriger vers Login
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
                forward(operation).subscribe(observer);
                return;
              }

              // Tenter de refresh le token
              if (__DEV__) console.log('Attempting token refresh...');
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

              // Refresh réussi → retry la requête
              if (result.data?.refreshToken) {
                if (__DEV__) console.log('Token refreshed successfully');
                await saveTokens(
                  result.data.refreshToken.accessToken,
                  result.data.refreshToken.refreshToken
                );
                forward(operation).subscribe(observer);
              } else {
                // Refresh échoué → déconnecter
                if (__DEV__) console.log('Token refresh failed, clearing tokens');
                await clearTokens();
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
                forward(operation).subscribe(observer);
              }
            } catch (error) {
              if (__DEV__) console.error('Error during token refresh:', error);
              await clearTokens();
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
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
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
