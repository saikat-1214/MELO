# ==============================================================================
# SocialConnect — Master Test & Validation Runner (PowerShell)
# Runs Pytest (Backend), Pytest (AI Service), Alembic SQL check, Frontend build
# ==============================================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$AllPassed = $true

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🧪 SocialConnect Master Test & Validation Suite" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Backend Tests
Write-Host "`n[1/4] Running Backend Pytest Suite..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "backend")
$env:PYTHONPATH = "."
.\venv\Scripts\python -m pytest tests/ --quiet --tb=short
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend tests failed!" -ForegroundColor Red
    $AllPassed = $false
} else {
    Write-Host "✅ Backend tests passed!" -ForegroundColor Green
}
Pop-Location

# 2. AI Microservice Tests
Write-Host "`n[2/4] Running AI Service Pytest Suite..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "ai-service")
$env:PYTHONPATH = "."
.\venv\Scripts\python -m pytest tests/ --quiet --tb=short
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AI service tests failed!" -ForegroundColor Red
    $AllPassed = $false
} else {
    Write-Host "✅ AI service tests passed!" -ForegroundColor Green
}
Pop-Location

# 3. Alembic Migrations SQL Verification
Write-Host "`n[3/4] Verifying Alembic Database Migrations..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "backend")
.\venv\Scripts\python -m alembic upgrade base:head --sql > $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Alembic migration check failed!" -ForegroundColor Red
    $AllPassed = $false
} else {
    Write-Host "✅ Alembic migrations SQL generated cleanly!" -ForegroundColor Green
}
Pop-Location

# 4. Frontend Type Check & Production Bundle Build
Write-Host "`n[4/4] Building Frontend (TypeScript check & Vite production build)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "frontend")
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    $AllPassed = $false
} else {
    Write-Host "✅ Frontend TypeScript and production build passed!" -ForegroundColor Green
}
Pop-Location

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($AllPassed) {
    Write-Host " 🎉 ALL VERIFICATION SUITES PASSED CLEANLY (100% ERROR-FREE)!" -ForegroundColor Green
} else {
    Write-Host " ⚠️ SOME SUITES REPORTED FAILURES. Check logs above." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan

