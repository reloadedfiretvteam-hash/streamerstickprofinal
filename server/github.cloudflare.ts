import { Octokit } from '@octokit/rest';

export async function getUncachableGitHubClient() {
  const accessToken = process.env.GITHUB_TOKEN;
  
  if (!accessToken) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  return new Octokit({ auth: accessToken });
}

export async function getGitHubUser() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  return user;
}

export async function listGitHubRepos(perPage: number = 30) {
  const octokit = await getUncachableGitHubClient();
  const { data: repos } = await octokit.repos.listForAuthenticatedUser({ per_page: perPage });
  return repos;
}
