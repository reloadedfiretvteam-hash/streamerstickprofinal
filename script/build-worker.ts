import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir, writeFile, cp } from "fs/promises";
import path from "path";

async function buildWorker() {
  await rm("dist", { recursive: true, force: true });
  await mkdir("dist", { recursive: true });

  console.log("Building client with Vite...");
  await viteBuild({
    configFile: path.resolve(process.cwd(), "vite.config.cloudflare.ts"),
    build: {
      outDir: path.resolve(process.cwd(), "dist"),
      emptyOutDir: false,
    },
  });

  // Inject environment variables at build time
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL || "",
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
    RESEND_API_KEY: process.env.RESEND_API_KEY || "",
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "noreply@streamstickpro.com",
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || "",
  };

  // Create define object for esbuild to inject environment variables
  const define: Record<string, string> = {
    "process.env.NODE_ENV": '"production"',
  };

  // Inject each env var
  Object.entries(envVars).forEach(([key, value]) => {
    define[`process.env.${key}`] = JSON.stringify(value);
  });

  console.log("Building Cloudflare Worker with environment variables...");
  await esbuild({
    entryPoints: ["worker/index.ts"],
    platform: "browser",
    target: "esnext",
    bundle: true,
    format: "esm",
    outfile: "dist/_worker.js",
    define,
    minify: true,
    sourcemap: false,
    conditions: ["workerd", "worker", "browser"],
    mainFields: ["browser", "module", "main"],
    logLevel: "info",
    external: ["node:*"],
  });

  console.log("Creating _routes.json for Cloudflare Pages...");
  const routesJson = {
    version: 1,
    include: ["/api/*"],
    exclude: ["/assets/*", "/*.css", "/*.js", "/*.png", "/*.jpg", "/*.svg", "/*.ico", "/*.woff", "/*.woff2"]
  };
  await writeFile("dist/_routes.json", JSON.stringify(routesJson, null, 2));

  console.log("Build complete!");
  console.log("Output:");
  console.log("  - dist/ (static assets + worker)");
  console.log("  - Environment variables injected at build time");
}

buildWorker().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
