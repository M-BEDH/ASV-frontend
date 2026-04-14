import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');
const TOKEN_KEY = 'asv_jwt_token';

// Cache mémoire du token — évite un accès AsyncStorage/SecureStore à chaque requête
let _tokenCache: string | null = null;

const storeToken = async (token: string) => {
  _tokenCache = token;
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

const getToken = async (): Promise<string | null> => {
  if (_tokenCache !== null) return _tokenCache;
  const token = Platform.OS === 'web'
    ? await AsyncStorage.getItem(TOKEN_KEY)
    : await SecureStore.getItemAsync(TOKEN_KEY);
  _tokenCache = token;
  return token;
};

const removeToken = async () => {
  _tokenCache = null;
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`);
  return json as T;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string, clinicId?: string) => {
    const data = await request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(clinicId ? { clinicId } : {}) }),
    });
    if (data.requiresClinicSelection) {
      return data as { requiresClinicSelection: true; clinics: { id: string; name: string }[] };
    }
    await storeToken(data.token);
    return data.user;
  },

  register: async (payload: {
    email: string;
    password: string;
    name: string;
    role: string;
    clinicName?: string;
    clinicId?: string;
  }) => {
    const data = await request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },

  me: () => request<any>('/api/auth/me'),
  // Vérifie si un compte est en attente d'activation pour l'email donné
  checkPending: (email: string) => request<{ pending: boolean; name?: string; role?: string }>(`/api/auth/check-pending?email=${encodeURIComponent(email)}`),

  logout: async () => {
    await removeToken();
  },

  getToken,
};

// ─── Clinics ──────────────────────────────────────────────────────────────────

export const clinicsApi = {
  list: () => request<any[]>('/api/clinics'),
  byEmail: (email: string) =>
    request<{ found: boolean; clinics: { id: string; name: string; type: string }[] }>(
      `/api/clinics/by-email?email=${encodeURIComponent(email)}`
    ),
  update: (id: string, name: string) => request<any>(`/api/clinics/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
};

// ─── Animals ──────────────────────────────────────────────────────────────────

export const animalsApi = {
  list: () => request<any[]>('/api/animals'),
  get: (id: string) => request<any>(`/api/animals/${id}`),
  create: (data: any) => request<any>('/api/animals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/animals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/animals/${id}`, { method: 'DELETE' }),
  getConsultations: (id: string) => request<any[]>(`/api/animals/${id}/consultations`),
};

// ─── Owners ───────────────────────────────────────────────────────────────────

export const ownersApi = {
  list: () => request<any[]>('/api/owners'),
  get: (id: string) => request<any>(`/api/owners/${id}`),
  create: (data: any) => request<any>('/api/owners', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/owners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/owners/${id}`, { method: 'DELETE' }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: () => request<any[]>('/api/users'),
  create: (data: { name: string; email: string; role: string }) => request<any>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, role: string) => request<any>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify({ role }) }),
  delete: (id: string) => request<void>(`/api/users/${id}`, { method: 'DELETE' }),
};

// ─── Consultations ────────────────────────────────────────────────────────────

export const consultationsApi = {
  list: () => request<any[]>('/api/consultations'),
  get: (id: string) => request<any>(`/api/consultations/${id}`),
  create: (data: any) => request<any>('/api/consultations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/consultations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/consultations/${id}`, { method: 'DELETE' }),
};
