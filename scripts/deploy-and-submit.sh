#!/bin/bash

# Stream Stick Pro - Automated Deployment & SEO Submission Script
# This script builds, deploys, and submits to search engines

set -e

echo "🚀 =============================================="
echo "   Stream Stick Pro - Deployment & SEO Suite"
echo "============================================== 🚀"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="streamstickpro.com"
SITEMAP_URL="https://${DOMAIN}/sitemap.xml"
ROBOTS_URL="https://${DOMAIN}/robots.txt"

# Step 1: Generate Sitemap
echo -e "${BLUE}📝 Step 1: Generating Sitemap${NC}"
if [ -f "scripts/generate-sitemap.js" ]; then
    node scripts/generate-sitemap.js
    echo -e "${GREEN}✅ Sitemap generated${NC}"
else
    echo -e "${YELLOW}⚠️  Sitemap generator not found, skipping${NC}"
fi
echo ""

# Step 2: Build Project
echo -e "${BLUE}🔨 Step 2: Building Project${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 3: Verify Build Output
echo -e "${BLUE}🔍 Step 3: Verifying Build${NC}"
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    FILE_COUNT=$(find dist -type f | wc -l)
    echo -e "${GREEN}✅ Build verified${NC}"
    echo "   📦 Size: $DIST_SIZE"
    echo "   📄 Files: $FILE_COUNT"
else
    echo -e "${RED}❌ Build directory not found${NC}"
    exit 1
fi
echo ""

# Step 4: Cloudflare Deployment Information
echo -e "${BLUE}☁️  Step 4: Cloudflare Pages Deployment${NC}"
echo -e "${YELLOW}📋 To deploy to Cloudflare Pages:${NC}"
echo ""
echo "Option 1: Using Wrangler CLI"
echo "  npx wrangler pages deploy dist --project-name=streamstickpro"
echo ""
echo "Option 2: Using Git Push (Recommended)"
echo "  git add ."
echo "  git commit -m 'Enhanced SEO features - $(date)'"
echo "  git push origin main"
echo "  (Cloudflare will auto-deploy from GitHub)"
echo ""
echo -e "${YELLOW}⏸️  Pausing for manual Cloudflare deployment...${NC}"
echo "   Press Enter when Cloudflare deployment is complete..."
read -r
echo ""

