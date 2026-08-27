import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/,
              priority: 30,
            },
            {
              name: 'router',
              test: /node_modules[\\/]react-router/,
              priority: 25,
            },
            {
              name: 'supabase',
              test: /node_modules[\\/]@supabase/,
              priority: 20,
            },
            {
              name: 'forms',
              test: /node_modules[\\/](react-hook-form|@hookform|zod)([\\/]|$)/,
              priority: 15,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
