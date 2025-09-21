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
          // Dynamic chunking to reduce memory usage
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            if (id.includes('mammoth') || id.includes('pdfjs-dist') || id.includes('docx')) {
              return 'pdf-tools';
            }
            if (id.includes('tesseract') || id.includes('transformers')) {
              return 'ai-tools';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('@supabase') || id.includes('@tanstack') || id.includes('react-router')) {
              return 'libs';
            }
            return 'vendor';
          }
        }
      },
      maxParallelFileOps: 1 // Further reduce parallel operations
    },
    target: 'es2020', // Less aggressive target for better compatibility
    minify: false, // Disable minification for development builds
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 2048
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