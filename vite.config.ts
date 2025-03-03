import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    nodePolyfills({
      globals: {
        Buffer: true
      }
    })
  ],
  server: {
    port: 8080,
    host: '0.0.0.0',
  },
});
