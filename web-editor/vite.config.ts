import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

import { unstableRolldownAdapter } from 'vite-bundle-analyzer'
import { analyzer } from 'vite-bundle-analyzer'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        unstableRolldownAdapter(
          analyzer({
            analyzerMode: 'static',
          }),
        ),
      ],
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vueDevTools(),

    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: fileURLToPath(new URL('./src/css/quasar.variables.scss', import.meta.url)),
    }),
  ],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      ...Object.fromEntries(
        ['access', 'components', 'composables', 'layouts', 'pages', 'types', 'utils'].map((dir) => [
          dir,
          fileURLToPath(new URL(`./src/${dir}`, import.meta.url)),
        ]),
      ),
    },
  },
  server: {
    open: true,
  },
})
