import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export function useRefetchUser(refetch: () => Promise<any>) {
  useFocusEffect(
    useCallback(() => {
      // Refetch user data when screen is focused
      refetch();
    }, [refetch]),
  );
}
