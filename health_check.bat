@echo off
echo 🏥 SwasthyaSetu System Health Check
echo ================================

echo.
echo 🔍 Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    goto :error
) else (
    node --version
    echo ✅ Node.js found
)

echo.
echo 🔍 Checking Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
    where python3 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Python not found
        goto :error
    ) else (
        python3 --version
        echo ✅ Python3 found
    )
) else (
    python --version
    echo ✅ Python found
)

echo.
echo 🔍 Checking npm packages...
cd frontend
if exist package.json (
    echo ✅ Frontend package.json found
    npm list --depth=0 > ../logs/npm-packages.log 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Frontend dependencies OK
    ) else (
        echo ⚠️ Some frontend dependencies may be missing
    )
) else (
    echo ❌ Frontend package.json not found
)
cd ..

echo.
echo 🔍 Checking Python packages...
cd ai\symptom-checker
if exist requirements.txt (
    echo ✅ Symptom checker requirements.txt found
    pip list > ..\..\logs\pip-packages.log 2>&1
    echo ✅ Python packages check complete
) else (
    echo ❌ Symptom checker requirements.txt not found
)
cd ..\..

echo.
echo 🔍 Checking ports...
netstat -an | findstr ":3000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 3000 is in use
) else (
    echo ✅ Port 3000 available
)

netstat -an | findstr ":3001 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 3001 is in use
) else (
    echo ✅ Port 3001 available
)

netstat -an | findstr ":5000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 5000 is in use
) else (
    echo ✅ Port 5000 available
)

netstat -an | findstr ":8000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 8000 is in use
) else (
    echo ✅ Port 8000 available
)

echo.
echo 🔍 Checking MongoDB...
tasklist | findstr "mongod" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running
) else (
    echo ⚠️ MongoDB not running
    echo   Start MongoDB with: mongod --dbpath ./data/db
)

echo.
echo 🔍 Checking configuration files...
if exist Login-RegistrationForm-MongoDB-main\.env (
    echo ✅ Auth backend .env found
) else (
    echo ❌ Auth backend .env missing
)

if exist ai\prescription-analyzer\backend\.env (
    echo ✅ Prescription analyzer .env found
) else (
    echo ❌ Prescription analyzer .env missing
)

echo.
echo 📊 Health Check Complete!
echo.
echo 💡 If you see any ❌ or ⚠️ issues above:
echo   1. Install missing dependencies
echo   2. Create missing .env files
echo   3. Start MongoDB if needed
echo   4. Kill processes on busy ports
echo.
echo 🚀 To start the system: run start_system.bat
echo.
pause
exit /b 0

:error
echo.
echo ❌ Critical dependencies missing!
echo Please install Node.js and Python first.
echo.
pause
exit /b 1