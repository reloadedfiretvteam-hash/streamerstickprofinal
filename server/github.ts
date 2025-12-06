import { Octokit } from '@octokit/rest';

function isReplitEnvironment(): boolean {
  return !!(process.env.REPLIT_CONNECTORS_HOSTNAME && 
    (process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL));
}

async function getReplitCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  const accessToken = connectionSettings?.settings?.access_token || 
                      connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }

  return {
    accessToken
  };
}

function getEnvCredentials() {
  const accessToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  
  return { accessToken };
}

async function getCredentials() {
  if (isReplitEnvironment()) {
    return getReplitCredentials();
  }
  return getEnvCredentials();
}

export async function getUncachableGitHubClient() {
  const { accessToken } = await getCredentials();
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
