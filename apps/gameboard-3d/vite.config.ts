import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        test: resolve(__dirname, 'test.html'),
        viewer: resolve(__dirname, 'viewer.html'),
        replay: resolve(__dirname, 'replay.html')
      }
    }
  }
})