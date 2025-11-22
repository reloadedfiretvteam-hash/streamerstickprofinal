# Navigate to repo root
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# Abort any ongoing rebase
git rebase --abort 2>$null

# Check status
Write-Host "Current git status:"
git status

# Add all resolved files
git add index.html package.json src/pages/ConciergePage.tsx src/vite-env.d.ts src/App.tsx

# Commit if needed
if (git diff --cached --quiet) {
    Write-Host "No changes to commit"
} else {
    git commit -m "Fix: Restore main website UI - resolve conflicts and ensure main site shows by default"
}

# Pull latest
git pull origin main --rebase

# Push to GitHub
Write-Host "Pushing to GitHub..."
git push origin main

Write-Host "Done! Cloudflare should deploy automatically."

