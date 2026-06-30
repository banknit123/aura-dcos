@echo off
setlocal

echo Starting AURA Studio for hardware testing...
cd /d %~dp0\..\..

call npm install
start "AURA Studio" cmd /k "npm run dev --workspace @aura-dcos/studio"

echo.
echo Wait for Vite to show the local URL, usually http://localhost:5173/
echo Then open the controller and output windows from Studio.
echo.
pause
