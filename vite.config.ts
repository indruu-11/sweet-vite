import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";

// Classic Vite + React SPA (client-side rendering) using TanStack Router
// file-based routing. Deployable as static output to Vercel / Netlify /
// Cloudflare Pages (see vercel.json, netlify.toml, public/_redirects).
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "::",
    port: 8080,
    strictPort: true,
  },
});
