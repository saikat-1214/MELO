# ==============================================================================
# SocialConnect — Multi-Service Local Startup Script (Windows PowerShell)
# Launches Main Backend (:8000), AI Service (:8001), and Frontend (:5173)
# ==============================================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Starting SocialConnect Full-Stack Ecosystem" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start AI Microservice (:8001)
$AiPath = Join-Path $Root "ai-service"
Write-Host " -> Launching AI Recommendation Service on http://localhost:8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$AiPath'; `$env:PYTHONPATH='.'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

# 2. Start Core FastAPI Backend (:8000)
$BackendPath = Join-Path $Root "backend"
Write-Host " -> Launching Core FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; `$env:PYTHONPATH='.'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 3. Start Vite Frontend (:5173)
$FrontendPath = Join-Path $Root "frontend"
Write-Host " -> Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; `$env:NODE_OPTIONS='--max-old-space-size=2048 --max-semi-space-size=64'; npm run dev"

Write-Host "`nAll 3 services launched in separate windows!" -ForegroundColor Green
Write-Host " • Frontend UI:        http://localhost:5173" -ForegroundColor White
Write-Host " • Backend API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host " • AI Service Health:  http://localhost:8001/api/v1/health" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

