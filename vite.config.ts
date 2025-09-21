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
          // Aggressive code splitting for 2-3G optimization
          if (id.includes('node_modules')) {
            // Core React chunk - highest priority
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            
            // UI libraries - separate chunk
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui';
            }
            
            // Heavy tools - separate chunks
            if (id.includes('mammoth') || id.includes('pdfjs-dist') || id.includes('docx')) {
              return 'pdf-tools';
            }
            if (id.includes('tesseract') || id.includes('@huggingface/transformers')) {
              return 'ai-tools';
            }
            
            // Charts and animations - lazy load
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            // Data and routing
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }
            
            // Analytics and monitoring
            if (id.includes('@vercel') || id.includes('analytics')) {
              return 'analytics';
            }
            
            return 'vendor';
          }
          
          // Split app code by feature
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          if (id.includes('/pages/resume/')) {
            return 'resume';
          }
          if (id.includes('/pages/ai/') || id.includes('/components/ai/')) {
            return 'ai-features';
          }
          if (id.includes('/components/passport/')) {
            return 'passport';
          }
          if (id.includes('/pages/mobile/') || id.includes('/components/mobile/')) {
            return 'mobile';
          }
        }
      },
      maxParallelFileOps: mode === 'production' ? 4 : 1
    },
    target: 'es2020',
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Stricter warning for 2-3G
    assetsInlineLimit: 1024, // Smaller inline limit
    // Additional optimizations for slow networks
    reportCompressedSize: false,
    modulePreload: {
      polyfill: true
    }
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