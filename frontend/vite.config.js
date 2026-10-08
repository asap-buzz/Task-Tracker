import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev proxy makes /api same-origin, so the SameSite=Strict refresh cookie works without CORS tweaks.
export default defineConfig({
  plugins: [react()],
     server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:5000' } },
});
