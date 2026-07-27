import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const API_PROXY_TARGET =
  process.env.VITE_API_PROXY_TARGET?.trim() ||
  process.env.VITE_API_ORIGIN?.trim() ||
  "https://api-staging.postmatic.id"

const apiProxy = {
  target: API_PROXY_TARGET,
  changeOrigin: true,
  secure: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "localhost",
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": apiProxy,
    },
  },
  preview: {
    proxy: {
      "/api": apiProxy,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
