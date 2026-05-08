import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(() => {
  return {
    plugins: [vue(), mkcert()],
    base: './',
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    resolve: {
      alias: [
        // webpack path resolve to vitejs
        {
          find: /^~(.*)$/,
          replacement: '$1',
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'), // Đã sửa: bỏ '/' dư thừa và bỏ regex '@/'.
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.scss'],
    },
    server: {
      port: 3000,
      https: true,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      },
    },
  }
})
