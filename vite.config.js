import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/qimen-divination/',   // ← 加入這行，名稱對應你的 repo 名稱
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
});
