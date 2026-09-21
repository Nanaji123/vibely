import * as SecureStore from 'expo-secure-store';

// Tiny persisted key/value for per-device UI state (read alerts, toggles). SecureStore is already a
// dependency and values here are well under its 2KB limit.
export const readLocal = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeLocal = async (key: string, value: unknown) => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch {
    // best effort; UI state only
  }
};
