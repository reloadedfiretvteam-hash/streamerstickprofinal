#!/usr/bin/env tsx
/**
 * Generate 300 MORE SEO-Optimized HTML Meta Tags
 * Optimized for Reddit, Downloader Codes, and How People Actually Search
 * 
 * Research-Based Keywords:
 * - Reddit communities: r/firetvstick, r/IPTV, r/Addons4Kodi
 * - Downloader codes: "downloader code 12345", "fire stick downloader"
 * - How people search: "best IPTV Reddit", "jailbroken fire stick downloader code"
 * - Long-tail: "pre-loaded fire stick Reddit recommendation", "IPTV service downloader app"
 */

interface MetaTagSet {
  title: string;
  description: string;
  keywords: string;
  html: string;
  type: 'reddit' | 'downloader' | 'long-tail' | 'community' | 'how-to';
}

// Reddit-Optimized Keywords
const redditKeywords = [
  'Reddit recommended IPTV',
  'r/firetvstick best service',
  'r/IPTV trusted provider',
  'Reddit fire stick',
  'Reddit IPTV service',
  'r/Addons4Kodi recommended',
  'Reddit community IPTV',
  'best IPTV Reddit 2025',
  'Reddit approved Fire Stick',
  'IPTV Reddit reviews'
];

// Downloader Code Keywords
const downloaderKeywords = [
  'downloader code fire stick',
  'fire stick downloader app',
  'downloader code 12345',
  'how to use downloader on fire stick',
  'downloader app setup',
  'fire stick downloader code',
  'downloader app installation',
  'pre-loaded fire stick downloader',
  'downloader code tutorial',
  'fire stick downloader guide'
];

// Long-Tail Search Keywords
const longTailKeywords = [
  'best pre-loaded fire stick Reddit',
  'trusted IPTV service Reddit recommendation',
  'jailbroken fire stick downloader code',
  'pre-configured fire stick Reddit',
  'IPTV service downloader app setup',
  'fire stick fully loaded Reddit',
  'best IPTV for fire stick Reddit',
  'downloader code for IPTV service',
  'Reddit recommended pre-loaded fire stick',
  'IPTV downloader app fire stick'
];

// Community & How-To Keywords
const communityKeywords = [
  'how people find IPTV websites',
  'IPTV community recommendations',
  'fire stick setup downloader',
  'Reddit IPTV discussion',
  'downloader app fire stick tutorial',
  'best IPTV Reddit discussion',
  'fire stick community recommendations',
  'IPTV service community reviews',
  'downloader code community',
  'Reddit fire stick setup guide'
];

// Generate Reddit-Optimized Meta Tags (100)
function generateRedditMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const variations = [
    'Reddit Recommended',
    'Trusted by Reddit',
    'r/firetvstick Approved',
    'Reddit Community Favorite',
    'Reddit Top Pick'
  ];

  for (let i = 0; i < 100; i++) {
    const variation = variations[i % variations.length];
    const keyword = redditKeywords[i % redditKeywords.length];
    const title = `${keyword} - ${variation} | StreamStickPro`.substring(0, 60);
    const description = `Trusted by Reddit communities (r/firetvstick, r/IPTV, r/Addons4Kodi). ${keyword} with 18,000+ live TV channels, 100,000+ movies, and 24/7 support. Pre-configured Fire Sticks ready in 10 minutes. Join 2,700+ happy customers.`.substring(0, 155);
    const keywords = `${keyword}, Reddit IPTV, r/firetvstick, r/IPTV, pre-loaded fire stick, IPTV service, live TV streaming, Reddit recommended, community approved`;

    tags.push({
      title,
      description,
      keywords,
      html: `<title>${title}</title>\n<meta name="description" content="${description}">\n<meta name="keywords" content="${keywords}">`,
      type: 'reddit'
    });
  }

  return tags;
}

