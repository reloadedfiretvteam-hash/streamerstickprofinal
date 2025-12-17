import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir, writeFile } from "fs/promises";
import { spawn } from "child_process";
import path from "path";

async function runPrerenderBlog(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("Running blog prerender script...");
    const child = spawn("npx", ["tsx", "scripts/prerender-blog.ts"], {
      stdio: "inherit",
      shell: true,
    });
    
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.warn(`Prerender exited with code ${code}, continuing...`);
        resolve();
      }
    });
    
    child.on("error", (err) => {
      console.warn("Prerender error:", err.message);
      resolve();
    });
  });
}

async function buildProject() {
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
    include: ["/api/*", "/blog", "/blog/*", "/checkout", "/success", "/admin", "/admin/*", "/shadow-services"],
    exclude: ["/assets/*", "/sitemap.xml", "/robots.txt", "/*.css", "/*.js", "/*.png", "/*.jpg", "/*.svg", "/*.ico", "/*.woff", "/*.woff2"]
  };
  await writeFile("dist/_routes.json", JSON.stringify(routesJson, null, 2));

  console.log("Prerendering blog posts for SEO...");
  await runPrerenderBlog();

  console.log("Build complete!");
  console.log("Output:");
  console.log("  - dist/_worker.js (Cloudflare Worker)");
  console.log("  - dist/_routes.json (routing config)");
  console.log("  - dist/blog/ (prerendered blog posts for SEO)");
}

buildProject().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
