@echo off
cd /d "%~dp0"
if not exist node_modules\vite\bin\vite.js (
  echo Please run npm install once in this folder before starting.
  pause
  exit /b 1
)
echo Starting the frontend and backend. Keep this window open.
call npm start
pause
