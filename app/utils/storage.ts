import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  RECRAFT_TOKEN: 'recraft_token',
} as const;

export async function getRecraftToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(StorageKeys.RECRAFT_TOKEN);
  } catch (error) {
    console.error('Error getting Recraft token:', error);
    return null;
  }
}

export async function setRecraftToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(StorageKeys.RECRAFT_TOKEN, token);
  } catch (error) {
    console.error('Error setting Recraft token:', error);
  }
}