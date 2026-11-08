import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '../../../types/global.types';
import { MOCK_USERS } from '../../../lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('swiftdrop_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'Invalid email or password.' };
    }

    setUser(found);
    localStorage.setItem('swiftdrop_user', JSON.stringify(found));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('swiftdrop_user');
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await new Promise(r => setTimeout(r, 800));

    const exists = MOCK_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Email already registered.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
    };

    MOCK_USERS.push(newUser);
    setUser(newUser);
    localStorage.setItem('swiftdrop_user', JSON.stringify(newUser));
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
