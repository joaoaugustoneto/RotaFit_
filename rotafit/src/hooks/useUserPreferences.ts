import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const PREFS_KEY = 'rotafit.user-preferences';

export interface UserPreferences {
  weightKg: number;
  weeklyGoalKm: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  weightKg: 70,
  weeklyGoalKm: 20,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setPreferences((prev) => ({ ...prev, ...parsed }));
          } catch {}
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const updatePreferences = useCallback(async (partial: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  return { preferences, updatePreferences, loaded };
}
