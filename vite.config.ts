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
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Aggressive memory management for build
    rollupOptions: {
      output: {
        // Simplified chunking to reduce memory overhead
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'libs': ['@supabase/supabase-js', '@tanstack/react-query', 'react-router-dom']
        }
      },
      // Minimize parallel operations to conserve memory
      maxParallelFileOps: 1,
      // Additional memory optimizations
      cache: false
    },
    target: 'esnext',
    minify: false, // Disable minification to save memory during dev builds
    sourcemap: false, // Disable sourcemaps to save memory
    chunkSizeWarningLimit: 2000,
    // Reduce build concurrency
    assetsInlineLimit: 0
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react'
    ]
  }
}));