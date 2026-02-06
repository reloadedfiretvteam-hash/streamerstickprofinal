#!/usr/bin/env tsx
/**
 * Generate 300 SEO-Optimized HTML Meta Tags
 * Optimized for IPTV Media Players, "Best IPTV", and Blog Mentions
 * 
 * Target Keywords:
 * - Best IPTV searches
 * - IPTV media players (TiviMate, IPTV Smarters, Perfect Player, VLC)
 * - Blog mentions and niche keywords
 * - Long-tail IPTV searches
 */

interface MetaTagSet {
  title: string;
  description: string;
  keywords: string;
  html: string;
  type: 'best-iptv' | 'media-player' | 'blog-mention' | 'long-tail';
}

// Best IPTV Keywords
const bestIPTVKeywords = [
  'best IPTV service',
  'best IPTV for Fire Stick',
  'best IPTV 2025',
  'best IPTV Reddit',
  'best IPTV USA',
  'best IPTV for sports',
  'best IPTV service review',
  'best IPTV provider',
  'best IPTV subscription',
  'best IPTV app'
];

// IPTV Media Player Keywords
const mediaPlayerKeywords = [
  'TiviMate IPTV',
  'IPTV Smarters setup',
  'Perfect Player IPTV',
  'VLC IPTV player',
  'best IPTV player for Fire Stick',
  'IPTV player app',
  'IPTV media player',
  'TiviMate setup guide',
  'IPTV Smarters tutorial',
  'Perfect Player configuration'
];

// Blog Mention Keywords
const blogMentionKeywords = [
  'IPTV blog',
  'IPTV review',
  'IPTV guide',
  'IPTV tutorial',
  'IPTV setup',
  'IPTV for beginners',
  'IPTV troubleshooting',
  'IPTV channels list',
  'IPTV sports',
  'IPTV movies'
];

// Long-Tail Keywords
const longTailKeywords = [
  'best IPTV service for Fire Stick 4K',
  'IPTV service with TiviMate support',
  'cheap IPTV service with sports channels',
  'IPTV service that works with IPTV Smarters',
  'best IPTV for watching NFL games',
  'IPTV service with 18,000 channels',
  'pre-configured Fire Stick with IPTV',
  'best IPTV player for Android TV',
  'IPTV service with EPG support',
  'best IPTV for live sports streaming'
];

// Generate Best IPTV Meta Tags (100)
function generateBestIPTVMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const variations = [
    'Top Rated',
    '#1 Recommended',
    'Expert Choice',
    'Customer Favorite',
    'Award Winning'
  ];

  for (let i = 0; i < 100; i++) {
    const variation = variations[i % variations.length];
    const keyword = bestIPTVKeywords[i % bestIPTVKeywords.length];
    const title = `${keyword} - ${variation} | StreamStickPro 2025`.substring(0, 60);
    const description = `${variation} ${keyword} with 18,000+ live TV channels, 100,000+ movies, all sports. Works with TiviMate, IPTV Smarters, Perfect Player. Free 36-hour trial. Trusted by 2,700+ customers.`.substring(0, 155);
    const keywords = `${keyword}, best IPTV, IPTV service, TiviMate IPTV, IPTV Smarters, Perfect Player, IPTV for Fire Stick, live TV streaming, best IPTV 2025`;

    tags.push({
      title,
      description,
      keywords,
      html: `<title>${title}</title>\n<meta name="description" content="${description}">\n<meta name="keywords" content="${keywords}">`,
      type: 'best-iptv'
    });
  }

  return tags;
}

// Generate Media Player Meta Tags (80)
function generateMediaPlayerMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const players = ['TiviMate', 'IPTV Smarters', 'Perfect Player', 'VLC'];
  const actions = ['Setup', 'Configuration', 'Tutorial', 'Guide', 'Review'];

  for (let i = 0; i < 80; i++) {
    const player = players[i % players.length];
    const action = actions[i % actions.length];
    const keyword = mediaPlayerKeywords[i % mediaPlayerKeywords.length];
    const title = `${player} IPTV ${action} - Complete Guide | StreamStickPro`.substring(0, 60);
    const description = `Learn how to setup ${player} IPTV player with StreamStickPro. ${keyword} guide with step-by-step instructions. Works on Fire Stick, Android TV, Smart TV. Pre-configured devices available.`.substring(0, 155);
    const keywords = `${keyword}, ${player} IPTV, IPTV player, IPTV setup, Fire Stick IPTV, IPTV media player, ${player} tutorial, IPTV configuration`;

    tags.push({
      title,
      description,
      keywords,
      html: `<title>${title}</title>\n<meta name="description" content="${description}">\n<meta name="keywords" content="${keywords}">`,
      type: 'media-player'
    });
  }

  return tags;
}

