import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

// https://vite.dev/config/
export default defineConfig({
  // https://front.thecreatorq.ru
  base: "/",
  plugins: [tanstackRouter(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ["front.thecreatorq.ru", ".thecreatorq.ru"],
  },
  preview: {
    host: true,
    allowedHosts: ["front.thecreatorq.ru", ".thecreatorq.ru"],
  },
})
