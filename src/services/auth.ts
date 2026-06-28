import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const storage = {
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async delete(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export async function saveTokens(accessToken: string, refreshToken: string) {
  await storage.set(ACCESS_TOKEN_KEY, accessToken);
  await storage.set(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  const token = await storage.get(ACCESS_TOKEN_KEY);

  // Vérifier si le token est expiré
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        // Token expiré, nettoyer
        await clearTokens();
        return null;
      }
    } catch (error) {
      // Token invalide, nettoyer
      await clearTokens();
      return null;
    }
  }

  return token;
}

export async function getRefreshToken(): Promise<string | null> {
  return storage.get(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await storage.delete(ACCESS_TOKEN_KEY);
  await storage.delete(REFRESH_TOKEN_KEY);
}
