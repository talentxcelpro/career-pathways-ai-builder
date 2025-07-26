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
    // 🔴 Memory optimization: Reduce parallel operations and chunk size
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More granular chunking to reduce memory usage
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf-tools';
            if (id.includes('framer-motion')) return 'animation';
            return 'vendor';
          }
        },
      },
      // Reduce parallel operations to prevent memory overflow
      maxParallelFileOps: 1,
    },
    // Use esbuild instead of terser for faster, less memory-intensive minification
    minify: mode === 'production' ? 'esbuild' : false,
    // Smaller chunk size to reduce memory usage
    chunkSizeWarningLimit: 300,
    // Disable source maps to save memory
    sourcemap: false,
    // Additional memory optimizations
    target: 'esnext',
    reportCompressedSize: false,
  },
  // 🔴 Fix #2: Enable production optimizations
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
