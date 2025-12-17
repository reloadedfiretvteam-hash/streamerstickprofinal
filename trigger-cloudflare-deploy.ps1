# PowerShell script to trigger Cloudflare Pages deployment
# This uses the Cloudflare API to trigger a deployment

param(
    [string]$CloudflareToken = "",
    [string]$ProjectName = "",
    [string]$AccountID = "f1d6fdedf801e39f184a19ae201e8be1"
)

Write-Host "🚀 Triggering Cloudflare Pages Deployment..." -ForegroundColor Green
Write-Host ""

if (-not $CloudflareToken) {
    Write-Host "❌ Cloudflare API Token required!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Get your token from: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Yellow
    Write-Host "Then run: .\trigger-cloudflare-deploy.ps1 -CloudflareToken 'YOUR_TOKEN' -ProjectName 'YOUR_PROJECT_NAME'" -ForegroundColor Yellow
    exit 1
}

if (-not $ProjectName) {
    Write-Host "❌ Project name required!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run: .\trigger-cloudflare-deploy.ps1 -CloudflareToken 'YOUR_TOKEN' -ProjectName 'YOUR_PROJECT_NAME'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To find your project name:" -ForegroundColor Yellow
    Write-Host "1. Go to Cloudflare Dashboard → Workers & Pages" -ForegroundColor Yellow
    Write-Host "2. Your project name is shown there" -ForegroundColor Yellow
    exit 1
}

Write-Host "Account ID: $AccountID" -ForegroundColor Cyan
Write-Host "Project Name: $ProjectName" -ForegroundColor Cyan
Write-Host ""

try {
    $url = "https://api.cloudflare.com/client/v4/accounts/$AccountID/pages/projects/$ProjectName/deployments"
    
    Write-Host "Sending deployment request..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers @{
        "Authorization" = "Bearer $CloudflareToken"
        "Content-Type" = "application/json"
    }
    
    if ($response.success) {
        Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Deployment ID: $($response.result.id)" -ForegroundColor Cyan
        Write-Host "Status: $($response.result.latest_stage.name)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Check deployment status at:" -ForegroundColor Yellow
        Write-Host "https://dash.cloudflare.com/?to=/:account/pages/view/$ProjectName" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host "Error: $($response.errors | ConvertTo-Json)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error triggering deployment!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. Your Cloudflare token is valid" -ForegroundColor Yellow
    Write-Host "2. Your project name is correct" -ForegroundColor Yellow
    Write-Host "3. Your token has Pages:Edit permissions" -ForegroundColor Yellow
}







