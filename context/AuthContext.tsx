import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, clinicId?: string) => Promise<{ requiresClinicSelection: true; clinics: { id: string; name: string }[] } | void>;
  logout: () => Promise<void>;
  isVet: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await authApi.getToken();
      if (token) {
        const me = await authApi.me();
        setUser(me);
      }
    } catch {
      // Token invalide ou expiré
      await authApi.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, clinicId?: string) => {
    const result = await authApi.login(email, password, clinicId);
    if (result && 'requiresClinicSelection' in result) {
      return result;
    }
    setUser(result);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const isVet = user?.role === 'veterinaire' || user?.role === 'assistant';
  const isClient = user?.role === 'client';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isVet, isClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
