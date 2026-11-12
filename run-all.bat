@echo off
title SocialConnect All-in-One Launcher
cd /d "%~dp0"
echo Starting all services...
start "SocialConnect Backend (8000)" cmd /c "run-backend.bat"
start "SocialConnect Frontend (5173)" cmd /c "run-frontend.bat"
start "SocialConnect AI Service (8001)" cmd /c "run-ai.bat"
echo Done! 3 terminal windows have been opened.

