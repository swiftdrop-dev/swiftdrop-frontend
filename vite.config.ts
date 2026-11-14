import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1/merchants': {
        target: process.env.VITE_MERCHANT_SERVICE_URL || 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/v1/dispatch': {
        target: process.env.VITE_DISPATCH_SERVICE_URL || 'http://localhost:8085',
        changeOrigin: true,
      },
      '/api/v1': {
        target: process.env.VITE_GATEWAY_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
