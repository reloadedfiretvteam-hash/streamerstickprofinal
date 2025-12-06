import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir, writeFile, cp } from "fs/promises";
import path from "path";

async function buildWorker() {
  await rm("dist", { recursive: true, force: true });
  await mkdir("dist", { recursive: true });

  console.log("Building client with Vite...");
  await viteBuild({
    build: {
      outDir: path.resolve(process.cwd(), "dist"),
      emptyOutDir: false,
    },
  });

  console.log("Building Cloudflare Worker...");
  await esbuild({
    entryPoints: ["worker/index.ts"],
    platform: "browser",
    target: "esnext",
    bundle: true,
    format: "esm",
    outfile: "dist/_worker.js",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
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
}

buildWorker().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
