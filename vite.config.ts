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
    hmr: mode === 'development' ? { port: 8080 } : false,
  },
  plugins: [
    react({
      devTarget: mode === 'development' ? 'es2020' : 'esnext'
    }),
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
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Conservative chunking to avoid React import issues
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('@radix-ui')) return 'ui-vendor';
            if (id.includes('@supabase')) return 'api-vendor';
            return 'vendor';
          }
        }
      },
    },
    target: 'es2022',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 500, // Stricter limits
    assetsInlineLimit: 8192, // Inline more small assets
    cssCodeSplit: true, // Enable CSS chunking for better caching
    reportCompressedSize: false, // Skip size analysis in dev
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query'
    ],
    force: false // Don't force optimization
  },
  // Additional memory optimizations for development
  esbuild: mode === 'development' ? {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  } : undefined
}));