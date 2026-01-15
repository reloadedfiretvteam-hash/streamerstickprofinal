import { storage } from "./storage";
import { nanoid } from "nanoid";
import { analyzeSeo } from "./seoAnalyzer";

// High-traffic SEO keywords targeting maximum visibility - AGGRESSIVE SEO CAMPAIGN
const SEO_KEYWORDS = [
  // Primary Keywords (Highest Traffic)
  "best IPTV service",
  "IPTV service",
  "jailbroken fire stick",
  "pre-loaded fire sticks",
  "downloader app",
  "IPTV subscription",
  "fire stick setup",
  "streaming device",
  "live TV service",
  "cord cutting",
  
  // Long-tail Keywords (High conversion)
  "best IPTV service 2025",
  "cheap IPTV subscription",
  "jailbroken fire stick for sale",
  "pre-configured fire stick",
  "how to jailbreak fire stick",
  "IPTV service with sports",
  "fire stick with IPTV",
  "best streaming device 2025",
  "cord cutting guide",
  "fire stick vs roku",
  
  // Product-specific
  "fire stick 4k jailbroken",
  "fire stick max jailbroken",
  "android TV box with IPTV",
  "pre-loaded streaming device",
  "fire stick downloader app",
  
  // Problem-solving keywords (High Intent)
  "how to watch live TV without cable",
  "best alternative to cable TV",
  "how to stream sports for free",
  "cheapest way to watch TV",
  "fire stick troubleshooting",
  
  // Additional High-Value Keywords
  "best IPTV for fire stick",
  "IPTV service reviews",
  "jailbroken fire stick reviews",
  "pre-loaded fire stick reviews",
  "best streaming service 2025",
  "IPTV vs cable TV",
  "fire stick IPTV setup",
  "how to install IPTV on fire stick",
  "best IPTV provider",
  "affordable IPTV service",
  "IPTV service comparison",
  "fire stick streaming apps",
  "best apps for fire stick",
  "fire stick hacks",
  "how to get free TV on fire stick",
  "fire stick tips and tricks",
  "best IPTV for sports",
  "IPTV service with NFL",
  "IPTV service with NBA",
  "fire stick for beginners",
  "cord cutting 2025",
  "best way to cut cable",
  "streaming TV guide",
  "best streaming devices",
  "fire stick alternatives",
];

// Post templates optimized for SEO and CTR
const generateSEOPost = (keyword: string, index: number) => {
  const variations = [
    {
      title: `Best ${keyword} in 2025 - Complete Guide & Reviews`,
      slug: `best-${keyword.toLowerCase().replace(/\s+/g, '-')}-2025`,
      category: "Reviews",
    },
    {
      title: `How to Get ${keyword} - Step by Step Tutorial`,
      slug: `how-to-get-${keyword.toLowerCase().replace(/\s+/g, '-')}`,
      category: "How-To",
    },
    {
      title: `${keyword} - Everything You Need to Know`,
      slug: `${keyword.toLowerCase().replace(/\s+/g, '-')}-complete-guide`,
      category: "Guides",
    },
    {
      title: `Top 10 ${keyword} Options Compared`,
      slug: `top-10-${keyword.toLowerCase().replace(/\s+/g, '-')}-compared`,
      category: "Reviews",
    },
    {
      title: `${keyword} Setup Guide - Get Started in Minutes`,
      slug: `${keyword.toLowerCase().replace(/\s+/g, '-')}-setup-guide`,
      category: "How-To",
    },
  ];
  
  const template = variations[index % variations.length];
  
  // Generate SEO-optimized content with keyword density
  const content = generateSEOContent(keyword, template.title);
  
  const excerpt = generateExcerpt(keyword, template.title);
  const metaTitle = `${template.title} | StreamStickPro`;
  const metaDescription = generateMetaDescription(keyword);
  const keywords = [keyword, ...getRelatedKeywords(keyword)];
  
  // Analyze SEO for the post
  const seoResult = analyzeSeo({
    title: template.title,
    content: content,
    excerpt: excerpt,
    metaTitle: metaTitle,
    metaDescription: metaDescription,
    keywords: keywords,
  });
  
  return {
    title: template.title,
    slug: template.slug + `-${nanoid(6)}`, // Ensure uniqueness
    excerpt: excerpt,
    content: content,
    category: template.category,
    metaTitle: metaTitle,
    metaDescription: metaDescription,
    keywords: keywords,
    readTime: seoResult.readTime,
    wordCount: seoResult.wordCount,
    headingScore: seoResult.headingScore,
    keywordDensityScore: seoResult.keywordDensityScore,
    contentLengthScore: seoResult.contentLengthScore,
    metaScore: seoResult.metaScore,
    structureScore: seoResult.structureScore,
    overallSeoScore: seoResult.overallSeoScore,
    seoAnalysis: seoResult.seoAnalysis,
    featured: index < 10, // First 10 are featured
    published: true,
    publishedAt: new Date(),
    linkedProductIds: getLinkedProducts(keyword),
  };
};

