import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Preferences {
  dietaryPrefs: string[];
  favoriteCuisines: string[];
  homeLocation: string;
}

interface AuthContextValue {
  user: User | null;
  preferences: Preferences;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Preferences) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const defaultPreferences: Preferences = {
  dietaryPrefs: [],
  favoriteCuisines: [],
  homeLocation: '',
};

const parseJsonArray = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authApi
      .fetchCurrentUser()
      .then((res) => {
        if (!isMounted) return;
        setUser(res.user);
        if (res.preferences) {
          setPreferences({
            dietaryPrefs: parseJsonArray(res.preferences.dietary_prefs),
            favoriteCuisines: parseJsonArray(res.preferences.favorite_cuisines),
            homeLocation: res.preferences.home_location ?? '',
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setPreferences(defaultPreferences);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const result = await authApi.login(payload);
    setUser(result.user);
    if (result.preferences) {
      setPreferences({
        dietaryPrefs: parseJsonArray(result.preferences.dietary_prefs),
        favoriteCuisines: parseJsonArray(result.preferences.favorite_cuisines),
        homeLocation: result.preferences.home_location ?? '',
      });
    } else {
      setPreferences(defaultPreferences);
    }
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const result = await authApi.register(payload);
    setUser(result.user);
    if (result.preferences) {
      setPreferences({
        dietaryPrefs: parseJsonArray(result.preferences.dietary_prefs),
        favoriteCuisines: parseJsonArray(result.preferences.favorite_cuisines),
        homeLocation: result.preferences.home_location ?? '',
      });
    } else {
      setPreferences(defaultPreferences);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setPreferences(defaultPreferences);
  };

  const updatePreferences = async (next: Preferences) => {
    await authApi.updatePreferences({
      dietaryPrefs: next.dietaryPrefs,
      favoriteCuisines: next.favoriteCuisines,
      homeLocation: next.homeLocation,
    });
    setPreferences(next);
  };

  const value = useMemo(
    () => ({
      user,
      preferences,
      isLoading,
      login,
      register,
      logout,
      updatePreferences,
    }),
    [user, preferences, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
