# Final Push - Stage, Commit, Push

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "Staging all changes..." -ForegroundColor Yellow
git add -A

Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated - ProductDetailPage props, AppRouter routes, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404, all broken routes fixed"

Write-Host "Pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force

Write-Host "Pushing to main..." -ForegroundColor Yellow
git push origin clean-main:main --force

Write-Host "Done! Check GitHub now." -ForegroundColor Green

