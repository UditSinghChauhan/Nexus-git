@echo off
echo.
echo ============================================
echo VCS Application - Quick Setup Script
echo ============================================
echo.

echo [1] Installing Backend Dependencies...
cd /D "C:\Users\udits\OneDrive\Desktop\VCS\Github Clone\Github\backend-main"
call npm install
echo [✓] Backend dependencies installed

echo.
echo [2] Installing Frontend Dependencies...
cd /D "C:\Users\udits\OneDrive\Desktop\VCS\Github Clone\Github\frontend-main"
call npm install
echo [✓] Frontend dependencies installed

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo.
echo 1. Open Terminal 1 and run:
echo    cd "C:\Users\udits\OneDrive\Desktop\VCS\Github Clone\Github\backend-main"
echo    npm run dev
echo.
echo 2. Open Terminal 2 and run:
echo    cd "C:\Users\udits\OneDrive\Desktop\VCS\Github Clone\Github\frontend-main"
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:5173
echo.
echo ============================================
echo.
pause
