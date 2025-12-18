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
  
  console.log('=== GitHub Repository Cleanup Report ===\n');
  console.log(`Repository: ${owner}/${repo}\n`);
  
  // 1. List all branches
  console.log('--- BRANCHES ---');
  const { data: branches } = await octokit.repos.listBranches({
    owner,
    repo,
    per_page: 100
  });
  console.log(`Total branches: ${branches.length}\n`);
  for (const branch of branches) {
    console.log(`  - ${branch.name}${branch.protected ? ' (protected)' : ''}`);
  }
  
  // 2. List all pull requests (open and closed)
  console.log('\n--- OPEN PULL REQUESTS ---');
  const { data: openPRs } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 100
  });
  console.log(`Open PRs: ${openPRs.length}\n`);
  for (const pr of openPRs) {
    console.log(`  PR #${pr.number}: ${pr.title}`);
    console.log(`    State: ${pr.state} | Base: ${pr.base.ref} ← ${pr.head.ref}`);
    console.log(`    Created: ${pr.created_at} | User: ${pr.user.login}`);
    console.log(`    Mergeable: ${pr.mergeable_state || 'unknown'}`);
    console.log('');
  }
  
  console.log('\n--- RECENT CLOSED/MERGED PULL REQUESTS (last 30) ---');
  const { data: closedPRs } = await octokit.pulls.list({
    owner,
    repo,
    state: 'closed',
    per_page: 30,
    sort: 'updated',
    direction: 'desc'
  });
  console.log(`Recent closed PRs: ${closedPRs.length}\n`);
  for (const pr of closedPRs) {
    const status = pr.merged_at ? 'MERGED' : 'CLOSED (not merged)';
    console.log(`  PR #${pr.number}: ${pr.title} [${status}]`);
    console.log(`    Base: ${pr.base.ref} ← ${pr.head.ref}`);
    console.log(`    Closed: ${pr.closed_at}`);
    console.log('');
  }
  
  // 3. Identify stale/orphan branches (not associated with open PRs)
  console.log('\n--- BRANCH ANALYSIS ---');
  const activePRBranches = new Set(openPRs.map(pr => pr.head.ref));
  const protectedBranches = ['main', 'master', 'clean-main', 'develop', 'staging', 'production'];
  
  const staleBranches = branches.filter(b => 
    !protectedBranches.includes(b.name) && 
    !activePRBranches.has(b.name) &&
    !b.protected
  );
  
  if (staleBranches.length > 0) {
    console.log(`Potentially stale branches (${staleBranches.length}):`);
    for (const branch of staleBranches) {
      console.log(`  - ${branch.name}`);
    }
  } else {
    console.log('No stale branches detected.');
  }
  
  // 4. Summary and recommendations
  console.log('\n--- CLEANUP RECOMMENDATIONS ---');
  if (openPRs.length > 0) {
    console.log(`\n1. Open PRs to review (${openPRs.length}):`);
    for (const pr of openPRs) {
      console.log(`   - Close or merge PR #${pr.number}: ${pr.title}`);
    }
  }
  
  if (staleBranches.length > 0) {
    console.log(`\n2. Stale branches to consider deleting (${staleBranches.length}):`);
    for (const branch of staleBranches) {
      console.log(`   - ${branch.name}`);
    }
  }
  
  console.log('\n=== End of Report ===');
  
  return { branches, openPRs, closedPRs, staleBranches };
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
