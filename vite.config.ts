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
          // Enhanced code splitting for performance
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            if (id.includes('@supabase') || id.includes('@tanstack')) {
              return 'data';
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
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor';
          }
          // Feature-based chunks for application code
          if (id.includes('/social/')) return 'social';
          if (id.includes('/learning/')) return 'learning';
          if (id.includes('/mobile/')) return 'mobile';
          if (id.includes('/growth/')) return 'growth';
          if (id.includes('/analytics/')) return 'analytics';
        }
      },
      maxParallelFileOps: mode === 'production' ? 4 : 1
    },
    target: mode === 'production' ? 'es2020' : 'es2020',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        safari10: true
      }
    } : undefined,
    sourcemap: mode === 'production' ? false : true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
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