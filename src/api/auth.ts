import { apiFetch, IS_DEMO_MODE, setAuthToken } from './client';

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  preferences?: {
    dietary_prefs: string;
    favorite_cuisines: string;
    home_location: string;
  };
}

export async function register(payload: { name: string; email: string; password: string }) {
  if (IS_DEMO_MODE) {
    throw new Error('Demo mode is read-only. Account creation is disabled in this preview.');
  }
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(data.token);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  if (IS_DEMO_MODE) {
    throw new Error('Demo mode is read-only. Authentication is disabled in this preview.');
  }
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(data.token);
  return data;
}

export async function logout() {
  if (IS_DEMO_MODE) {
    setAuthToken(null);
    return;
  }
  await apiFetch<void>('/auth/logout', {
    method: 'POST',
    auth: true,
  });
  setAuthToken(null);
}

export async function fetchCurrentUser() {
  if (IS_DEMO_MODE) {
    throw new Error('Demo mode is read-only. Authentication is disabled in this preview.');
  }
  return apiFetch<AuthResponse>('/auth/me', {
    method: 'GET',
    auth: true,
  });
}

export async function updatePreferences(payload: {
  dietaryPrefs: string[];
  favoriteCuisines: string[];
  homeLocation: string;
}) {
  if (IS_DEMO_MODE) {
    throw new Error('Demo mode is read-only. Preferences cannot be updated in this preview.');
  }
  return apiFetch<{ preferences: { dietary_prefs: string; favorite_cuisines: string; home_location: string } }>(
    '/auth/preferences',
    {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(payload),
    }
  );
}
