import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = "reloadedfiretvteam-hash";
const repo = "streamerstickprofinal";
const branch = "clean-main";

const ignorePatterns = [
  'node_modules', '.git', 'dist', '.cache', '.local', '.replit', 'replit.nix',
  '.upm', '.config', 'package-lock.json', '.env', 'attached_assets', '.wrangler-secrets'
];

function shouldIgnore(filePath: string): boolean {
  return ignorePatterns.some(p => filePath.includes(p));
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (shouldIgnore(relativePath)) continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

async function main() {
  console.log("Getting current commit SHA...");
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const currentSha = ref.object.sha;
  console.log("Current commit:", currentSha);

  const { data: currentCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: currentSha });
  const baseTreeSha = currentCommit.tree.sha;

  console.log("Reading local files...");
  const files = getAllFiles(".");
  console.log(`Found ${files.length} files to push`);

  console.log("Creating blobs...");
  const tree: Array<{ path: string; mode: "100644"; type: "blob"; sha: string }> = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file);
      const base64Content = content.toString("base64");
      
      const { data: blob } = await octokit.git.createBlob({
        owner, repo,
        content: base64Content,
        encoding: "base64"
      });
      
      tree.push({ path: file, mode: "100644", type: "blob", sha: blob.sha });
      process.stdout.write(".");
    } catch (err) {
      console.log(`\nSkipped: ${file}`);
    }
  }
  console.log("\n");

  console.log("Creating tree...");
  const { data: newTree } = await octokit.git.createTree({
    owner, repo, tree, base_tree: baseTreeSha
  });

  console.log("Creating commit...");
  const { data: newCommit } = await octokit.git.createCommit({
    owner, repo,
    message: "Fix webhook 404: add /webhook/:uuid route for Stripe managed webhooks - " + new Date().toISOString(),
    tree: newTree.sha,
    parents: [currentSha]
  });

  console.log("Updating branch reference...");
  await octokit.git.updateRef({
    owner, repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha
  });

  console.log("\n✅ Successfully pushed to GitHub!");
  console.log(`Commit: ${newCommit.sha}`);
  console.log(`Branch: ${branch}`);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
