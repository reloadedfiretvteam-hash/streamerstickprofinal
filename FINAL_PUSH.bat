@echo off
cd /d "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

echo ============================================
echo PUSHING YOUR CHECKOUT TO GITHUB
echo ============================================
echo.

echo Cleaning up bad files...
del /F /Q "ersrdela*" 2>nul

echo.
echo Adding your checkout pages...
git add src/pages/StripeSecureCheckoutPage.tsx
git add src/pages/NewCheckoutPage.tsx
git add src/components/CheckoutCart.tsx
git add src/components/StripePaymentForm.tsx
git add src/App.tsx
git add src/AppRouter.tsx

echo.
echo Committing...
git commit -m "Restore checkout pages - fix Bolt's mistakes"

echo.
echo Setting GitHub remote with token...
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

echo.
echo Pulling latest...
git pull origin clean-main --no-edit

echo.
echo Pushing to GitHub...
git push origin clean-main --force

echo.
echo ============================================
echo DONE! 
echo ============================================
echo.
echo Your checkout pages are now on GitHub!
echo.
echo NEXT STEP:
echo Go to https://dash.cloudflare.com
echo Click: Pages - streamerstickpro-live - Deployments
echo Click the three dots on latest deployment
echo Click "Retry deployment"
echo Wait 5 minutes
echo.
pause


