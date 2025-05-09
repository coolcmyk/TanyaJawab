import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
    historyApiFallback: true, // Add this line
    proxy: {
      '/auth/github': { // More specific path to avoid proxy conflict with React Router
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/auth/api': { // For API calls that need to be proxied
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/auth\/api/, '/auth')
      }
    }
  }
})
