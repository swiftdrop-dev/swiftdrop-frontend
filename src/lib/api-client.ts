import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
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
