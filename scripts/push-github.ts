import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function main() {
  try {
    const { data: user } = await octokit.users.getAuthenticated();
    console.log("Authenticated as:", user.login);
    
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({ per_page: 100 });
    console.log("\nYour repositories:");
    repos.forEach(r => console.log(` - ${r.full_name} (${r.default_branch})`));
    
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

main();
