import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isReplit = !!process.env.REPL_ID;
const isProduction = process.env.NODE_ENV === "production";

async function getReplitPlugins() {
  if (!isReplit || isProduction) return [];
  
  try {
    const plugins = [];
    
    try {
      const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
      plugins.push(runtimeErrorOverlay());
    } catch {}
    
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      plugins.push(cartographer());
    } catch {}
    
    try {
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");
      plugins.push(devBanner());
    } catch {}
    
    return plugins;
  } catch {
    return [];
  }
}

async function getMetaImagesPlugin() {
  try {
    const { metaImagesPlugin } = await import("./vite-plugin-meta-images");
    return metaImagesPlugin();
  } catch {
    return null;
  }
}

export default defineConfig(async () => {
  const replitPlugins = await getReplitPlugins();
  const metaPlugin = await getMetaImagesPlugin();
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(metaPlugin ? [metaPlugin] : []),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    css: {
      postcss: {
        plugins: [],
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
