import { apiClient } from '../lib/api-client';

export const authService = {
  login: async (credentials: Record<string, unknown>) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};
