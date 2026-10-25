import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En développement, le front appelle /api et /uploads : Vite les redirige vers le backend (pas de souci de CORS).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000', '/uploads': 'http://localhost:5000' } },
});
