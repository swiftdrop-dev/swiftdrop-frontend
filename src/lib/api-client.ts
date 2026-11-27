
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('swiftdrop_token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isAuthAttempt = ['/auth/login', '/auth/register', '/auth/google'].some((path) => url.includes(path));
      if (!isAuthAttempt) {
        localStorage.removeItem('swiftdrop_token');
        localStorage.removeItem('swiftdrop_user');
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register') {
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.assign(`/login?return=${encodeURIComponent(returnTo)}`);
        }
      }
    }
    return Promise.reject(error);
  },
);
