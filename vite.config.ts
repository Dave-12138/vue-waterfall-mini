import { fileURLToPath, URL } from 'node:url'

import { BuildOptions, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const target = process.env.TARGET;
const build: BuildOptions = {
  target: "modules",
  lib: {
    formats: ['es'],
    entry: "./src/main.ts",
    name: "vue-waterfall-mini",
    fileName: () => 'vue-waterfall-mini.esm.js'
  },
  rollupOptions: {
    external: ['vue']
  }
}
if (target !== 'lib') {
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
    }
  }
})
