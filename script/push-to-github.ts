import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "reloadedfiretvteam-hash";
const REPO = "streamerstickprofinal";
const BRANCH = "clean-main";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Directories to EXCLUDE from sync
const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.cache',
  '.replit',
  '.upm',
  '.config',
  'generated',
  'attached_assets'
]);

// Files/patterns to EXCLUDE
const EXCLUDE_PATTERNS = [
  /\.replit$/,
  /replit\.nix$/,
  /\.gitattributes$/,
  /\.DS_Store$/,
  /\.env$/,
  /\.log$/
];

// Recursively get ALL files from the repository
function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      // Skip excluded directories
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) {
          continue;
        }
        files.push(...getAllFiles(fullPath, baseDir));
      } else {
        // Skip excluded file patterns
        const shouldExclude = EXCLUDE_PATTERNS.some(pattern => pattern.test(entry.name));
        if (shouldExclude) {
          continue;
        }
        files.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

async function pushAllFiles() {
  // Auto-discover ALL files
  const allFiles = getAllFiles(".");
  
  console.log(`Discovered ${allFiles.length} files in repository`);
  console.log("Pushing ALL files to GitHub...");

  try {
    // Get current branch reference
    console.log("Getting current branch reference...");
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    const currentCommitSha = ref.object.sha;
    console.log(`Current commit SHA: ${currentCommitSha}`);

    // Get current commit tree
    console.log("Getting current commit tree...");
    const { data: commit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: currentCommitSha,
    });
    const baseTreeSha = commit.tree.sha;

    // Create blobs for ALL files
    console.log("Creating blobs for ALL files...");
    const treeItems: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
    let skipped = 0;
    let processed = 0;

    for (const filePath of allFiles) {
      try {
        const content = fs.readFileSync(filePath);
        const base64Content = content.toString("base64");

        const { data: blob } = await octokit.git.createBlob({
          owner: OWNER,
          repo: REPO,
          content: base64Content,
          encoding: "base64",
        });

        treeItems.push({
          path: filePath,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        });

        processed++;
        if (processed % 25 === 0) {
          console.log(`Progress: ${processed} files...`);
        }
      } catch (error) {
        console.log(`Skipped (error): ${filePath}`);
        skipped++;
      }
    }

    console.log(`Created ${treeItems.length} blobs, creating tree...`);

    // Create new tree
    const { data: newTree } = await octokit.git.createTree({
      owner: OWNER,
      repo: REPO,
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // Create commit
    console.log("Creating commit...");
    const { data: newCommit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: `FULL SYNC: All ${treeItems.length} repository files`,
      tree: newTree.sha,
      parents: [currentCommitSha],
    });
    console.log(`New commit SHA: ${newCommit.sha}`);

    // Update branch reference
    console.log("Updating branch reference...");
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: newCommit.sha,
    });

    console.log(`\n✅ Successfully pushed ${treeItems.length} files to ${BRANCH}!`);
    console.log(`Skipped ${skipped} files (errors)`);
    console.log("GitHub Actions should now trigger the Cloudflare deployment.");

  } catch (error) {
    console.error("Failed to push to GitHub:", error);
    process.exit(1);
  }
}

pushAllFiles();
