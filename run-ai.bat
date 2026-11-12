@echo off
title SocialConnect AI Service (Port 8001)
cd /d "%~dp0ai-service"
set PYTHONPATH=.
echo ===================================================
echo Starting SocialConnect AI Service on http://127.0.0.1:8001
echo Health Check: http://127.0.0.1:8001/api/v1/health
echo ===================================================
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
pause

