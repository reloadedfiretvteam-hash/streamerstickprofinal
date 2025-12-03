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
        manualChunks: (id) => {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "lucide-vendor";
          }
          if (id.includes("node_modules/@supabase")) {
            return "supabase-vendor";
          }
          if (id.includes("/components/custom-admin/") || id.includes("/pages/") && (id.includes("Admin") || id.includes("Dashboard"))) {
            return "admin-chunk";
          }
          if (id.includes("node_modules")) {
            return "vendor-misc";
          }
        },
        // Add content hash to filenames for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // Increase chunk size warning limit (current bundle: ~730KB)
    // Note: Manual chunks not splitting optimally due to single-page app architecture
    // Consider implementing lazy loading for admin routes to reduce initial bundle
    // Set to 900KB to avoid false warnings during development
    chunkSizeWarningLimit: 900,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gT3B0aW1pemUgZm9yIENsb3VkZmxhcmUgQ0ROXG4gICAgdGFyZ2V0OiAnZXMyMDE1JyxcbiAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgLy8gU291cmNlIG1hcHMgLSBzZXQgdG8gdHJ1ZSBmb3IgcHJvZHVjdGlvbiBkZWJ1Z2dpbmcsIGZhbHNlIGZvciBzbWFsbGVyIGJ1bmRsZVxuICAgIC8vIENhbiBiZSBjb250cm9sbGVkIHZpYSBlbnZpcm9ubWVudDogc291cmNlbWFwOiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gT3B0aW1pemUgY2h1bmsgc3BsaXR0aW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xuICAgICAgICBtYW51YWxDaHVua3M6IChpZCkgPT4ge1xuICAgICAgICAgIC8vIENvcmUgUmVhY3QgbGlicmFyaWVzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LWRvbScpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3JlYWN0LXZlbmRvcic7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEx1Y2lkZSBpY29ucyAtIHNlcGFyYXRlIGNodW5rIGZvciBiZXR0ZXIgY2FjaGluZ1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2x1Y2lkZS12ZW5kb3InO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBTdXBhYmFzZSAtIHNlcGFyYXRlIGNodW5rXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHN1cGFiYXNlJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnc3VwYWJhc2UtdmVuZG9yJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQWRtaW4gY29tcG9uZW50cyAtIGxhenkgbG9hZGVkLCBzZXBhcmF0ZSBjaHVua1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL2NvbXBvbmVudHMvY3VzdG9tLWFkbWluLycpIHx8IFxuICAgICAgICAgICAgICAoaWQuaW5jbHVkZXMoJy9wYWdlcy8nKSAmJiAoaWQuaW5jbHVkZXMoJ0FkbWluJykgfHwgaWQuaW5jbHVkZXMoJ0Rhc2hib2FyZCcpKSkpIHtcbiAgICAgICAgICAgIHJldHVybiAnYWRtaW4tY2h1bmsnO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPdGhlciBub2RlX21vZHVsZXNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1taXNjJztcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEFkZCBjb250ZW50IGhhc2ggdG8gZmlsZW5hbWVzIGZvciBjYWNoZSBidXN0aW5nXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gSW5jcmVhc2UgY2h1bmsgc2l6ZSB3YXJuaW5nIGxpbWl0IChjdXJyZW50IGJ1bmRsZTogfjczMEtCKVxuICAgIC8vIE5vdGU6IE1hbnVhbCBjaHVua3Mgbm90IHNwbGl0dGluZyBvcHRpbWFsbHkgZHVlIHRvIHNpbmdsZS1wYWdlIGFwcCBhcmNoaXRlY3R1cmVcbiAgICAvLyBDb25zaWRlciBpbXBsZW1lbnRpbmcgbGF6eSBsb2FkaW5nIGZvciBhZG1pbiByb3V0ZXMgdG8gcmVkdWNlIGluaXRpYWwgYnVuZGxlXG4gICAgLy8gU2V0IHRvIDkwMEtCIHRvIGF2b2lkIGZhbHNlIHdhcm5pbmdzIGR1cmluZyBkZXZlbG9wbWVudFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogOTAwLFxuICAgIC8vIE9wdGltaXplIGFzc2V0IGlubGluaW5nXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsIC8vIDRrYlxuICB9LFxuICAvLyBQcmV2aWV3IHNlcnZlciBjb25maWd1cmF0aW9uIChmb3IgbG9jYWwgdGVzdGluZylcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgaG9zdDogdHJ1ZSxcbiAgfSxcbiAgLy8gRGV2IHNlcnZlciBjb25maWd1cmF0aW9uXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBO0FBQUE7QUFBQSxJQUdYLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLFFBRU4sY0FBYyxDQUFDLE9BQU87QUFFcEIsY0FBSSxHQUFHLFNBQVMsb0JBQW9CLEtBQUssR0FBRyxTQUFTLHdCQUF3QixHQUFHO0FBQzlFLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLDJCQUEyQixHQUFHO0FBQzVDLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLHdCQUF3QixHQUFHO0FBQ3pDLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLDJCQUEyQixLQUN0QyxHQUFHLFNBQVMsU0FBUyxNQUFNLEdBQUcsU0FBUyxPQUFPLEtBQUssR0FBRyxTQUFTLFdBQVcsSUFBSztBQUNsRixtQkFBTztBQUFBLFVBQ1Q7QUFFQSxjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBO0FBQUEsUUFFQSxnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsdUJBQXVCO0FBQUE7QUFBQSxJQUV2QixtQkFBbUI7QUFBQTtBQUFBLEVBQ3JCO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
