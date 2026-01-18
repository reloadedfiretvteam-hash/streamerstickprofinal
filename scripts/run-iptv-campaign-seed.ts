/**
 * Run IPTV Setup Campaign Posts Seeder
 * Usage: tsx scripts/run-iptv-campaign-seed.ts
 */

import { seedIPTVSetupCampaign } from '../server/seedIPTVSetupCampaign';

async function main() {
  console.log("🚀 Starting IPTV Setup Campaign Posts Generation...\n");
  
  try {
    const results = await seedIPTVSetupCampaign();
    
    console.log("\n📊 Final Results:");
    console.log(`   ✅ Created: ${results.success} posts`);
    console.log(`   ⏭️  Skipped: ${results.skipped} posts`);
    console.log(`   ❌ Errors: ${results.errors} posts`);
    console.log(`   📝 Total: ${results.total} posts`);
    
    if (results.success > 0) {
      console.log(`\n🎉 Success! ${results.success} new campaign posts have been created!`);
      console.log(`🔗 All posts link back to https://streamstickpro.com`);
      console.log(`🎁 All posts promote free trials and drive traffic to your website!`);
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Failed to generate campaign posts:", error.message);
    process.exit(1);
  }
}

main();
