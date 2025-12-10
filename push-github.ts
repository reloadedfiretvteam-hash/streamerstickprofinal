import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

async function pushToGitHub() {
  const token = process.env.GITHUB_TOKEN;
  const owner = 'reloadedfiretvteam-hash';
  const repo = 'streamerstickprofinal';
  const targetBranch = 'clean-main';
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    process.exit(1);
  }
  
  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('✅ Authenticated as:', user.login);
    
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${targetBranch}`
    });
    const baseSha = ref.object.sha;
    
    const { data: baseCommit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: baseSha
    });
    
    const filesToInclude = ['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'tailwind.config.ts', 'drizzle.config.ts', 'replit.md'];
    const dirsToInclude = ['client', 'server', 'shared'];
    
    const getAllFiles = (dir: string, base: string = ''): { path: string; content: string }[] => {
      const files: { path: string; content: string }[] = [];
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.local') continue;
        const fullPath = path.join(dir, item);
        const relativePath = base ? `${base}/${item}` : item;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...getAllFiles(fullPath, relativePath));
        } else {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            files.push({ path: relativePath, content });
          } catch (e) {}
        }
      }
      return files;
    };
    
    const treeItems: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }> = [];
    
    for (const file of filesToInclude) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data: blob } = await octokit.git.createBlob({
          owner, repo,
          content: Buffer.from(content).toString('base64'),
          encoding: 'base64'
        });
        treeItems.push({ path: file, mode: '100644', type: 'blob', sha: blob.sha });
      }
    }
    
    for (const dir of dirsToInclude) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        const files = getAllFiles(dirPath, dir);
        for (const file of files) {
          const { data: blob } = await octokit.git.createBlob({
            owner, repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64'
          });
          treeItems.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
        }
      }
    }
    
    console.log(`📦 Prepared ${treeItems.length} files for push`);
    
    const { data: tree } = await octokit.git.createTree({
      owner, repo,
      base_tree: baseCommit.tree.sha,
      tree: treeItems
    });
    
    const { data: newCommit } = await octokit.git.createCommit({
      owner, repo,
      message: `Fix: Canonical URL consistency - add trailing slashes for Google indexing`,
      tree: tree.sha,
      parents: [baseSha]
    });
    
    await octokit.git.updateRef({
      owner, repo,
      ref: `heads/${targetBranch}`,
      sha: newCommit.sha
    });
    
    console.log('\n✅ PUSH SUCCESSFUL!');
    console.log(`📝 Commit: ${newCommit.sha.substring(0, 7)}`);
    console.log(`🔗 https://github.com/${owner}/${repo}/commit/${newCommit.sha}`);
    console.log(`📊 Files: ${treeItems.length}`);
    
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

pushToGitHub();
