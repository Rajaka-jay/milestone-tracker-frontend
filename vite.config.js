import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // A compile-time constant lets production builds drop the mock backend completely.
  const useMock = mode === 'test' || env.VITE_USE_MOCK === 'true';

  return {
    plugins: [react()],
    define: { __USE_MOCK__: JSON.stringify(useMock) },
    server: { port: 5173 },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: false,
      env: { VITE_MOCK_LATENCY: '0' },
    },
  };
});
