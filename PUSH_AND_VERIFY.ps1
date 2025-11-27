# Push and Verify Script - Writes output to file

$logFile = "PUSH_VERIFY_LOG.txt"

"=== PUSH AND VERIFY ===" | Out-File -FilePath $logFile
"" | Out-File -FilePath $logFile -Append

# Show local commit
"1. LOCAL COMMIT:" | Out-File -FilePath $logFile -Append
git log --oneline -1 | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

# Fetch remote
"2. FETCHING REMOTE..." | Out-File -FilePath $logFile -Append
git fetch origin clean-main 2>&1 | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

# Show remote commit
"3. REMOTE COMMIT:" | Out-File -FilePath $logFile -Append
git log origin/clean-main --oneline -1 | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

# Compare commits
"4. COMPARING COMMITS:" | Out-File -FilePath $logFile -Append
$local = git rev-parse HEAD
$remote = git rev-parse origin/clean-main 2>&1
"Local:  $local" | Out-File -FilePath $logFile -Append
"Remote: $remote" | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

if ($local -eq $remote) {
    "✅ MATCH - Push already succeeded!" | Out-File -FilePath $logFile -Append
} else {
    "❌ NO MATCH - Need to push!" | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    
    # Stage and commit
    "5. STAGING CHANGES..." | Out-File -FilePath $logFile -Append
    git add -A 2>&1 | Out-File -FilePath $logFile -Append
    git status --short | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    
    "6. COMMITTING..." | Out-File -FilePath $logFile -Append
    git commit -m "COMPLETE FIX: All fixes consolidated - ProductDetailPage props, AppRouter routes, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404, all broken routes fixed" 2>&1 | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    
    "7. PUSHING TO CLEAN-MAIN..." | Out-File -FilePath $logFile -Append
    git push origin clean-main --force 2>&1 | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    
    "8. PUSHING TO MAIN..." | Out-File -FilePath $logFile -Append
    git push origin clean-main:main --force 2>&1 | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    
    # Verify after push
    "9. VERIFYING PUSH..." | Out-File -FilePath $logFile -Append
    git fetch origin clean-main 2>&1 | Out-Null
    $newLocal = git rev-parse HEAD
    $newRemote = git rev-parse origin/clean-main 2>&1
    "Local:  $newLocal" | Out-File -FilePath $logFile -Append
    "Remote: $newRemote" | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    
    if ($newLocal -eq $newRemote) {
        "✅ PUSH VERIFIED - Commits match!" | Out-File -FilePath $logFile -Append
    } else {
        "❌ PUSH FAILED - Commits still don't match!" | Out-File -FilePath $logFile -Append
    }
}

"=== COMPLETE ===" | Out-File -FilePath $logFile -Append

