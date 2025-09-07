@echo off
echo 🔍 SwasthyaSetu Registration Debug Test
echo ======================================

echo.
echo Testing registration and login flow step by step...
echo.

:: Check if backend is running
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend not running. Starting backend...
    echo.
    start "Auth Backend" cmd /c "cd Login-RegistrationForm-MongoDB-main && npm start"
    echo ⏳ Waiting for backend to start...
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Backend is running
)

echo.
echo 📊 Checking storage status...
curl -s http://localhost:3000/api/storage/info 2>nul

echo.
echo.
echo 📝 Testing Patient Registration...
curl -v -X POST http://localhost:3000/api/auth/patient/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Debug Test Patient\",\"email\":\"debug.patient@test.com\",\"password\":\"password123\",\"dateOfBirth\":\"1990-01-01\",\"gender\":\"male\",\"address\":\"Test Address\"}" ^
  2>&1

echo.
echo.
echo 🔐 Testing Patient Login...
curl -v -X POST http://localhost:3000/api/auth/patient/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"debug.patient@test.com\",\"password\":\"password123\"}" ^
  2>&1

echo.
echo.
echo 📊 Checking users in storage...
if exist "Login-RegistrationForm-MongoDB-main\data\users.json" (
    echo 📄 JSON Storage Contents:
    type "Login-RegistrationForm-MongoDB-main\data\users.json"
) else (
    echo 📄 No JSON storage file found
)

echo.
echo.
echo 🔍 Debug Complete!
pause