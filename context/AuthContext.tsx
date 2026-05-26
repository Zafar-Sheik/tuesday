'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SessionUser, ApiResponse } from '@/types';

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: SessionUser | null) => void;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<ApiResponse<SessionUser>>;
  logout: () => Promise<ApiResponse<void>>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      });
      const data: ApiResponse<SessionUser> = await res.json();

      if (data.success && data.data) {
        setUser(data.data);
        setError(null);
      } else {
        setUser(null);
        setError(data.error || 'Not authenticated');
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
      setError('Failed to connect to authentication service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<ApiResponse<SessionUser>> => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data: ApiResponse<SessionUser> = await res.json();
      
      if (data.success && data.data) {
        setUser(data.data);
      } else {
        setUser(null);
        setError(data.error || 'Login failed');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error during login';
      setError(errorMessage);
      setUser(null);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<ApiResponse<void>> => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      const data: ApiResponse<void> = await res.json();
      
      if (data.success) {
        setUser(null);
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error during logout';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    setUser,
    refreshUser,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
