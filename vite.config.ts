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
    react({
      // Reduce memory usage during development
      devTarget: mode === 'development' ? 'es2020' : 'esnext'
    }),
    // Only enable heavy plugins in production
    mode === 'production' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"]
  },
  build: {
    rollupOptions: {
      maxParallelFileOps: 1
    },
    target: 'es2020',
    minify: false,
    sourcemap: false,
    chunkSizeWarningLimit: 2000
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
    // Exclude heavy packages to reduce memory usage
    exclude: [
      'mammoth', 'pdfjs-dist', 'docx', 'tesseract.js', '@huggingface/transformers'
    ]
  },
  // Memory optimization for development
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));