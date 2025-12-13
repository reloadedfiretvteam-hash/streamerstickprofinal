import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const isCloudflare = process.env.CF_PAGES === "1" || existsSync("wrangler.toml");

const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildCloudflare() {
  await rm("dist", { recursive: true, force: true });
  await mkdir("dist", { recursive: true });

  console.log("Building client with Vite (Cloudflare config)...");
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
    include: ["/api/*"],
    exclude: [
      "/assets/*", 
      "/*.css", 
      "/*.js", 
      "/*.png", 
      "/*.jpg", 
      "/*.svg", 
      "/*.ico", 
      "/*.woff", 
      "/*.woff2",
      "/*.xml",
      "/*.txt",
      "/googledf2a7b91b7b9494f.html",
      "/BingSiteAuth.xml",
      "/sitemap.xml",
      "/robots.txt"
    ]
  };
  await writeFile("dist/_routes.json", JSON.stringify(routesJson, null, 2));

  console.log("Pre-rendering blog posts for SEO...");
  try {
    const { execSync } = await import("child_process");
    execSync("npx tsx scripts/prerender-blog.ts", { 
      stdio: "inherit",
      env: {
        ...process.env,
        SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      }
    });
    console.log("Blog pre-rendering complete!");
  } catch (err) {
    console.warn("Blog pre-rendering skipped (Supabase credentials may be missing)");
  }

  console.log("Cloudflare Pages build complete!");
}

async function buildNode() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

async function buildAll() {
  if (isCloudflare) {
    console.log("Detected Cloudflare environment, building for Pages...");
    await buildCloudflare();
  } else {
    console.log("Building for Node.js...");
    await buildNode();
  }
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
