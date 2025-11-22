# GitHub Deployment Script with Token Authentication
# Uses your GitHub Personal Access Token to deploy all files

param(
    [string]$GitHubUsername = "reloadedfiretvteam-hash",
    [string]$RepositoryName = "streamerstickprofinal",
    [string]$Token = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
$gitInstalled = $false
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Git is installed: $gitVersion" -ForegroundColor Green
        $gitInstalled = $true
    }
} catch {
    $gitInstalled = $false
}

if (-not $gitInstalled) {
    Write-Host "WARNING: Git is not installed!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Git is required for deployment. Please install Git:" -ForegroundColor Cyan
    Write-Host "1. Download from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Install with default settings" -ForegroundColor White
    Write-Host "3. Close and reopen PowerShell" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or try: winget install --id Git.Git" -ForegroundColor Cyan
    exit 1
}

# Get GitHub token if not provided
if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "Enter your GitHub Personal Access Token:" -ForegroundColor Yellow
    Write-Host "(Get from: https://github.com/settings/tokens)" -ForegroundColor Cyan
    $Token = Read-Host
}

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "ERROR: GitHub token is required!" -ForegroundColor Red
    Write-Host "Get a token from: https://github.com/settings/tokens" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Username: $GitHubUsername" -ForegroundColor White
Write-Host "  Repository: $RepositoryName" -ForegroundColor White
Write-Host "  Token: ghp_***" -ForegroundColor White
Write-Host ""

# Step 1: Initialize git repository
Write-Host "Step 1: Initializing git repository..." -ForegroundColor Yellow
if (-not (Test-Path .git)) {
    git init
    Write-Host "OK: Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "OK: Git repository already exists" -ForegroundColor Green
}

# Step 2: Configure git user
Write-Host ""
Write-Host "Step 2: Configuring git user..." -ForegroundColor Yellow
$userName = git config user.name 2>$null
$userEmail = git config user.email 2>$null

if (-not $userName) {
    $name = Read-Host "Enter your name for git commits (or press Enter to use GitHub username)"
    if ([string]::IsNullOrWhiteSpace($name)) {
        $name = $GitHubUsername
    }
    git config user.name $name
    Write-Host "OK: User name configured: $name" -ForegroundColor Green
} else {
    Write-Host "OK: User name already configured: $userName" -ForegroundColor Green
}

if (-not $userEmail) {
    $email = Read-Host "Enter your email for git commits"
    if (-not [string]::IsNullOrWhiteSpace($email)) {
        git config user.email $email
        Write-Host "OK: User email configured" -ForegroundColor Green
    }
} else {
    Write-Host "OK: User email already configured: $userEmail" -ForegroundColor Green
}

# Step 3: Add all files
Write-Host ""
Write-Host "Step 3: Adding files to git..." -ForegroundColor Yellow
git add .
$fileCount = (git status --porcelain | Measure-Object -Line).Lines
Write-Host "OK: Added $fileCount files/changes" -ForegroundColor Green

# Step 4: Commit changes
Write-Host ""
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    $commitMessage = "Deploy project files - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
    Write-Host "OK: Changes committed" -ForegroundColor Green
} else {
    Write-Host "OK: No changes to commit (everything is up to date)" -ForegroundColor Green
}

# Step 5: Check if repository exists on GitHub
Write-Host ""
Write-Host "Step 5: Checking GitHub repository..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $repoCheck = Invoke-RestMethod -Uri "https://api.github.com/repos/$GitHubUsername/$RepositoryName" -Headers $headers -Method Get -ErrorAction SilentlyContinue
    Write-Host "OK: Repository exists on GitHub" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Repository doesn't exist. Creating it..." -ForegroundColor Yellow
    
    $body = @{
        name = $RepositoryName
        description = "StreamStickPro - Premium IPTV and Fire Stick E-commerce Platform"
        private = $false
        auto_init = $false
    } | ConvertTo-Json
    
    try {
        $newRepo = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $body -ContentType "application/json"
        Write-Host "OK: Repository created: $RepositoryName" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to create repository. Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please create the repository manually:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
        Write-Host "2. Name it: $RepositoryName" -ForegroundColor White
        Write-Host "3. Click 'Create repository'" -ForegroundColor White
        Write-Host "4. Run this script again" -ForegroundColor White
        exit 1
    }
}

# Step 6: Set up remote
Write-Host ""
Write-Host "Step 6: Setting up remote..." -ForegroundColor Yellow

$repoUrl = "https://${Token}@github.com/${GitHubUsername}/${RepositoryName}.git"

$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    git remote set-url origin $repoUrl
    Write-Host "OK: Remote URL updated" -ForegroundColor Green
} else {
    git remote add origin $repoUrl
    Write-Host "OK: Remote 'origin' added" -ForegroundColor Green
}

# Step 7: Push to GitHub
Write-Host ""
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Repository: https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor Cyan
Write-Host ""

# Set main branch
git branch -M main 2>$null

# Push to GitHub
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Files deployed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your repository:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed. Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Try without force
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Push failed. Possible issues:" -ForegroundColor Red
        Write-Host "  - Repository permissions" -ForegroundColor White
        Write-Host "  - Token permissions (needs 'repo' scope)" -ForegroundColor White
        Write-Host "  - Network connection" -ForegroundColor White
        Write-Host ""
        Write-Host "You can try manually:" -ForegroundColor Yellow
        Write-Host "  git push -u origin main" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Security Note:" -ForegroundColor Yellow
Write-Host "Your token is stored in this script. Consider:" -ForegroundColor White
Write-Host "  - Revoking this token after use" -ForegroundColor White
Write-Host "  - Using environment variables instead" -ForegroundColor White
Write-Host "  - Adding this script to .gitignore" -ForegroundColor White
Write-Host ""