// Generate Blog Mention Meta Tags (70)
function generateBlogMentionMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const formats = ['Complete Guide', 'Expert Review', 'Ultimate Tutorial', 'Comprehensive Guide', 'Step-by-Step'];

  for (let i = 0; i < 70; i++) {
    const keyword = blogMentionKeywords[i % blogMentionKeywords.length];
    const format = formats[i % formats.length];
    const title = `${keyword} - ${format} | StreamStickPro Blog`.substring(0, 60);
    const description = `${format} to ${keyword}. Learn everything about IPTV services, setup, troubleshooting, and more. Trusted IPTV blog with expert reviews, guides, and tutorials. Free resources and tips.`.substring(0, 155);
    const keywords = `${keyword}, IPTV blog, IPTV guide, IPTV tutorial, IPTV review, IPTV setup, IPTV troubleshooting, IPTV channels, IPTV sports, IPTV movies`;

    tags.push({
      title,
      description,
      keywords,
      html: `<title>${title}</title>\n<meta name="description" content="${description}">\n<meta name="keywords" content="${keywords}">`,
      type: 'blog-mention'
    });
  }

  return tags;
}

// Generate Long-Tail Meta Tags (50)
function generateLongTailMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const benefits = ['18,000+ channels', '100,000+ movies', 'All sports included', 'Free trial', '24/7 support'];

  for (let i = 0; i < 50; i++) {
    const keyword = longTailKeywords[i % longTailKeywords.length];
    const benefit = benefits[i % benefits.length];
    const title = `${keyword} - ${benefit} | StreamStickPro`.substring(0, 60);
    const description = `${keyword} with ${benefit}. StreamStickPro offers the best IPTV service compatible with TiviMate, IPTV Smarters, Perfect Player. Pre-configured Fire Sticks available. Trusted by 2,700+ customers.`.substring(0, 155);
    const keywords = `${keyword}, best IPTV, IPTV service, TiviMate IPTV, IPTV Smarters, Perfect Player, IPTV for Fire Stick, live TV streaming`;

    tags.push({
      title,
      description,
      keywords,
      html: `<title>${title}</title>\n<meta name="description" content="${description}">\n<meta name="keywords" content="${keywords}">`,
      type: 'long-tail'
    });
  }

  return tags;
}

// Main function
async function main() {
  console.log('🚀 Generating 300 IPTV Media Players & Best IPTV SEO Meta Tags...\n');

  const allTags: MetaTagSet[] = [
    ...generateBestIPTVMetaTags(),
    ...generateMediaPlayerMetaTags(),
    ...generateBlogMentionMetaTags(),
    ...generateLongTailMetaTags()
  ];

  // Ensure we have exactly 300
  const finalTags = allTags.slice(0, 300);

  // Create output directory
  const fs = await import('fs');
  const path = await import('path');
  const outputDir = path.join(process.cwd(), 'generated-seo-meta-tags-media-players');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save individual HTML files
  finalTags.forEach((tag, index) => {
    const fileNum = String(index + 1).padStart(3, '0');
    const filename = `meta-tags-media-${fileNum}.html`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, `<!-- ${tag.type.toUpperCase()} - ${tag.title} -->\n${tag.html}`);
  });

  // Save JSON file
  const jsonPath = path.join(outputDir, 'meta-tags.json');
  fs.writeFileSync(jsonPath, JSON.stringify(finalTags, null, 2));

  // Save CSV file
  const csvPath = path.join(outputDir, 'meta-tags.csv');
  const csvHeader = 'Number,Type,Title,Description,Keywords\n';
  const csvRows = finalTags.map((tag, index) => 
    `${index + 1},"${tag.type}","${tag.title.replace(/"/g, '""')}","${tag.description.replace(/"/g, '""')}","${tag.keywords.replace(/"/g, '""')}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);

  // Save all-in-one HTML file
  const allInOnePath = path.join(outputDir, 'all-300-meta-tags.html');
  const allInOneContent = finalTags.map((tag, index) => 
    `<!-- ============================================ -->\n<!-- Meta Tag Set ${index + 1} (${tag.type}) -->\n<!-- ============================================ -->\n${tag.html}\n`
  ).join('\n');
  fs.writeFileSync(allInOnePath, allInOneContent);

  // Summary
  const typeCounts = finalTags.reduce((acc, tag) => {
    acc[tag.type] = (acc[tag.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('✅ Generated 300 SEO Meta Tags!\n');
  console.log('📊 Breakdown by Type:');
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} tags`);
  });
  console.log(`\n📁 Files saved to: ${outputDir}/`);
  console.log(`   - Individual HTML files: meta-tags-media-001.html to meta-tags-media-300.html`);
  console.log(`   - JSON format: meta-tags.json`);
  console.log(`   - CSV format: meta-tags.csv`);
  console.log(`   - All-in-one: all-300-meta-tags.html`);
  console.log('\n🎯 Optimized for:');
  console.log('   - "Best IPTV" searches');
  console.log('   - IPTV Media Players (TiviMate, IPTV Smarters, Perfect Player, VLC)');
  console.log('   - Blog mentions and niche keywords');
  console.log('   - Long-tail IPTV searches');
}

main().catch(console.error);
