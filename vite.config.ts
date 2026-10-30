import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { discoveryVitePlugin } from "./src/lib/discovery/discoveryVitePlugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
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
          // 1. Vite internal helpers, dynamic import preloader, and synthetic modules
          // MUST ALWAYS be placed into core vendor first to prevent vendor subchunks
          // (like jspdf-vendor) from stealing __vitePreload.
          if (id.includes('vite/') || id.includes('commonjsHelpers') || id.startsWith('\0')) {
            return 'vendor';
          }
          // 2. High-volume static education catalog (isolated from core application)
          if (id.includes('indianInstitutionsCatalog') || id.includes('indianEducationService')) {
            return 'indian-education-catalog';
          }
          // 3. Heavy standalone PDF engines (loaded strictly on-demand for PDF generation)
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs-vendor';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'jspdf-vendor';
          }
          if (id.includes('node_modules/html2canvas')) {
            return 'html2canvas-vendor';
          }
          // 4. Standalone heavy compute/rendering engines (loaded only when their specific route/tool is active)
          if (id.includes('node_modules/fabric')) {
            return 'fabric-vendor';
          }
          if (id.includes('node_modules/tesseract.js')) {
            return 'tesseract-vendor';
          }
          if (id.includes('node_modules/docx')) {
            return 'docx-vendor';
          }
          // 5. Heavy graphics, 3D, and flow libraries loaded on-demand
          if (id.includes('node_modules/@react-three') || id.includes('node_modules/three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/@xyflow')) {
            return 'xyflow-vendor';
          }
          if (id.includes('node_modules/@react-pdf')) {
            return 'react-pdf-vendor';
          }
          if (id.includes('node_modules/@aws-sdk')) {
            return 'aws-vendor';
          }
          if (id.includes('node_modules/jszip')) {
            return 'jszip-vendor';
          }
          if (id.includes('node_modules/@dnd-kit') || id.includes('node_modules/@hello-pangea')) {
            return 'dnd-vendor';
          }
          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }
          // 6. Keep React core runtime and remaining vendor libraries in core vendor
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
