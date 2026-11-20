import { apiClient } from '../lib/api-client';
import type { UserRole } from '../types/global.types';

// ── Types ─────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthApiResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ── Service ───────────────────────────────────────────────────

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthApiResponse> => {
    const response = await apiClient.post<AuthApiResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthApiResponse> => {
    const payload: RegisterData = {
      name: data.name,
      email: data.email,
      password: data.password,
      ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
    };
    const response = await apiClient.post<AuthApiResponse>('/auth/register', payload);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('swiftdrop_token');
    localStorage.removeItem('swiftdrop_user');
  },
};
