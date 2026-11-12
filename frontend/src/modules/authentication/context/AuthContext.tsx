import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/client';

export interface UserMe {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  has_profile: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: UserMe | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('access_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiClient.get<UserMe>('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.warn('Failed to fetch user session:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setToken(access_token);
      await refreshUser();
      return res.data.is_onboarded;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/auth/register', { email, password });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setToken(access_token);
      await refreshUser();
      return false; // new registrations require onboarding
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
