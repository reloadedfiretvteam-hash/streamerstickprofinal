import { build as viteBuild } from "vite";
import { rm, mkdir, cp } from "fs/promises";
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

  console.log("Copying Pages Functions...");
  await cp("functions", "dist/functions", { recursive: true });

  console.log("Prerendering blog posts for SEO...");
  await runPrerenderBlog();

  console.log("Build complete!");
  console.log("Output:");
  console.log("  - dist/ (static assets + functions directory)");
  console.log("  - dist/blog/ (prerendered blog posts for SEO)");
}

buildProject().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
