@echo off
title Crime Vision Runner
echo ===================================
echo   Starting Crime Vision Project
echo ===================================

echo.
echo Starting Frontend (Vite)...
start "CrimeVision Frontend" cmd /k "cd crimevision-frontend && npm.cmd run dev"

echo.
echo Starting Backend (Catalyst)...
start "CrimeVision Backend" cmd /k "cd crimevision-backend && catalyst serve"

echo.
echo Both services are starting in separate windows.
pause
