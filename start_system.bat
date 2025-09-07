@echo off
setlocal enabledelayedexpansion

:: SwasthyaSetu System Startup Script for Windows
:: This script helps start all components of the SwasthyaSetu healthcare system

echo.
echo 🏥 SwasthyaSetu Healthcare System Startup
echo ========================================

:: Function to check if a command exists
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16 or higher
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js !NODE_VERSION!
)

:: Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    where python3 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Python not found. Please install Python 3.8 or higher
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
    )
) else (
    set PYTHON_CMD=python
)

for /f "tokens=*" %%i in ('!PYTHON_CMD! --version') do set PYTHON_VERSION=%%i
echo ✅ !PYTHON_VERSION!

:: Check pip
where pip >nul 2>&1
if %errorlevel% neq 0 (
    where pip3 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ pip not found. Please install pip
        pause
        exit /b 1
    ) else (
        set PIP_CMD=pip3
    )
) else (
    set PIP_CMD=pip
)
echo ✅ pip found

:: Create logs directory
if not exist logs mkdir logs

echo.
echo 📦 Installing dependencies...
echo.

:: Install Node.js dependencies
echo Installing Node.js dependencies for Authentication Backend...
cd Login-RegistrationForm-MongoDB-main
if exist package.json (
    call npm install
) else (
    echo ❌ package.json not found in Login-RegistrationForm-MongoDB-main
)
cd ..

echo Installing Node.js dependencies for Main Frontend...
cd frontend
if exist package.json (
    call npm install
) else (
    echo ❌ package.json not found in frontend
)
cd ..

echo Installing Node.js dependencies for Symptom Checker Frontend...
cd ai\symptom-checker\frontend
if exist package.json (
    call npm install
) else (
    echo ⚠️ package.json not found in ai\symptom-checker\frontend
)
cd ..\..\..

echo Installing Node.js dependencies for Prescription Analyzer Frontend...
cd ai\prescription-analyzer\frontend
if exist package.json (
    call npm install
) else (
    echo ⚠️ package.json not found in ai\prescription-analyzer\frontend
)
cd ..\..\..

:: Install Python dependencies
echo Installing Python dependencies for Symptom Checker...
cd ai\symptom-checker
if exist requirements.txt (
    !PIP_CMD! install -r requirements.txt
) else (
    echo ⚠️ requirements.txt not found in ai\symptom-checker
)
cd ..\..

echo Installing Python dependencies for Prescription Analyzer...
cd ai\prescription-analyzer\backend
if exist integration\requirements.txt (
    !PIP_CMD! install -r integration\requirements.txt
) else (
    echo ⚠️ requirements.txt not found in ai\prescription-analyzer\backend\integration
)
cd ..\..\..

echo.
echo 🚀 Starting services...
echo.

:: Start Authentication Backend
echo Starting Authentication Backend...
cd Login-RegistrationForm-MongoDB-main
start "Auth Backend" cmd /c "npm start > ..\logs\auth-backend.log 2>&1"
cd ..
timeout /t 3 /nobreak >nul

:: Start Symptom Checker
echo Starting Symptom Checker...
cd ai\symptom-checker
start "Symptom Checker" cmd /c "!PYTHON_CMD! run.py > ..\..\logs\symptom-checker.log 2>&1"
cd ..\..
timeout /t 3 /nobreak >nul

:: Start Prescription Analyzer
echo Starting Prescription Analyzer...
cd ai\prescription-analyzer\backend
start "Prescription Analyzer" cmd /c "!PYTHON_CMD! main.py > ..\..\..\logs\prescription-analyzer.log 2>&1"
cd ..\..\..
timeout /t 5 /nobreak >nul

:: Start Main Frontend on different port
echo Starting Main Frontend...
cd frontend
set PORT=3001
set BROWSER=none
start "Main Frontend" cmd /c "npm start > ..\logs\main-frontend.log 2>&1"
cd ..

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Checking service health...

:: Simple health check using curl if available
where curl >nul 2>&1
if %errorlevel% equ 0 (
    echo Checking Auth Backend...
    curl -s http://localhost:3000/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Auth Backend - Ready
    ) else (
        echo ❌ Auth Backend - Not responding
    )
    
    echo Checking Symptom Checker...
    curl -s http://localhost:5000/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Symptom Checker - Ready
    ) else (
        echo ❌ Symptom Checker - Not responding
    )
    
    echo Checking Prescription Analyzer...
    curl -s http://localhost:8000/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Prescription Analyzer - Ready
    ) else (
        echo ❌ Prescription Analyzer - Not responding
    )
) else (
    echo ⚠️ curl not found. Cannot perform automatic health checks.
    echo Please check manually at the URLs below.
)

echo.
echo 🌐 Access Your Applications:
echo =====================================
echo 👥 Main Frontend:        http://localhost:3001
echo 🔐 Auth Backend:         http://localhost:3000
echo 🩺 Symptom Checker:      http://localhost:5000
echo 💊 Prescription Analyzer: http://localhost:8000/docs
echo 📊 API Documentation:    http://localhost:8000/docs
echo.

echo 📋 Important Notes:
echo • Main application runs on port 3001 to avoid conflicts
echo • All logs are stored in the 'logs' directory
echo • Check logs if services don't start properly
echo • MongoDB should be running separately

echo.
echo ✨ SwasthyaSetu is now running!
echo 📖 Check SYSTEM_OVERVIEW.md for detailed documentation
echo.

:: Create a simple menu for user interaction
:menu
echo Choose an option:
echo 1. Open Main Frontend in browser
echo 2. Open API Documentation
echo 3. View service logs
echo 4. Check service status
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    start http://localhost:3001
    goto menu
)
if "%choice%"=="2" (
    start http://localhost:8000/docs
    goto menu
)
if "%choice%"=="3" (
    echo Available log files:
    dir logs\*.log /b 2>nul
    echo.
    set /p logfile="Enter log filename to view (or press Enter to skip): "
    if not "!logfile!"=="" (
        if exist logs\!logfile! (
            type logs\!logfile!
        ) else (
            echo File not found.
        )
    )
    echo.
    goto menu
)
if "%choice%"=="4" (
    echo Checking running processes...
    tasklist | findstr "node.exe python.exe" 2>nul
    echo.
    goto menu
)
if "%choice%"=="5" (
    goto end
)

echo Invalid choice. Please try again.
goto menu

:end
echo.
echo 👋 Thank you for using SwasthyaSetu!
echo Note: Services are still running. Close the terminal windows to stop them.
pause