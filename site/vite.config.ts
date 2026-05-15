import path from "path"
import { readFileSync } from "fs"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const host = process.env.TAURI_DEV_HOST;
const tauriConfig = JSON.parse(
  readFileSync(path.resolve(__dirname, "src-tauri/tauri.conf.json"), "utf8"),
);
const appVersion = process.env.VITE_APP_VERSION || tauriConfig.version || "0.0.0";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  clearScreen: false,
  plugins: [react()],
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: process.env.TAURI_ENV_DEBUG ? false : 'esbuild',
    sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replace(/\\/g, '/');
          if (moduleId.includes('src/data/siteData.generated.ts')) return 'site-data';
          if (!moduleId.includes('node_modules')) return undefined;
          if (moduleId.includes('framer-motion')) return 'motion';
          if (moduleId.includes('lucide-react')) return 'icons';
          if (moduleId.includes('@radix-ui')) return 'radix-ui';
          if (moduleId.includes('date-fns')) return 'date-tools';
          if (
            moduleId.includes('/node_modules/react/') ||
            moduleId.includes('/node_modules/react-dom/') ||
            moduleId.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: host || "127.0.0.1",
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
