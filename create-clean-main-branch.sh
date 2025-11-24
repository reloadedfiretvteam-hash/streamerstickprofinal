#!/bin/bash

# Script to create and push the clean-main branch for production deployment
# This consolidates all changes and triggers automatic deployment to Cloudflare Pages

set -e  # Exit on any error

echo "🚀 Creating clean-main branch for production deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"
echo ""

# Fetch latest changes
echo -e "${BLUE}Fetching latest changes...${NC}"
git fetch origin

# Check if clean-main already exists remotely
if git ls-remote --heads origin clean-main | grep -q clean-main; then
    echo -e "${YELLOW}⚠️  clean-main branch already exists remotely${NC}"
    read -p "Do you want to update it with current changes? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
    
    # Checkout clean-main and merge current branch
    echo -e "${BLUE}Checking out clean-main...${NC}"
    git checkout clean-main
    git pull origin clean-main
    
    echo -e "${BLUE}Merging changes from $CURRENT_BRANCH...${NC}"
    git merge $CURRENT_BRANCH -m "Merge latest changes from $CURRENT_BRANCH"
else
    # Create new clean-main branch
    echo -e "${BLUE}Creating new clean-main branch...${NC}"
    git checkout -b clean-main
fi

echo ""
echo -e "${GREEN}✅ clean-main branch is ready${NC}"
echo ""

# Show summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Branch Summary:${NC}"
git log --oneline -5
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask to push
read -p "Push clean-main branch to origin and trigger deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Pushing to origin...${NC}"
    git push -u origin clean-main
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ SUCCESS! clean-main branch created and pushed${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🚀 GitHub Actions will now automatically:"
    echo "   1. Build your project (npm run build)"
    echo "   2. Deploy to Cloudflare Pages"
    echo "   3. Update your live site"
    echo ""
    echo "📊 Monitor deployment progress:"
    echo "   https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/actions"
    echo ""
    echo "🌐 Cloudflare deployment dashboard:"
    echo "   https://dash.cloudflare.com/f1d6fdedf801e39f184a19ae201e8be1/pages/view/streamerstickprofinal"
    echo ""
    echo "⏱️  Estimated deployment time: 3-5 minutes"
    echo ""
else
    echo ""
    echo -e "${YELLOW}Push aborted. To push later, run:${NC}"
    echo "   git push -u origin clean-main"
    echo ""
fi

echo "✨ Done!"
