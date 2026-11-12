@echo off
title SocialConnect Backend (Port 8000)
cd /d "%~dp0backend"
set PYTHONPATH=.
echo ===================================================
echo Starting SocialConnect Backend on http://127.0.0.1:8000
echo Swagger Docs: http://127.0.0.1:8000/docs
echo ===================================================
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
