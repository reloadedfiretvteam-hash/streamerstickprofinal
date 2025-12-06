// Script to trigger a new Cloudflare Pages deployment

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }
  
  const projectName = 'streamerstickpro-live';
  
  console.log(`Getting latest deployment for project: ${projectName}\n`);
  
  const deploymentsResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const deploymentsData = await deploymentsResponse.json();
  
  if (!deploymentsData.success) {
    console.error('Failed to get deployments:', deploymentsData.errors);
    process.exit(1);
  }
  
  if (!deploymentsData.result || deploymentsData.result.length === 0) {
    console.log('No deployments found for this project.');
    console.log('The next push to the GitHub repository will trigger a new deployment.');
    process.exit(0);
  }
  
  const latestDeployment = deploymentsData.result[0];
  
  console.log('Latest deployment:');
  console.log(`  ID: ${latestDeployment.id}`);
  console.log(`  URL: ${latestDeployment.url}`);
  console.log(`  Status: ${latestDeployment.latest_stage?.name || 'unknown'}`);
  console.log(`  Created: ${latestDeployment.created_on}`);
  console.log(`  Branch: ${latestDeployment.deployment_trigger?.metadata?.branch || 'unknown'}`);
  
  console.log(`\nRetrying deployment ID: ${latestDeployment.id}...\n`);
  
  const retryResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments/${latestDeployment.id}/retry`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const retryData = await retryResponse.json();
  
  if (!retryData.success) {
    console.error('Failed to retry deployment:', retryData.errors);
    console.log('\n📝 Alternative: Push a new commit to trigger a fresh deployment.');
    console.log('   The environment variables have already been set in Cloudflare.');
    process.exit(1);
  }
  
  console.log('✅ Deployment retry triggered successfully!\n');
  console.log('New deployment:');
  console.log(`  ID: ${retryData.result.id}`);
  console.log(`  URL: ${retryData.result.url}`);
  
  console.log('\n📝 Note: Wait 2-5 minutes for the deployment to complete.');
  console.log('   Then verify at: https://streamerstickpro-live.pages.dev');
}

main().catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
