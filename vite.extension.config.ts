import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Vite config for building Chrome extension
 * Builds extension popup as a React app separate from main app
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-extension',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
