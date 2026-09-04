import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && mcpPlugin(),
    mode === 'production' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-dialog',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        // Keep React and all related runtime in a single chunk to avoid
        // multiple React instances / null import issues.
        manualChunks: (id) => {
          // Keep React and all related runtime in a single chunk to avoid
          // multiple React instances / null import issues.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/react-is/')
          ) {
            return 'react-vendor';
          }
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'animations';
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Decompose heavy PDF engines into separate single-purpose chunks
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs-vendor';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'jspdf-vendor';
          }
          if (id.includes('node_modules/html2canvas')) {
            return 'html2canvas-vendor';
          }
          if (id.includes('node_modules/@react-pdf')) {
            return 'react-pdf-vendor';
          }
          // Specialized heavy feature libraries (Three.js, Office, Canvas, Flow, DnD)
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/docx') || id.includes('node_modules/mammoth') || id.includes('node_modules/jszip')) {
            return 'office-vendor';
          }
          if (id.includes('node_modules/fabric') || id.includes('node_modules/@xyflow')) {
            return 'canvas-vendor';
          }
          if (id.includes('node_modules/@dnd-kit') || id.includes('node_modules/@hello-pangea')) {
            return 'dnd-vendor';
          }
          if (id.includes('node_modules/react-big-calendar') || id.includes('node_modules/react-day-picker')) {
            return 'calendar-vendor';
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor';
          }
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/lodash')) {
            return 'utils-vendor';
          }
          // High-volume static catalog and dataset chunks
          if (id.includes('indianInstitutionsCatalog') || id.includes('indianEducationService')) {
            return 'indian-education-catalog';
          }
          if (id.includes('locations.ts')) {
            return 'geo-locations';
          }
          if (id.includes('talentxcelAiContentPool')) {
            return 'ai-content-pool';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
      },
      maxWorkers: 1,
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
}));
