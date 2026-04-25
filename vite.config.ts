import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
    alias: {
      three: new URL('./src/tests/__mocks__/three.ts', import.meta.url).pathname,
    },
  },
});
