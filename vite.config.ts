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
    // Enable source maps for debugging (can be disabled for production)
    sourcemap: false,
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lucide-vendor': ['lucide-react'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
        // Add content hash to filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit for better optimization
    chunkSizeWarningLimit: 1000,
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
