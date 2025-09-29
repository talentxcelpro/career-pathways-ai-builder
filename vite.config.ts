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
    mode === 'production' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      '@supabase/supabase-js',
      'react-router-dom',
      'lucide-react'
    ],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          // Separate heavy libraries into their own chunks for better memory management
          pdf: ['pdfjs-dist'],
          ocr: ['tesseract.js'], 
          // fabric: ['fabric'], // Temporarily disabled to reduce memory usage
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          supabase: ['@supabase/supabase-js'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          charts: ['recharts'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', '@hello-pangea/dnd'],
          // Separate query and state management
          query: ['@tanstack/react-query'],
          state: ['zustand'],
          // UI libraries
          radix: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
        },
      },
    },
    // Optimize chunk size and performance
    chunkSizeWarningLimit: 1000, // Increased from 500 to handle larger chunks
    sourcemap: mode === 'development',
    // Aggressive minification with memory optimization
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
        passes: mode === 'production' ? 2 : 1, // Reduce passes in development
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
      // Memory optimization for large projects
      maxWorkers: 1, // Reduce parallel workers to save memory
    },
    // Enable tree shaking with better optimization
    treeshake: {
      moduleSideEffects: (id: string) => {
        // Preserve side effects for CSS and some specific modules
        return id.includes('.css') || id.includes('global-styles');
      },
    },
  },
  // Performance optimizations
  esbuild: {
    target: 'esnext',
    platform: 'browser',
    treeShaking: true,
    minifyIdentifiers: mode === 'production',
    minifySyntax: mode === 'production',
    minifyWhitespace: mode === 'production',
  },
}));