const STORAGE_KEYS = {
  ROUTINES: 'mobility-quest-routines',
  PROFILE: 'mobility-quest-profile',
  ACHIEVEMENTS: 'mobility-quest-achievements',
  COMPLETIONS: 'mobility-quest-completions',
  NOTIFICATIONS: 'mobility-quest-notifications',
  DAILY_COMPLETIONS: 'mobility-quest-daily-completions',
} as const;

export function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

export function removeStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

export { STORAGE_KEYS };

