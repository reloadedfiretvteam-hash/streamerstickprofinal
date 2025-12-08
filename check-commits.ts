import { getUncachableGitHubClient } from './server/github';

async function main() {
  const octokit = await getUncachableGitHubClient();
  
  const { data: commits } = await octokit.repos.listCommits({
    owner: 'reloadedfiretvteam-hash',
    repo: 'streamerstickprofinal',
    sha: 'clean-main',
    per_page: 5
  });
  
  console.log('Latest commits on clean-main:');
  commits.forEach(c => {
    console.log(`- ${c.sha.slice(0,7)}: ${c.commit.message}`);
  });
}

main().catch(console.error);
