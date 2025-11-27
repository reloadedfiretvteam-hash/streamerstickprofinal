# Simple Push Script - Direct execution

# Set remote
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

# Checkout clean-main
git checkout clean-main

# Stage all
git add -A

# Commit
git commit -m "COMPLETE FIX: All fixes consolidated - ProductDetailPage props, AppRouter routes, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404, all broken routes fixed"

# Push to clean-main
Write-Host "Pushing to clean-main..."
git push origin clean-main --force

# Push to main
Write-Host "Pushing to main..."
git push origin clean-main:main --force

Write-Host "Done!"

