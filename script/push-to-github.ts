import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "reloadedfiretvteam-hash";
const REPO = "streamerstickprofinal";
const BRANCH = "clean-main";

if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const EXCLUDE_DIRS = new Set([
  'node_modules', 'dist', '.git', '.cache', '.replit', '.upm', '.config', 
  'generated', '.wrangler-secrets', 'attached_assets'
]);

const EXCLUDE_PATTERNS = [
  /\.replit$/, /replit\.nix$/, /\.DS_Store$/, /\.env$/, /\.log$/,
  /\.gitattributes$/, /Pasted-.*\.txt$/, /\.lock$/
];

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.has(entry.name)) {
          files.push(...getAllFiles(fullPath, baseDir));
        }
      } else {
        if (!EXCLUDE_PATTERNS.some(p => p.test(entry.name))) {
          files.push(relativePath);
        }
      }
    }
  } catch {}
  return files;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pushAllFilesInOneCommit() {
  const allFiles = getAllFiles(".");
  console.log(`Found ${allFiles.length} files to push in ONE commit\n`);

  const { data: ref } = await octokit.git.getRef({
    owner: OWNER, repo: REPO, ref: `heads/${BRANCH}`
  });
  const currentSha = ref.object.sha;
  console.log(`Current commit: ${currentSha}\n`);

  const { data: commit } = await octokit.git.getCommit({
    owner: OWNER, repo: REPO, commit_sha: currentSha
  });
  const baseTreeSha = commit.tree.sha;

  console.log("Creating blobs with throttling...");
  const treeItems: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
  let processed = 0;
  let skipped = 0;
  
  const CONCURRENCY = 5;
  
  for (let i = 0; i < allFiles.length; i += CONCURRENCY) {
    const batch = allFiles.slice(i, i + CONCURRENCY);
    
    const results = await Promise.all(batch.map(async (filePath) => {
      try {
        const content = fs.readFileSync(filePath);
        const { data: blob } = await octokit.git.createBlob({
          owner: OWNER, repo: REPO,
          content: content.toString("base64"),
          encoding: "base64"
        });
        return { path: filePath, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
      } catch {
        skipped++;
        return null;
      }
    }));
    
    for (const item of results) {
      if (item) treeItems.push(item);
    }
    
    processed += batch.length;
    if (processed % 50 === 0 || processed === allFiles.length) {
      console.log(`  Progress: ${processed}/${allFiles.length} files`);
    }
    
    await sleep(100);
  }

  console.log(`\nCreating tree with ${treeItems.length} files...`);
  const { data: newTree } = await octokit.git.createTree({
    owner: OWNER, repo: REPO, base_tree: baseTreeSha, tree: treeItems
  });

  console.log("Creating commit...");
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER, repo: REPO,
    message: `Full sync: All ${treeItems.length} files`,
    tree: newTree.sha,
    parents: [currentSha]
  });

  console.log("Updating branch...");
  await octokit.git.updateRef({
    owner: OWNER, repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha
  });

  console.log(`\n✅ Successfully pushed ${treeItems.length} files in ONE commit!`);
  console.log(`Skipped: ${skipped} files`);
  console.log(`New commit: ${newCommit.sha}`);
}

pushAllFilesInOneCommit().catch(err => {
  console.error("Push failed:", err.message);
  process.exit(1);
});
