# Deploy checkout restoration to GitHub
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# Configure git to not use pager
$env:GIT_PAGER = ''
git config core.pager ''

# Check status
Write-Host "Checking git status..."
git status --short

# Add all changes
Write-Host "Adding all changes..."
git add -A

# Commit
Write-Host "Committing changes..."
git commit -m "RESTORE: Complete checkout functionality - All checkout routes, pages, and payment methods working"

# Check remote
Write-Host "Checking remote repository..."
git remote -v

# Push to main/master
Write-Host "Pushing to GitHub..."
$branch = git branch --show-current
if ($branch) {
    git push origin $branch
    Write-Host "Successfully pushed to GitHub!"
} else {
    Write-Host "No branch found, trying main..."
    git push origin main
}

Write-Host "Deployment complete!"







