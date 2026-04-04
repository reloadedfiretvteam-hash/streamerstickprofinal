# ============================================================
# ATTEMPT TO EXECUTE DATABASE SETUP VIA API
# ============================================================

$supabaseUrl = $env:VITE_SUPABASE_URL; if (-not $supabaseUrl) { $supabaseUrl = $env:SUPABASE_URL }
$supabaseAnonKey = $env:VITE_SUPABASE_ANON_KEY
if (-not $supabaseUrl -or -not $supabaseAnonKey) {
  Write-Host "Set VITE_SUPABASE_URL (or SUPABASE_URL) and VITE_SUPABASE_ANON_KEY" -ForegroundColor Red
  exit 1
}

Write-Host "Attempting database setup..." -ForegroundColor Yellow

# Read SQL file
$sqlContent = Get-Content "DATABASE_SETUP_SQL.sql" -Raw

# Split into individual statements (basic approach)
$statements = $sqlContent -split ";\s*\r?\n" | Where-Object { $_.Trim() -ne "" -and $_ -notmatch "^--" }

$headers = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Content-Type" = "application/json"
}

$successCount = 0
$failCount = 0

foreach ($statement in $statements) {
    $stmt = $statement.Trim()
    if ($stmt -eq "" -or $stmt.StartsWith("--")) { continue }
    
    try {
        # Try via REST API (limited - may not work for DDL)
        $body = @{ query = $stmt } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        $successCount++
        Write-Host "  ✓ Executed statement" -ForegroundColor Green
    } catch {
        $failCount++
        Write-Host "  ⚠ Statement requires SQL Editor: $($stmt.Substring(0, [Math]::Min(50, $stmt.Length)))..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Results: $successCount succeeded, $failCount require manual execution" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: DDL statements (CREATE, ALTER) typically require SQL Editor" -ForegroundColor Yellow
Write-Host "Please run DATABASE_SETUP_SQL.sql in Supabase SQL Editor" -ForegroundColor Yellow






