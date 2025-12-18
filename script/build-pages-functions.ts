import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir, cp } from "fs/promises";
import path from "path";

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

  console.log("Copying functions directory...");
  await cp("functions", "dist/functions", { recursive: true });

  console.log("Build complete!");
  console.log("Output: dist/ (with /functions directory for Pages Functions)");
}

buildProject().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