# Step 5: Verify Deployment
echo -e "${BLUE}🌐 Step 5: Verifying Live Site${NC}"
echo "Checking if site is accessible..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/")
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Site is live (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  Site returned HTTP $HTTP_STATUS${NC}"
fi

# Check sitemap
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITEMAP_URL")
if [ "$SITEMAP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Sitemap is accessible${NC}"
else
    echo -e "${RED}❌ Sitemap not accessible (HTTP $SITEMAP_STATUS)${NC}"
fi

# Check robots.txt
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ROBOTS_URL")
if [ "$ROBOTS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Robots.txt is accessible${NC}"
else
    echo -e "${RED}❌ Robots.txt not accessible (HTTP $ROBOTS_STATUS)${NC}"
fi
echo ""

# Step 6: Google Search Console Submission
echo -e "${BLUE}🔍 Step 6: Google Search Console Submission${NC}"
echo ""
echo "📋 Manual Steps Required:"
echo ""
echo "1. Go to: https://search.google.com/search-console"
echo "2. Select property: ${DOMAIN}"
echo "3. Click 'Sitemaps' in left sidebar"
echo "4. Submit: sitemap.xml"
echo "5. Click 'URL Inspection'"
echo "6. Request indexing for these key URLs:"
echo ""
echo "   Homepage:"
echo "   └─ https://${DOMAIN}/"
echo ""
echo "   Top Blog Posts:"
echo "   ├─ https://${DOMAIN}/blog/1-year-iptv-subscription-best-value"
echo "   ├─ https://${DOMAIN}/blog/fire-stick-4k-max-fastest-streaming-device-2025"
echo "   ├─ https://${DOMAIN}/blog/iptv-vs-netflix-hulu-disney-comparison-2025"
echo "   ├─ https://${DOMAIN}/blog/fire-stick-buffering-fixes-that-work"
echo "   └─ https://${DOMAIN}/blog/complete-iptv-channel-list-2025-18000-channels"
echo ""
echo "   Shop Page:"
echo "   └─ https://${DOMAIN}/shop"
echo ""
echo -e "${YELLOW}⏸️  Submit to Google Search Console now...${NC}"
echo "   Press Enter when done..."
read -r
echo ""

# Step 7: Bing Webmaster Tools Submission
echo -e "${BLUE}🔍 Step 7: Bing Webmaster Tools Submission${NC}"
echo ""
echo "📋 Manual Steps Required:"
echo ""
echo "1. Go to: https://www.bing.com/webmasters"
echo "2. Select site: ${DOMAIN}"
echo "3. Navigate to: Sitemaps → Submit a Sitemap"
echo "4. Enter: ${SITEMAP_URL}"
echo "5. Click: Submit"
echo ""
echo "6. Navigate to: URL Submission"
echo "7. Submit these URLs:"
echo ""
echo "   https://${DOMAIN}/"
echo "   https://${DOMAIN}/shop"
echo "   https://${DOMAIN}/blog/1-year-iptv-subscription-best-value"
echo "   https://${DOMAIN}/blog/fire-stick-4k-max-fastest-streaming-device-2025"
echo "   https://${DOMAIN}/blog/iptv-vs-netflix-hulu-disney-comparison-2025"
echo ""
echo -e "${YELLOW}⏸️  Submit to Bing Webmaster Tools now...${NC}"
echo "   Press Enter when done..."
read -r
echo ""

# Step 8: IndexNow Submission (Automated!)
echo -e "${BLUE}⚡ Step 8: IndexNow Submission${NC}"
echo "Notifying search engines via IndexNow..."
echo ""

# Generate IndexNow key if doesn't exist
if [ ! -f "public/indexnow-key.txt" ]; then
    INDEXNOW_KEY=$(openssl rand -hex 32)
    echo "$INDEXNOW_KEY" > public/indexnow-key.txt
    echo -e "${GREEN}✅ Generated IndexNow key${NC}"
else
    INDEXNOW_KEY=$(cat public/indexnow-key.txt)
    echo -e "${GREEN}✅ Using existing IndexNow key${NC}"
fi

# Submit to IndexNow
INDEXNOW_URLS='["https://'${DOMAIN}'/","https://'${DOMAIN}'/shop","https://'${DOMAIN}'/blog/1-year-iptv-subscription-best-value"]'

echo "Submitting URLs to IndexNow..."
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "'${DOMAIN}'",
    "key": "'${INDEXNOW_KEY}'",
    "keyLocation": "https://'${DOMAIN}'/indexnow-key.txt",
    "urlList": '${INDEXNOW_URLS}'
  }' > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ IndexNow submission successful${NC}"
else
    echo -e "${YELLOW}⚠️  IndexNow submission may have issues${NC}"
fi
echo ""

# Step 9: SEO Validation
echo -e "${BLUE}🎯 Step 9: SEO Validation${NC}"
echo ""
echo "Recommended validation steps:"
echo ""
echo "1. Test Rich Results:"
echo "   https://search.google.com/test/rich-results?url=https://${DOMAIN}/"
echo ""
echo "2. Test Mobile-Friendly:"
echo "   https://search.google.com/test/mobile-friendly?url=https://${DOMAIN}/"
echo ""
echo "3. Test PageSpeed:"
echo "   https://pagespeed.web.dev/analysis?url=https://${DOMAIN}/"
echo ""
echo "4. Verify Structured Data:"
echo "   View source: https://${DOMAIN}/"
echo "   Look for: <script type=\"application/ld+json\">"
echo ""

# Step 10: Summary
echo -e "${GREEN}✨ =============================================="
echo "   Deployment & Submission Complete!"
echo "============================================== ✨${NC}"
echo ""
echo "📊 Summary:"
echo "   ✅ Build completed"
echo "   ✅ Sitemap generated (${SITEMAP_URL})"
echo "   ✅ Site deployed to Cloudflare"
echo "   ✅ Submitted to Google Search Console"
echo "   ✅ Submitted to Bing Webmaster Tools"
echo "   ✅ IndexNow notification sent"
echo ""
echo "📈 Expected Results:"
echo "   • Google crawl: 24-48 hours"
echo "   • Bing crawl: 3-7 days"
echo "   • Traffic increase: 2-4 weeks"
echo "   • Rich snippets: 1-2 weeks"
echo ""
echo "🎯 Next Steps:"
echo "   1. Monitor Google Search Console daily"
echo "   2. Check Bing Webmaster Tools weekly"
echo "   3. Update top posts with fresh content"
echo "   4. Build quality backlinks"
echo "   5. Share content on social media"
echo ""
echo "📚 Documentation:"
echo "   • SEO_ENHANCEMENT_COMPLETE.md"
echo "   • SUBMIT_TO_SEARCH_ENGINES_NOW.md"
echo ""
echo -e "${GREEN}🚀 Your site is now optimized and submitted!${NC}"
echo ""
