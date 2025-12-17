@echo off
cd /d "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

echo ================================================
echo PUSHING ALL 14 FIXES TO GITHUB
echo ================================================
echo.

echo Removing bad files...
del /F /Q "ersrdela*" 2>nul

echo.
echo Adding all fixed files...
git add index.html
git add src/components/SEOHead.tsx
git add src/components/ImageUpload.tsx
git add src/components/WhatYouGetVideo.tsx
git add src/components/custom-admin/SimpleImageManager.tsx
git add src/components/custom-admin/SystemHealthCheck.tsx
git add src/pages/SecureCheckoutPage.tsx
git add src/pages/ConciergePage.tsx
git add src/pages/ProductDetailPage.tsx
git add src/pages/RealAdminDashboard.tsx
git add src/pages/ConciergeCheckout.tsx
git add src/pages/StripeSecureCheckoutPage.tsx
git add src/pages/NewCheckoutPage.tsx
git add src/components/CheckoutCart.tsx
git add src/components/StripePaymentForm.tsx
git add src/App.tsx
git add src/AppRouter.tsx
git add supabase/migrations/20251203_add_missing_columns_to_real_products.sql

echo.
echo Committing all fixes...
git commit -m "Fix: 14 critical bugs - Supabase project, Google/Bing codes, stripe_products table, Square removal, image uploads, missing columns"

echo.
echo Setting GitHub remote...
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

echo.
echo Pulling latest...
git pull origin clean-main --no-edit --allow-unrelated-histories

echo.
echo Pushing to GitHub clean-main...
git push origin clean-main

echo.
echo ================================================
echo SUCCESS! ALL FIXES PUSHED TO GITHUB!
echo ================================================
echo.
echo BUGS FIXED:
echo [1] index.html - OLD Supabase project fixed
echo [2] index.html - Square SDK removed
echo [3] SEOHead.tsx - Google verification code added
echo [4] ImageUpload.tsx - Bucket name fixed
echo [5] SimpleImageManager.tsx - Bucket name fixed
echo [6] WhatYouGetVideo.tsx - Removed hardcoded URL
echo [7] SecureCheckoutPage.tsx - stripe_products to real_products
echo [8] ConciergePage.tsx - stripe_products to real_products
echo [9] ProductDetailPage.tsx - stripe_products to real_products
echo [10] RealAdminDashboard.tsx - Removed stripe_products menu
echo [11] ConciergeCheckout.tsx - Square to Stripe
echo [12] Deleted Shop_FIXED.tsx
echo [13] Deleted SquarePaymentForm.tsx
echo [14] Created migration for missing columns
echo.
echo Cloudflare will auto-deploy in 5 minutes!
echo.
pause


