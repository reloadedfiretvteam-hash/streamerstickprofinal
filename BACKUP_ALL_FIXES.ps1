# Backup All Fixes Script
# This creates a backup of all fixes before we fix the repository issue

Write-Host "=== BACKING UP ALL FIXES ===" -ForegroundColor Cyan

# Create backup directory
$backupDir = "BACKUP_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "`n1. Creating backup directory: $backupDir" -ForegroundColor Yellow

# Copy all source files
Write-Host "`n2. Backing up source files..." -ForegroundColor Yellow
Copy-Item -Path "src" -Destination "$backupDir\src" -Recurse -Force
Copy-Item -Path "public" -Destination "$backupDir\public" -Recurse -Force
Copy-Item -Path "*.json" -Destination "$backupDir\" -Force
Copy-Item -Path "*.md" -Destination "$backupDir\" -Force

# Create a summary of all fixes
Write-Host "`n3. Creating fixes summary..." -ForegroundColor Yellow
$summary = @"
# ALL FIXES BACKUP - $(Get-Date)

## Critical Fixes:
1. ProductDetailPage - Accepts productId prop
2. AppRouter - All routes fixed
3. Square routes - /square, /square/checkout, /square/cart
4. MediaCarousel - Removed from App.tsx
5. 50% OFF - Updated in Shop.tsx
6. Supabase Images - All Pexels replaced
7. Admin 404 - Fixed /custom-admin route
8. AdminFooterLogin - Integrated in Footer
9. Supabase fallback - Won't crash if env vars missing
10. Credentials generator - Created utility

## Files Modified:
- src/pages/ProductDetailPage.tsx
- src/AppRouter.tsx
- src/App.tsx
- src/components/Shop.tsx
- src/lib/supabase.ts
- src/components/Footer.tsx
- src/utils/credentialsGenerator.ts

## Current Branch:
$(git branch --show-current)

## Last Commit:
$(git log --oneline -1)
"@

$summary | Out-File -FilePath "$backupDir\FIXES_SUMMARY.md" -Encoding UTF8

Write-Host "`n✅ Backup complete!" -ForegroundColor Green
Write-Host "   Location: $backupDir" -ForegroundColor Cyan
Write-Host "   All fixes are safely backed up." -ForegroundColor Cyan

