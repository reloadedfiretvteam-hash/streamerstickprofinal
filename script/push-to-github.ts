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
  /\.gitattributes$/, /Pasted-.*\.txt$/
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

async function pushInBatches() {
  const allFiles = getAllFiles(".");
  console.log(`Found ${allFiles.length} files to push\n`);

  const { data: ref } = await octokit.git.getRef({
    owner: OWNER, repo: REPO, ref: `heads/${BRANCH}`
  });
  let currentSha = ref.object.sha;
  console.log(`Current commit: ${currentSha}\n`);

  const BATCH_SIZE = 100;
  const batches = [];
  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    batches.push(allFiles.slice(i, i + BATCH_SIZE));
  }

  console.log(`Pushing in ${batches.length} batches of up to ${BATCH_SIZE} files each...\n`);

  for (let batchNum = 0; batchNum < batches.length; batchNum++) {
    const batch = batches[batchNum];
    console.log(`Batch ${batchNum + 1}/${batches.length}: ${batch.length} files`);

    const { data: commit } = await octokit.git.getCommit({
      owner: OWNER, repo: REPO, commit_sha: currentSha
    });
    const baseTreeSha = commit.tree.sha;

    const treeItems: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
    
    for (const filePath of batch) {
      try {
        const content = fs.readFileSync(filePath);
        const { data: blob } = await octokit.git.createBlob({
          owner: OWNER, repo: REPO,
          content: content.toString("base64"),
          encoding: "base64"
        });
        treeItems.push({ path: filePath, mode: "100644", type: "blob", sha: blob.sha });
      } catch (e: any) {
        console.log(`  Skipped: ${filePath}`);
      }
    }

    if (treeItems.length === 0) continue;

    const { data: newTree } = await octokit.git.createTree({
      owner: OWNER, repo: REPO, base_tree: baseTreeSha, tree: treeItems
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner: OWNER, repo: REPO,
      message: `Sync batch ${batchNum + 1}/${batches.length}`,
      tree: newTree.sha,
      parents: [currentSha]
    });

    await octokit.git.updateRef({
      owner: OWNER, repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: newCommit.sha
    });

    currentSha = newCommit.sha;
    console.log(`  ✓ Committed ${treeItems.length} files`);
  }

  console.log(`\n✅ All ${allFiles.length} files pushed to ${BRANCH}!`);
  console.log("Cloudflare deployment should trigger automatically.");
}

pushInBatches().catch(err => {
  console.error("Push failed:", err.message);
  process.exit(1);
});