const generateSEOContent = (keyword: string, title: string): string => {
  return `# ${title}

Looking for the **${keyword}**? You've come to the right place! StreamStickPro offers the most comprehensive solution for cord-cutting and streaming entertainment in 2025.

## Why Choose StreamStickPro for ${keyword}?

When it comes to **${keyword}**, StreamStickPro stands out as the industry leader. Here's why thousands of customers trust us:

### 🎯 **18,000+ Live Channels Worldwide**
Access to an incredible selection of live TV channels from around the globe. Whether you're looking for news, entertainment, sports, or international content, we've got you covered.

### 🎬 **60,000+ Movies & TV Shows**
Our extensive on-demand library includes the latest blockbusters, classic films, binge-worthy TV series, and exclusive content - all available instantly.

### ⚽ **Complete Sports Coverage**
Never miss a game! Get access to NFL, NBA, MLB, NHL, UFC, boxing, soccer leagues worldwide, and all major sporting events including PPV.

### 💰 **Incredible Savings**
Save thousands compared to cable TV. Our **${keyword}** solution costs a fraction of traditional cable while offering more content.

## How Our ${keyword} Works

Our pre-configured devices make it incredibly easy to get started with **${keyword}**:

1. **Order Your Device** - Choose from our selection of pre-loaded Fire Sticks and Android TV boxes
2. **Plug & Play** - Your device arrives ready to use, no technical setup required
3. **Start Streaming** - Access 18,000+ channels and 60,000+ movies immediately
4. **24/7 Support** - Our expert team is always available to help

## What Makes Our ${keyword} Different?

### ✅ **Pre-Configured & Ready to Use**
Unlike other **${keyword}** providers, our devices come fully set up. No need to install apps, configure settings, or troubleshoot - everything works out of the box.

### ✅ **Premium IPTV Subscription Included**
Every device includes access to our premium IPTV service with 18,000+ live channels and 60,000+ on-demand titles.

### ✅ **Regular Updates & Support**
We continuously update our service and provide ongoing support to ensure you always have the best streaming experience.

### ✅ **Money-Back Guarantee**
We're so confident in our **${keyword}** that we offer a full money-back guarantee. If you're not satisfied, we'll refund your purchase.

## Best ${keyword} Features

- **HD & 4K Streaming** - Watch your favorite content in crystal-clear quality
- **Multi-Device Support** - Use on Fire Stick, Android TV, Smart TV, and more
- **EPG (Electronic Program Guide)** - Easy channel browsing and scheduling
- **Catch-Up TV** - Watch shows you missed up to 7 days later
- **VOD (Video on Demand)** - Instant access to movies and TV series
- **Favorites & Playlists** - Organize your favorite channels and content

## ${keyword} Pricing & Plans

Our **${keyword}** solutions are incredibly affordable:

- **1 Month Plan** - Perfect for trying out our service
- **3 Month Plan** - Great value with savings
- **6 Month Plan** - Even better value
- **1 Year Plan** - Best value, maximum savings

All plans include:
- 18,000+ live TV channels
- 60,000+ movies & TV shows
- All sports & PPV events
- 24/7 customer support
- Regular service updates

## Getting Started with ${keyword}

Ready to experience the best **${keyword}**? Here's how to get started:

1. **Visit Our Homepage** - [StreamStickPro.com](https://streamstickpro.com) to browse our products
2. **Choose Your Device** - Select from Fire Stick 4K, Fire Stick Max, or Android TV boxes
3. **Select Your Plan** - Choose the subscription length that works for you
4. **Complete Your Order** - Secure checkout with multiple payment options
5. **Receive Your Device** - Fast shipping, typically 2-5 business days
6. **Start Streaming** - Plug in and start enjoying unlimited entertainment!

## Why Customers Love Our ${keyword}

> "Best decision I ever made! Cut my cable bill from $200/month to a one-time payment. The **${keyword}** from StreamStickPro has everything I need." - Sarah M.

> "The setup was so easy. I'm not tech-savvy at all, but I had it working in minutes. The **${keyword}** is exactly what I was looking for." - John D.

> "Incredible value! I get more channels and content than I ever had with cable, and it costs a fraction of the price. Highly recommend this **${keyword}**!" - Mike T.

## ${keyword} FAQ

**Q: Is the ${keyword} legal?**
A: Yes! The devices and apps are completely legal. The Fire Stick is a legitimate Amazon product, and the streaming apps are freely available.

**Q: Do I need technical knowledge?**
A: Not at all! Our devices come pre-configured and ready to use. Just plug it in and start streaming.

**Q: What channels are included?**
A: You get access to 18,000+ live channels including news, sports, entertainment, movies, and international content.

**Q: Can I watch sports?**
A: Absolutely! All major sports are included - NFL, NBA, MLB, NHL, UFC, boxing, soccer, and more.

**Q: Is there a contract?**
A: No contracts! Choose the plan that works for you, and cancel anytime.

**Q: What if I need help?**
A: Our 24/7 customer support team is always available to assist you with any questions or issues.

## Start Your ${keyword} Journey Today!

Don't wait any longer to cut the cord and start saving money. Our **${keyword}** solution offers the best value in streaming entertainment.

**[Visit StreamStickPro.com Now](https://streamstickpro.com)** to browse our products and start your streaming journey today!

**[Start Your Free Trial](https://streamstickpro.com/?section=free-trial)** - Try our service risk-free!

**[View All Products](https://streamstickpro.com/shop)** - See our complete selection of pre-configured devices.

---

*This guide is part of our comprehensive resource library helping thousands of customers find the perfect streaming solution. For more guides, tips, and reviews, visit our [Posts page](https://streamstickpro.com/blog).*`;
};

