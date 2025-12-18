import { Octokit } from '@octokit/rest';

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const owner = 'reloadedfiretvteam-hash';
  const repo = 'streamerstickprofinal';
  
  // Branches to keep
  const protectedBranches = ['main', 'clean-main', 'production', 'master', 'develop', 'staging'];
  
  console.log('=== GitHub Repository Cleanup ===\n');
  console.log(`Repository: ${owner}/${repo}\n`);
  
  // 1. Close all open PRs
  console.log('--- CLOSING OPEN PULL REQUESTS ---\n');
  const { data: openPRs } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 100
  });
  
  console.log(`Found ${openPRs.length} open PRs to close.\n`);
  
  for (const pr of openPRs) {
    try {
      await octokit.pulls.update({
        owner,
        repo,
        pull_number: pr.number,
        state: 'closed'
      });
      console.log(`✅ Closed PR #${pr.number}: ${pr.title}`);
    } catch (err) {
      console.log(`❌ Failed to close PR #${pr.number}: ${err.message}`);
    }
  }
  
  // 2. Delete all copilot/* branches (stale feature branches)
  console.log('\n--- DELETING STALE BRANCHES ---\n');
  
  const { data: branches } = await octokit.repos.listBranches({
    owner,
    repo,
    per_page: 100
  });
  
  const branchesToDelete = branches.filter(b => 
    b.name.startsWith('copilot/') && 
    !protectedBranches.includes(b.name) &&
    !b.protected
  );
  
  console.log(`Found ${branchesToDelete.length} copilot branches to delete.\n`);
  
  for (const branch of branchesToDelete) {
    try {
      await octokit.git.deleteRef({
        owner,
        repo,
        ref: `heads/${branch.name}`
      });
      console.log(`✅ Deleted branch: ${branch.name}`);
    } catch (err) {
      console.log(`❌ Failed to delete branch ${branch.name}: ${err.message}`);
    }
  }
  
  // 3. Summary
  console.log('\n--- FINAL STATUS ---\n');
  
  const { data: remainingBranches } = await octokit.repos.listBranches({
    owner,
    repo,
    per_page: 100
  });
  
  const { data: remainingOpenPRs } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 100
  });
  
  console.log(`Remaining branches: ${remainingBranches.length}`);
  console.log('Active branches:');
  for (const branch of remainingBranches) {
    console.log(`  - ${branch.name}`);
  }
  
  console.log(`\nRemaining open PRs: ${remainingOpenPRs.length}`);
  
  console.log('\n=== Cleanup Complete ===');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
