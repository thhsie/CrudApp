import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; // Added import for path

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: { // Added resolve config
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { // Added server proxy config
    proxy: {
      '/api': {
        target: 'http://localhost:5010', // Assuming your backend runs on 5000
        changeOrigin: true,
      },
      '/auth': { // Added proxy for auth routes as well
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
    },
  },
})
