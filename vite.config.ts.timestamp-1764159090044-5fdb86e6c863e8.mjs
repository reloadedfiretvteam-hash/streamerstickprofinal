// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    // Optimize for Cloudflare CDN
    target: "es2015",
    minify: "esbuild",
    cssMinify: true,
    // Source maps - set to true for production debugging, false for smaller bundle
    // Can be controlled via environment: sourcemap: process.env.NODE_ENV !== 'production'
    sourcemap: false,
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "lucide-vendor": ["lucide-react"],
          "supabase-vendor": ["@supabase/supabase-js"]
        },
        // Add content hash to filenames for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // Increase chunk size warning limit for better optimization
    chunkSizeWarningLimit: 1e3,
    // Optimize asset inlining
    assetsInlineLimit: 4096
    // 4kb
  },
  // Preview server configuration (for local testing)
  preview: {
    port: 3e3,
    host: true
  },
  // Dev server configuration
  server: {
    port: 5173,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gT3B0aW1pemUgZm9yIENsb3VkZmxhcmUgQ0ROXG4gICAgdGFyZ2V0OiAnZXMyMDE1JyxcbiAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgLy8gU291cmNlIG1hcHMgLSBzZXQgdG8gdHJ1ZSBmb3IgcHJvZHVjdGlvbiBkZWJ1Z2dpbmcsIGZhbHNlIGZvciBzbWFsbGVyIGJ1bmRsZVxuICAgIC8vIENhbiBiZSBjb250cm9sbGVkIHZpYSBlbnZpcm9ubWVudDogc291cmNlbWFwOiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gT3B0aW1pemUgY2h1bmsgc3BsaXR0aW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICAnbHVjaWRlLXZlbmRvcic6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgICAgICAgJ3N1cGFiYXNlLXZlbmRvcic6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIEFkZCBjb250ZW50IGhhc2ggdG8gZmlsZW5hbWVzIGZvciBjYWNoZSBidXN0aW5nXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gSW5jcmVhc2UgY2h1bmsgc2l6ZSB3YXJuaW5nIGxpbWl0IGZvciBiZXR0ZXIgb3B0aW1pemF0aW9uXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgIC8vIE9wdGltaXplIGFzc2V0IGlubGluaW5nXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsIC8vIDRrYlxuICB9LFxuICAvLyBQcmV2aWV3IHNlcnZlciBjb25maWd1cmF0aW9uIChmb3IgbG9jYWwgdGVzdGluZylcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgaG9zdDogdHJ1ZSxcbiAgfSxcbiAgLy8gRGV2IHNlcnZlciBjb25maWd1cmF0aW9uXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBO0FBQUE7QUFBQSxJQUdYLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLFFBRU4sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDckMsaUJBQWlCLENBQUMsY0FBYztBQUFBLFVBQ2hDLG1CQUFtQixDQUFDLHVCQUF1QjtBQUFBLFFBQzdDO0FBQUE7QUFBQSxRQUVBLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQTtBQUFBLElBRXZCLG1CQUFtQjtBQUFBO0FBQUEsRUFDckI7QUFBQTtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQTtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
