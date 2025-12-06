// Script to set Cloudflare Pages environment variables

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }
  
  // First, list projects to find the correct one
  const projectsResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const projectsData = await projectsResponse.json();
  
  if (!projectsData.success) {
    console.error('Failed to list projects:', projectsData.errors);
    process.exit(1);
  }
  
  console.log('Found Cloudflare Pages projects:');
  projectsData.result.forEach(p => {
    console.log(`  - ${p.name} (${p.subdomain})`);
  });
  
  // Find the streamstickpro project
  const project = projectsData.result.find(p => 
    p.name.toLowerCase().includes('stream') || 
    p.name.toLowerCase().includes('stick') ||
    p.subdomain?.includes('stream')
  );
  
  if (!project) {
    console.log('\nNo matching project found. Available projects listed above.');
    console.log('Please specify the project name manually.');
    return;
  }
  
  console.log(`\nSelected project: ${project.name}`);
  console.log(`Project ID: ${project.id || 'N/A'}`);
  console.log(`Subdomain: ${project.subdomain}`);
  
  return project;
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
