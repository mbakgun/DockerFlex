import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3200,
    host: '0.0.0.0',
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: process.env.VITE_INTERNAL_API_URL || process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    'process.env.VITE_INTERNAL_API_URL': JSON.stringify(process.env.VITE_INTERNAL_API_URL),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.json']
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  }
}); 