import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Reduce memory usage during build
    rollupOptions: {
      output: {
        // Simpler chunking to reduce memory pressure
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js'],
        },
      },
      // Reduce parallel operations to save memory
      maxParallelFileOps: 1,
    },
    // Disable terser in development to save memory
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } : undefined,
    // Increase chunk size limit to reduce chunks
    chunkSizeWarningLimit: 1000,
    // Disable source maps to save memory
    sourcemap: false,
  },
  // 🔴 Fix #2: Enable production optimizations
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
