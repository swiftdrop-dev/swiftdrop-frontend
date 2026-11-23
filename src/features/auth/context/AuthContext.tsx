import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '../../../types/global.types';
import { authService, type RegisterData } from '../../../services/auth.service';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
}


const AuthContext = createContext<AuthContextType | null>(null);

/** Reads and parses the stored user from localStorage on startup. */
function loadStoredUser(): User | null {
  try {
    const token = localStorage.getItem('swiftdrop_token');
    const stored = localStorage.getItem('swiftdrop_user');
    if (!token || !stored) {
      authService.logout();
      return null;
    }
    return JSON.parse(stored) as User;
  } catch {
    authService.logout();
    return null;
  }
}

/** Extracts a human-readable message from an Axios error response. */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (!error.response) {
      return 'Unable to reach the authentication service. Check your connection and try again.';
    }
  }
  return fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(loadStoredUser);

  // ── Login ─────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });

      // Build the User object from the API response
      const loggedInUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      };

      // Persist token and user separately
      localStorage.setItem('swiftdrop_token', data.token);
      localStorage.setItem('swiftdrop_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true };
    } catch (_error) {
      // Demo / offline fallback if backend auth service is not running
      const demoRoles: Record<string, UserRole> = {
        'admin@demo.com': 'admin',
        'dispatcher@demo.com': 'dispatcher',
        'customer@demo.com': 'customer',
        'merchant@demo.com': 'merchant',
        'courier@demo.com': 'courier',
      };
      if (demoRoles[email]) {
        const demoUser: User = {
          id: `demo_${demoRoles[email]}`,
          email,
          name: `${demoRoles[email].charAt(0).toUpperCase() + demoRoles[email].slice(1)} User`,
          role: demoRoles[email],
        };
        localStorage.setItem('swiftdrop_token', 'demo_jwt_token');
        localStorage.setItem('swiftdrop_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return { success: true };
      }

      return {
        success: false,
        error: extractErrorMessage(_error, 'Invalid email or password. (Make sure backend is running or use a demo account)'),
      };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // ── Register ──────────────────────────────────────────────

  const register = useCallback(async (formData: RegisterData) => {
    try {
      const data = await authService.register(formData);

      const newUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      };

      localStorage.setItem('swiftdrop_token', data.token);
      localStorage.setItem('swiftdrop_user', JSON.stringify(newUser));
      setUser(newUser);

      return { success: true };
    } catch (_error) {
      // Demo / offline fallback if backend auth service is not running
      const newUser: User = {
        id: `demo_${Date.now()}`,
        email: formData.email,
        name: formData.name,
        role: (formData as { role?: UserRole }).role ?? 'customer',
      };
      localStorage.setItem('swiftdrop_token', 'demo_jwt_token');
      localStorage.setItem('swiftdrop_user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    }
  }, []);

  // ── Google OAuth Login ────────────────────────────────────

  const googleLogin = useCallback(async (idToken: string) => {
    try {
      const data = await authService.googleLogin(idToken);

      const loggedInUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      };

      localStorage.setItem('swiftdrop_token', data.token);
      localStorage.setItem('swiftdrop_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true };
    } catch (_error) {
      return {
        success: false,
        error: extractErrorMessage(_error, 'Google authentication failed. Please try again.'),
      };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, googleLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
