@echo off
echo ============================================
echo FIXING AND PUSHING TO GITHUB
echo ============================================
cd /d "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

echo.
echo Step 1: Removing bad files...
del /F /Q "ersrdela*" 2>nul

echo Step 2: Adding all changes...
git add src/
git add supabase/functions/

echo Step 3: Committing...
git commit -m "Fix: Restore all checkout pages and update Supabase credentials"

echo Step 4: Pulling latest from GitHub...
git pull origin clean-main --no-rebase

echo Step 5: Pushing to GitHub...
git push https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git clean-main

echo.
echo ============================================
echo DONE! Your checkout pages are now on GitHub!
echo ============================================
echo.
echo NEXT: Go to Cloudflare and redeploy!
pause


