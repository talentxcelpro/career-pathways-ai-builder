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
    react(),
    mode === 'development' && componentTagger(),
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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': [
            '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-popover', '@radix-ui/react-tabs',
            '@radix-ui/react-avatar', '@radix-ui/react-slot'
          ],
          'charts': ['recharts'],
          'animations': ['framer-motion'],
          'heavy-tools': [
            'mammoth', 'pdfjs-dist', 'docx', 'tesseract.js',
            '@huggingface/transformers'
          ],
          'libs': ['@supabase/supabase-js', '@tanstack/react-query', 'react-router-dom'],
          'utils': ['date-fns', 'clsx', 'class-variance-authority', 'zod']
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
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
    ]
  }
}));