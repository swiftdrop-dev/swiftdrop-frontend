import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('swiftdrop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Globally handle 401 Unauthorized — redirect to login only when a protected request fails
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    // Do not reload if the 401 is simply an incorrect password during login/register
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('swiftdrop_token');
      localStorage.removeItem('swiftdrop_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
