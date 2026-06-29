import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { clearTokens } from '../services/auth';

export function useAuthErrorHandler(error: any) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!error) return;

    const isAuthError =
      error?.graphQLErrors?.some(
        (err: any) =>
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.message?.includes('User not found') ||
          err.message?.includes('Unauthorized')
      ) ||
      error?.message?.includes('User not found') ||
      error?.message?.includes('Unauthorized');

    if (isAuthError) {
      console.log('🔒 Auth error detected, logging out...');
      clearTokens().then(() => {
        // @ts-ignore
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      });
    }
  }, [error, navigation]);
}
