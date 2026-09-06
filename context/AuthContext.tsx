import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, clinicId?: string) => Promise<{ requiresClinicSelection: true; clinics: { id: string; name: string }[] } | void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isStaff: boolean;
  isClient: boolean;
  isReadOnly: boolean;
  isResponsable: boolean;
  canWrite: boolean;
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

  const refreshUser = async () => {
    const me = await authApi.me();
    setUser(me);
  };

  //  user?.role  --> optional chaining (chaînage optionnel) de JS/TS. si user est null ou undefined, on s'arrête là et renvoie undefined au lieu de planter 
  // sinon, on continue et on lit .role"
  const isStaff = user?.role === 'veterinaire' || user?.role === 'assistant' || user?.role === 'responsable';
  const isClient = user?.role === 'client';
  // Bénévole en clinique = lecture seule ; bénévole en refuge/association = peut gérer les animaux
  const isReadOnly = user?.role === 'benevole' && !['refuge', 'association'].includes(user?.clinicType ?? '');
  const isResponsable = user?.role === 'responsable';
  // Peut créer / modifier / supprimer : vét/assistant/responsable OU bénévole en refuge/asso (jamais le client)
  const canWrite = (isStaff || !isReadOnly) && !isClient;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isStaff, isClient, isReadOnly, isResponsable, canWrite }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