// Generate Downloader Code Meta Tags (80)
function generateDownloaderMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const variations = [
    'No Downloader Code Needed',
    'Pre-Installed Apps',
    'Ready to Stream',
    'Zero Setup Required',
    'Plug & Play'
  ];

  for (let i = 0; i < 80; i++) {
    const variation = variations[i % variations.length];
    const keyword = downloaderKeywords[i % downloaderKeywords.length];
    const title = `${keyword} - ${variation} | StreamStickPro`.substring(0, 60);
    const description = `${variation}! Our pre-configured Fire Sticks come with all apps installed - no downloader codes needed. ${keyword} setup eliminated. Get 18,000+ channels, 100,000+ movies instantly. Trusted by Reddit communities.`.substring(0, 155);
    const keywords = `${keyword}, downloader app, fire stick downloader, pre-loaded fire stick, no downloader code, IPTV setup, fire stick apps, downloader tutorial`;

    tags.push({
      title,
      description,
      keywords,
      html: `<title>${title}</title>\n<meta name="description" content="${description}">\n<meta name="keywords" content="${keywords}">`,
      type: 'downloader'
    });
  }

  return tags;
}

// Generate Long-Tail Meta Tags (70)
function generateLongTailMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const benefits = [
    '18,000+ channels',
    '100,000+ movies',
    '24/7 support',
    'instant setup',
    'Reddit recommended'
  ];

  for (let i = 0; i < 70; i++) {
    const keyword = longTailKeywords[i % longTailKeywords.length];
    const benefit = benefits[i % benefits.length];
    const title = `${keyword} - ${benefit} | StreamStickPro`.substring(0, 60);
    const description = `${keyword} with ${benefit}. Trusted by Reddit communities (r/firetvstick, r/IPTV). Pre-configured Fire Sticks with 18,000+ live TV channels, 100,000+ movies, all sports. No downloader codes needed - ready in 10 minutes.`.substring(0, 155);
    const keywords = `${keyword}, Reddit IPTV, pre-loaded fire stick, downloader code, IPTV service, live TV, streaming service, Reddit recommended`;

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

// Generate Community & How-To Meta Tags (50)
function generateCommunityMetaTags(): MetaTagSet[] {
  const tags: MetaTagSet[] = [];
  const howToPhrases = [
    'How to find',
    'Where to buy',
    'Best place for',
    'How to get',
    'Where Reddit recommends'
  ];

  for (let i = 0; i < 50; i++) {
    const phrase = howToPhrases[i % howToPhrases.length];
    const keyword = communityKeywords[i % communityKeywords.length];
    const title = `${phrase} ${keyword} | StreamStickPro Guide`.substring(0, 60);
    const description = `${phrase} ${keyword}? StreamStickPro is Reddit's top recommendation. Trusted by r/firetvstick, r/IPTV communities. Pre-configured Fire Sticks with 18,000+ channels, 100,000+ movies. No downloader codes - ready instantly.`.substring(0, 155);
    const keywords = `${keyword}, Reddit recommendation, how to, IPTV guide, fire stick setup, downloader app, community approved, Reddit trusted`;

    tags.push({
      title,
      description,
      keywords,
      html: `<title>${title}</title>\n<meta name="description" content="${description}">\n<meta name="keywords" content="${keywords}">`,
      type: 'how-to'
    });
  }

  return tags;
}

// Main function
async function main() {
  console.log('🚀 Generating 300 Reddit & Downloader Code SEO Meta Tags...\n');

  const allTags: MetaTagSet[] = [
    ...generateRedditMetaTags(),
    ...generateDownloaderMetaTags(),
    ...generateLongTailMetaTags(),
    ...generateCommunityMetaTags()
  ];

  // Ensure we have exactly 300
  const finalTags = allTags.slice(0, 300);

  // Create output directory
  const fs = await import('fs');
  const path = await import('path');
  const outputDir = path.join(process.cwd(), 'generated-seo-meta-tags-reddit-downloader');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save individual HTML files
  finalTags.forEach((tag, index) => {
    const fileNum = String(index + 1).padStart(3, '0');
    const filename = `meta-tags-reddit-${fileNum}.html`;
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
  console.log(`   - Individual HTML files: meta-tags-reddit-001.html to meta-tags-reddit-300.html`);
  console.log(`   - JSON format: meta-tags.json`);
  console.log(`   - CSV format: meta-tags.csv`);
  console.log(`   - All-in-one: all-300-meta-tags.html`);
  console.log('\n🎯 Optimized for:');
  console.log('   - Reddit communities (r/firetvstick, r/IPTV, r/Addons4Kodi)');
  console.log('   - Downloader codes and app setup');
  console.log('   - Long-tail search queries');
  console.log('   - Community recommendations');
  console.log('   - How people actually search for IPTV services');
}

main().catch(console.error);
