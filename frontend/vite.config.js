import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxy = { '/api': process.env.VITE_BACKEND_URL || 'http://localhost:5000' };

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy,
  },
  preview: {
    port: 5173,
    host: true,
    proxy,
  },
});
