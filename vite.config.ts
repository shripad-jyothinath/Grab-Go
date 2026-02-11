import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase the warning limit slightly to reduce noise, though splitting handles the real issue
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React ecosystem into a vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Group heavy UI/Chart libs
          'vendor-ui': ['lucide-react', 'recharts', 'react-qr-code'],
          // Group Google/Auth related libs
          'vendor-utils': ['@google/genai', '@react-oauth/google', 'centrifuge', 'axios']
        }
      }
    }
  }
});