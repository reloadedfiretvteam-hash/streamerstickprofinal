# Fix and Push Script - PowerShell

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "Setting remote URL..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

Write-Host "Checking out clean-main..." -ForegroundColor Yellow
git checkout clean-main

Write-Host "Staging all changes..." -ForegroundColor Yellow
git add -A

Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated"

Write-Host "Pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force

Write-Host "Pushing to main..." -ForegroundColor Yellow
git push origin clean-main:main --force

Write-Host "Done!" -ForegroundColor Green

