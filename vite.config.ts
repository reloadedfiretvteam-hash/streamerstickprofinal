import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Optimize for Cloudflare CDN
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
    // Source maps - set to true for production debugging, false for smaller bundle
    // Can be controlled via environment: sourcemap: process.env.NODE_ENV !== 'production'
    sourcemap: false,
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Lucide icons - separate chunk for better caching
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-vendor';
          }
          // Supabase - separate chunk
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          // Admin components - lazy loaded, separate chunk
          if (id.includes('/components/custom-admin/') || 
              (id.includes('/pages/') && (id.includes('Admin') || id.includes('Dashboard')))) {
            return 'admin-chunk';
          }
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        // Add content hash to filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit (current bundle: ~730KB)
    // Note: Manual chunks not splitting optimally due to single-page app architecture
    // Consider implementing lazy loading for admin routes to reduce initial bundle
    // Set to 900KB to avoid false warnings during development
    chunkSizeWarningLimit: 900,
    // Optimize asset inlining
    assetsInlineLimit: 4096, // 4kb
  },
  // Preview server configuration (for local testing)
  preview: {
    port: 3000,
    host: true,
  },
  // Dev server configuration
  server: {
    port: 5173,
    host: true,
  },
});
