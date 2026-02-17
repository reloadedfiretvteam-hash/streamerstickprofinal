/**
 * One-time migration: Update all "2025" references to "2026" in blog posts.
 * Fixes stale year in titles, slugs, content, excerpts, and meta descriptions.
 * Usage: VITE_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/migrate-2025-to-2026.ts
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLL_KEY;

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🔍 Searching for blog posts with "2025"...');

  const { data: posts, error: fetchErr } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content, excerpt, meta_description')
    .or(
      'title.ilike.%2025%,slug.ilike.%2025%,content.ilike.%2025%,excerpt.ilike.%2025%,meta_description.ilike.%2025%'
    );

  if (fetchErr) {
    console.error('❌ Fetch error:', fetchErr.message);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log('✅ No blog posts with "2025" found. Already migrated or clean.');
    return;
  }

  console.log(`📝 Found ${posts.length} blog posts with "2025". Updating...`);

  let updated = 0;
  let errors = 0;

  for (const post of posts) {
    const updates: Record<string, string> = {};

    if (post.title && post.title.includes('2025'))
      updates.title = post.title.replace(/2025/g, '2026');
    if (post.slug && post.slug.includes('2025'))
      updates.slug = post.slug.replace(/2025/g, '2026');
    if (post.content && post.content.includes('2025'))
      updates.content = post.content.replace(/2025/g, '2026');
    if (post.excerpt && post.excerpt.includes('2025'))
      updates.excerpt = post.excerpt.replace(/2025/g, '2026');
    if (post.meta_description && post.meta_description.includes('2025'))
      updates.meta_description = post.meta_description.replace(/2025/g, '2026');

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', post.id);

      if (updateErr) {
        console.error(`  ❌ ${post.slug}: ${updateErr.message}`);
        errors++;
      } else {
        updated++;
      }
    }
  }

  console.log(`\n✅ Migration complete: ${updated} updated, ${errors} errors out of ${posts.length} found.`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
