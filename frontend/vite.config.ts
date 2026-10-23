import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        share: resolve(import.meta.dirname, "share.html"),
        apps: resolve(import.meta.dirname, "apps.html"),
        docs: resolve(import.meta.dirname, "docs.html"),
      },
    },
  },
});
