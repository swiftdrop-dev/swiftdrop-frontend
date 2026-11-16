import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('swiftdrop_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.id) {
        config.headers['X-User-Id'] = user.id;
      }
      if (user.email) {
        config.headers['X-User-Email'] = user.email;
      }
      if (user.role) {
        config.headers['X-User-Roles'] = `ROLE_${user.role.toUpperCase()}`;
      }
    } catch {
      // Ignore parse errors
    }
  }

  const token = localStorage.getItem('swiftdrop_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});
