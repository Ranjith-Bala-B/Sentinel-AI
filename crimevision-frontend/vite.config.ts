import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/server/crimevision-backend/api/v1": {
        target: "https://sentinel-ai-backend-50044342253.development.catalystappsail.in",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/server\/crimevision-backend\/api\/v1/, ""),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "icons-vendor": ["lucide-react"],
        },
      },
    },
  },
});