const generateExcerpt = (keyword: string, title: string): string => {
  const excerpts = [
    `Discover the best ${keyword} in 2025. Get 18,000+ live channels, 60,000+ movies, all sports, and save thousands vs cable. Pre-configured devices ready to use!`,
    `Complete guide to ${keyword}. Learn how to get started, what's included, pricing, and why StreamStickPro is the #1 choice for cord-cutters.`,
    `Everything you need to know about ${keyword}. Compare options, see features, read reviews, and find the perfect streaming solution for your needs.`,
    `Top-rated ${keyword} comparison. See why StreamStickPro offers the best value with 18,000+ channels, premium support, and money-back guarantee.`,
  ];
  return excerpts[Math.floor(Math.random() * excerpts.length)];
};

const generateMetaDescription = (keyword: string): string => {
  return `Get the best ${keyword} with 18,000+ live channels, 60,000+ movies, all sports & PPV. Pre-configured devices, 24/7 support, money-back guarantee. Start saving today!`;
};

const getRelatedKeywords = (keyword: string): string[] => {
  const related: Record<string, string[]> = {
    "best IPTV service": ["IPTV", "streaming service", "live TV", "cord cutting"],
    "jailbroken fire stick": ["fire stick", "fire TV", "streaming device", "pre-loaded"],
    "pre-loaded fire sticks": ["fire stick", "jailbroken", "streaming device", "IPTV"],
    "downloader app": ["fire stick apps", "streaming apps", "side loading"],
    "IPTV subscription": ["IPTV service", "live TV", "streaming subscription"],
  };
  
  return related[keyword] || ["streaming", "cord cutting", "live TV", "IPTV"];
};

const getLinkedProducts = (keyword: string): string[] => {
  // Link to relevant products based on keyword
  if (keyword.includes("fire stick") || keyword.includes("streaming device")) {
    return ["firestick-4k", "firestick-4k-max", "android-onn-4k"];
  }
  if (keyword.includes("IPTV") || keyword.includes("subscription")) {
    return ["iptv-1mo", "iptv-3mo", "iptv-6mo", "iptv-1yr"];
  }
  return ["firestick-4k", "iptv-1mo"]; // Default products
};

export async function generateSEOCampaignPosts() {
  console.log("🚀 Starting SEO Campaign Post Generation...");
  console.log(`📝 Generating ${SEO_KEYWORDS.length * 5} SEO-optimized posts...`);
  
  const posts = [];
  let postIndex = 0;
  
  for (const keyword of SEO_KEYWORDS) {
    // Generate 5 variations per keyword for maximum coverage
    for (let i = 0; i < 5; i++) {
      const post = generateSEOPost(keyword, postIndex);
      posts.push(post);
      postIndex++;
    }
  }
  
  console.log(`✅ Generated ${posts.length} post templates`);
  console.log("💾 Saving posts to database...");
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const post of posts) {
    try {
      // Check if post with this slug already exists
      const existing = await storage.getBlogPostBySlug(post.slug);
      if (existing) {
        console.log(`⏭️  Skipping duplicate: ${post.slug}`);
        continue;
      }
      
      await storage.createBlogPost(post);
      successCount++;
      
      if (successCount % 10 === 0) {
        console.log(`📊 Progress: ${successCount}/${posts.length} posts created...`);
      }
    } catch (error: any) {
      console.error(`❌ Error creating post "${post.title}":`, error.message);
      errorCount++;
    }
  }
  
  console.log("\n🎉 SEO Campaign Post Generation Complete!");
  console.log(`✅ Successfully created: ${successCount} posts`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} posts`);
  }
  console.log(`\n📈 Your website now has ${successCount} new SEO-optimized posts targeting high-traffic keywords!`);
  
  return {
    success: successCount,
    errors: errorCount,
    total: posts.length,
  };
}
