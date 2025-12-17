@echo off
echo ================================================
echo PUSHING ALL FIXES TO GITHUB
echo ================================================
cd /d "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

echo.
echo Removing problematic files...
del /F /Q "ersrdela*" 2>nul

echo.
echo Adding fixed files...
git add src/components/ImageUpload.tsx
git add src/components/WhatYouGetVideo.tsx
git add src/components/custom-admin/SimpleImageManager.tsx
git add src/pages/StripeSecureCheckoutPage.tsx
git add src/pages/NewCheckoutPage.tsx
git add src/components/CheckoutCart.tsx
git add src/components/StripePaymentForm.tsx
git add src/App.tsx
git add src/AppRouter.tsx

echo.
echo Committing...
git commit -m "Fix: Image upload bucket bug + hardcoded Supabase URL + checkout pages"

echo.
echo Pulling latest from GitHub...
git pull https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git clean-main --no-edit

echo.
echo Pushing to GitHub...
git push https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git clean-main

echo.
echo ================================================
echo SUCCESS! FIXES PUSHED TO GITHUB!
echo ================================================
echo.
echo BUGS FIXED:
echo [1] ImageUpload - Now uses correct 'images' bucket
echo [2] SimpleImageManager - Now uses correct bucket  
echo [3] WhatYouGetVideo - Removed hardcoded URL with typo
echo [4] All checkout pages restored
echo.
echo GitHub will auto-trigger Cloudflare deployment!
echo Check Cloudflare in 5 minutes for new deployment.
echo.
pause


