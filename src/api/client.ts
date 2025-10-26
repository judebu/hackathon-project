const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

function getAuthToken(): string | null {
  return window.localStorage.getItem('tt_auth_token');
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const payload = JSON.parse(text);
      throw new Error(payload.message || response.statusText);
    } catch {
      throw new Error(text || response.statusText);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function setAuthToken(token: string | null) {
  if (!token) {
    window.localStorage.removeItem('tt_auth_token');
    return;
  }
  window.localStorage.setItem('tt_auth_token', token);
}
