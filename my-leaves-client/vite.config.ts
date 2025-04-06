// --- Updated File: ./my-leaves-client/vite.config.ts ---
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy API requests (leaves, users etc.) to the BFF
      '/leaves': {
        target: 'https://localhost:7123', // Your BFF URL
        changeOrigin: true,
        secure: false, // Disable SSL verification if using self-signed certs in dev
      },
      '/users': {
        target: 'https://localhost:7123', // Your BFF URL
        changeOrigin: true,
        secure: false,
      },
      // Proxy auth requests to the BFF
      '/auth': {
        target: 'https://localhost:7123', // Your BFF URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
})