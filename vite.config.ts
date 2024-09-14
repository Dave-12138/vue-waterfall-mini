import { fileURLToPath, URL } from 'node:url'

import { BuildOptions, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const build: BuildOptions = {
  target: "modules",
  lib: {
    formats: ['es', 'cjs'],
    entry: "./src/main.ts",
    name: "vue-waterfall-mini",
    fileName: (t) => `vue-waterfall-mini.${t === 'es' ? 'esm' : t}.js`
  },
  rollupOptions: {
    external: ['vue'],
  }
}
if (process.env.TARGET !== 'lib') {
  build.lib = false;
  build.outDir = 'pages';
  build.rollupOptions = void 0;
}
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build,
  server: {
    proxy: {
      '/js/vue-accordion.js': 'https://dave-12138.cn'
    },
    open: true
  }
})
