import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Reduce memory usage during development
      devTarget: mode === 'development' ? 'es2020' : 'esnext'
    }),
    // Disable heavy plugins during development builds
    mode === 'production' && componentTagger(),
    mode === 'production' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react';
            if (id.includes('@radix-ui')) return 'ui';
            if (id.includes('@supabase') || id.includes('@tanstack')) return 'data';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          }
        }
      }
    },
    target: 'es2022',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    cssCodeSplit: false
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react'
    ],
    // Exclude heavy packages from optimization to save memory
    exclude: mode === 'development' ? [
      'mammoth', 'pdfjs-dist', 'docx', 'tesseract.js', '@huggingface/transformers'
    ] : []
  },
  // Additional memory optimizations for development
  esbuild: mode === 'development' ? {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  } : undefined
}));