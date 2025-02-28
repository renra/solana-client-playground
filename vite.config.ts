import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
  ],
  server: {
    port: 8080,
    host: '0.0.0.0',
  },
});
