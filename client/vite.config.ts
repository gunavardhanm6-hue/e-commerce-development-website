// ============================================================
// VITE CONFIG — Build tool configuration
// Sets up dev server proxy and build optimizations
// ============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite configuration
 *
 * - React plugin for JSX/TSX support
 * - Dev server proxy: /api/* requests are forwarded to the Express server
 *   so we avoid CORS issues during development
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward all /api requests to the Express backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
