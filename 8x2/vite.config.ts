import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/8x2/',
  plugins: [vue()],
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
  },
});
