import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

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

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

const filesToPush = [
  // Root config files
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'components.json',
  'wrangler.toml',
  '.nvmrc',
  
  // Worker files
  'worker/index.ts',
  'worker/db.ts',
  'worker/storage.ts',
  'worker/email.ts',
  'worker/helpers.ts',
  'worker/routes/products.ts',
  'worker/routes/checkout.ts',
  'worker/routes/orders.ts',
  'worker/routes/admin.ts',
  'worker/routes/webhook.ts',
  'worker/routes/visitors.ts',
  'worker/routes/customers.ts',
  'worker/routes/trial.ts',
  'worker/routes/blog.ts',
  'worker/routes/stripe-config.ts',
  
  // Server files
  'server/index.ts',
  'server/routes.ts',
  'server/storage.ts',
  'server/vite.ts',
  'server/db.ts',
  'server/seed-products.ts',
  'server/webhookHandlers.ts',
  'server/blogSeo.ts',
  'server/openai.ts',
  'server/productImages.ts',
  
  // Shared files
  'shared/schema.ts',
  
  // Script files
  'script/build.ts',
  'script/build-worker.ts',
  'script/prerender-blog.ts',
  'script/push-to-github.ts',
  
  // GitHub workflows
  '.github/workflows/deploy-cloudflare.yml',
  
  // Client HTML
  'client/index.html',
  
  // Client source - main files
  'client/src/main.tsx',
  'client/src/App.tsx',
  'client/src/index.css',
  
  // Client pages
  'client/src/pages/MainStore.tsx',
  'client/src/pages/ShadowStore.tsx',
  'client/src/pages/Checkout.tsx',
  'client/src/pages/Success.tsx',
  'client/src/pages/AdminLogin.tsx',
  'client/src/pages/AdminDashboard.tsx',
  'client/src/pages/CustomerPortal.tsx',
  'client/src/pages/BlogIndex.tsx',
  'client/src/pages/BlogPost.tsx',
  'client/src/pages/NotFound.tsx',
  
  // Client components
  'client/src/components/FreeTrial.tsx',
  'client/src/components/Header.tsx',
  'client/src/components/Footer.tsx',
  'client/src/components/ProductCard.tsx',
  'client/src/components/CartSidebar.tsx',
  'client/src/components/SportsCarousel.tsx',
  'client/src/components/TrustBadges.tsx',
  'client/src/components/WhatsAppButton.tsx',
  'client/src/components/SocialProof.tsx',
  'client/src/components/CustomerAuth.tsx',
  'client/src/components/BlogSidebar.tsx',
  'client/src/components/BlogCard.tsx',
  'client/src/components/RelatedProducts.tsx',
  'client/src/components/SEOHead.tsx',
  'client/src/components/AdminBlogEditor.tsx',
  'client/src/components/AdminCustomers.tsx',
  'client/src/components/AdminOrders.tsx',
  'client/src/components/AdminProducts.tsx',
  'client/src/components/AdminAnalytics.tsx',
  
  // Client lib
  'client/src/lib/api.ts',
  'client/src/lib/store.ts',
  'client/src/lib/queryClient.ts',
  'client/src/lib/utils.ts',
  'client/src/lib/supabase.ts',
  
  // Client hooks
  'client/src/hooks/use-mobile.tsx',
  'client/src/hooks/use-toast.ts',
  
  // UI Components (all of them)
  'client/src/components/ui/accordion.tsx',
  'client/src/components/ui/alert-dialog.tsx',
  'client/src/components/ui/alert.tsx',
  'client/src/components/ui/aspect-ratio.tsx',
  'client/src/components/ui/avatar.tsx',
  'client/src/components/ui/badge.tsx',
  'client/src/components/ui/breadcrumb.tsx',
  'client/src/components/ui/button.tsx',
  'client/src/components/ui/calendar.tsx',
  'client/src/components/ui/card.tsx',
  'client/src/components/ui/carousel.tsx',
  'client/src/components/ui/chart.tsx',
  'client/src/components/ui/checkbox.tsx',
  'client/src/components/ui/collapsible.tsx',
  'client/src/components/ui/command.tsx',
  'client/src/components/ui/context-menu.tsx',
  'client/src/components/ui/dialog.tsx',
  'client/src/components/ui/drawer.tsx',
  'client/src/components/ui/dropdown-menu.tsx',
  'client/src/components/ui/form.tsx',
  'client/src/components/ui/hover-card.tsx',
  'client/src/components/ui/input-otp.tsx',
  'client/src/components/ui/input.tsx',
  'client/src/components/ui/label.tsx',
  'client/src/components/ui/menubar.tsx',
  'client/src/components/ui/navigation-menu.tsx',
  'client/src/components/ui/pagination.tsx',
  'client/src/components/ui/popover.tsx',
  'client/src/components/ui/progress.tsx',
  'client/src/components/ui/radio-group.tsx',
  'client/src/components/ui/resizable.tsx',
  'client/src/components/ui/scroll-area.tsx',
  'client/src/components/ui/select.tsx',
  'client/src/components/ui/separator.tsx',
  'client/src/components/ui/sheet.tsx',
  'client/src/components/ui/sidebar.tsx',
  'client/src/components/ui/skeleton.tsx',
  'client/src/components/ui/slider.tsx',
  'client/src/components/ui/sonner.tsx',
  'client/src/components/ui/switch.tsx',
  'client/src/components/ui/table.tsx',
  'client/src/components/ui/tabs.tsx',
  'client/src/components/ui/textarea.tsx',
  'client/src/components/ui/toast.tsx',
  'client/src/components/ui/toaster.tsx',
  'client/src/components/ui/toggle-group.tsx',
  'client/src/components/ui/toggle.tsx',
  'client/src/components/ui/tooltip.tsx',
  
  // Image assets
  'attached_assets/s-l1600onnbok_1766008738774.webp',
  'attached_assets/OIPonnbox4k_1766008832103.webp',
  'attached_assets/OIF_1764979270800.jpg',
];

async function pushFiles() {
  const octokit = await getUncachableGitHubClient();
  
  console.log('Getting current branch reference...');
  const { data: ref } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
  });
  const currentSha = ref.object.sha;
  console.log(`Current commit SHA: ${currentSha}`);

  console.log('Getting current commit tree...');
  const { data: currentCommit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: currentSha,
  });
  const baseTreeSha = currentCommit.tree.sha;

  console.log('Creating blobs for files...');
  const treeItems: Array<{
    path: string;
    mode: '100644';
    type: 'blob';
    sha: string;
  }> = [];

  let pushedCount = 0;
  let skippedCount = 0;

  for (const filePath of filesToPush) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${filePath} - file not found`);
      skippedCount++;
      continue;
    }
    
    const content = fs.readFileSync(fullPath);
    console.log(`Creating blob for ${filePath}...`);
    
    const { data: blob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: content.toString('base64'),
      encoding: 'base64',
    });
    
    treeItems.push({
      path: filePath,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
    pushedCount++;
  }

  console.log(`Creating new tree with ${treeItems.length} files...`);
  const { data: newTree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseTreeSha,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: 'Full sync from Replit - all critical files including package-lock.json and FreeTrial updates',
    tree: newTree.sha,
    parents: [currentSha],
  });
  console.log(`New commit SHA: ${newCommit.sha}`);

  console.log('Updating branch reference...');
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha,
  });

  console.log(`Successfully pushed ${pushedCount} files to ${BRANCH}!`);
  console.log(`Skipped ${skippedCount} files (not found)`);
  console.log('GitHub Actions should now trigger the Cloudflare deployment.');
}

pushFiles().catch(console.error);
