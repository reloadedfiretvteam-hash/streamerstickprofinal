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

  console.log("Generating 25K location pages JSON (sitemap + meta fallback)...");
  const genLocationPages = spawn("npx", ["tsx", "scripts/generate-location-pages-json.ts"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });
  await new Promise<void>((res) => {
    genLocationPages.on("close", (code) => {
      if (code === 0) res();
      else {
        console.warn("generate-location-pages-json failed (e.g. OOM); continuing. CI will retry with more memory.");
        res();
      }
    });
    genLocationPages.on("error", () => res());
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
  // Worker must receive: API, redirects, sitemap, location pages (/l/*), and SPA fallback. Use include /* so redirects + sitemap.xml + /l/* hit worker.
  const routesJson = {
    version: 1,
    include: ["/*"],
    exclude: ["/assets/*", "/*.css", "/*.js", "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.webp", "/*.svg", "/*.ico", "/*.woff", "/*.woff2", "/*.ttf", "/BingSiteAuth.xml", "/googledf2a7b91b7b9494f.html", "/752d1cf8edc045568943005a03892968.txt", "/59748a36d4494392a7d863abcf2d3b52.txt", "/696320d78e6e55d1584eca38a9d864b5.txt"]
  };
  await writeFile("dist/_routes.json", JSON.stringify(routesJson, null, 2));

  console.log("Prerendering blog posts for SEO...");
  await runPrerenderBlog();

  console.log("Build complete!");
  console.log("Output:");
  console.log("  - dist/_worker.js (Cloudflare Worker)");
  console.log("  - dist/_routes.json (routing config)");
  console.log("  - dist/location-pages.json (25K URLs + meta for sitemap and /l/ pages)");
  console.log("  - dist/blog/ (prerendered blog posts for SEO)");
}

buildProject().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
