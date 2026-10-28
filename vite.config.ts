import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { discoveryVitePlugin } from "./src/lib/discovery/discoveryVitePlugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ["**/dist/**", "**/.git/**"],
    },
  },
  plugins: [
    react(),
    discoveryVitePlugin(),
    mode === 'development' && mcpPlugin(),
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
          // 2. Heavy standalone PDF & media compute engines (loaded strictly on-demand)
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs-vendor';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'jspdf-vendor';
          }
          if (id.includes('node_modules/html2canvas')) {
            return 'html2canvas-vendor';
          }
          if (id.includes('node_modules/fabric')) {
            return 'fabric-vendor';
          }
          if (id.includes('node_modules/tesseract.js')) {
            return 'tesseract-vendor';
          }
          if (id.includes('node_modules/docx')) {
            return 'docx-vendor';
          }
          if (id.includes('node_modules/@react-pdf')) {
            return 'react-pdf-vendor';
          }
          // 3. Isolated heavy 3D, Graph, and Visualization engines
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/@xyflow')) {
            return 'xyflow-vendor';
          }
          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }
          // 4. Large UI animation and drag-and-drop frameworks
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/@dnd-kit') || id.includes('node_modules/@hello-pangea/dnd')) {
            return 'dnd-vendor';
          }
          // 5. Utility & platform libraries
          if (id.includes('node_modules/@capacitor')) {
            return 'capacitor-vendor';
          }
          if (id.includes('node_modules/date-fns')) {
            return 'date-fns-vendor';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'confetti-vendor';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-vendor';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-vendor';
          }
          // 6. Core React runtime
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/')
          ) {
            return 'react-core';
          }
          // 7. General vendor fallback
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
      },
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
}));
