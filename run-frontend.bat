@echo off
title SocialConnect Frontend (Port 5173)
cd /d "%~dp0frontend"
set NODE_OPTIONS=--max-old-space-size=2048 --max-semi-space-size=64
echo ===================================================
echo Starting SocialConnect Frontend on http://localhost:5173
echo ===================================================
call npm run dev
pause
