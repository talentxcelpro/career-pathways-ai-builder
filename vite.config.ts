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
      "fs": path.resolve(__dirname, "./src/lib/social-marketing/utils/browserFs.ts"),
      "path": path.resolve(__dirname, "./src/lib/social-marketing/utils/browserPath.ts"),
      "child_process": path.resolve(__dirname, "./src/lib/social-marketing/utils/browserChildProcess.ts"),
      "crypto": path.resolve(__dirname, "./src/lib/social-marketing/utils/browserCrypto.ts"),
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
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. High-volume static education catalog (isolated from core application)
          if (id.includes('indianInstitutionsCatalog') || id.includes('indianEducationService')) {
            return 'indian-education-catalog';
          }
          // 2. Heavy standalone PDF engines (loaded strictly on-demand for PDF generation)
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs-vendor';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'jspdf-vendor';
          }
          if (id.includes('node_modules/html2canvas')) {
            return 'html2canvas-vendor';
          }
          // 3. Keep all React core runtime and vendor libraries in a unified vendor chunk
          // to prevent cross-chunk circular dependencies and uninitialized createContext calls
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 3000,
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
