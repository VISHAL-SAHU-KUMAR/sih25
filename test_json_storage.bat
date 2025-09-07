@echo off
echo 🧪 JSON Storage Test for SwasthyaSetu
echo ====================================

echo.
echo This script demonstrates the JSON file storage system
echo that can be used as an alternative to MongoDB.
echo.

set BASE_URL=http://localhost:3000

:: Check if server is running
curl -s %BASE_URL%/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server not running. Please start the authentication backend first:
    echo    cd Login-RegistrationForm-MongoDB-main
    echo    npm start
    echo.
    pause
    exit /b 1
)

echo ✅ Server is running
echo.

:: Get current storage info
echo 📊 Current Storage Information:
curl -s %BASE_URL%/api/storage/info | jq . 2>nul || curl -s %BASE_URL%/api/storage/info
echo.
echo.

:: Switch to JSON storage
echo 🔄 Switching to JSON storage...
curl -s -X POST %BASE_URL%/api/storage/switch -H "Content-Type: application/json" -d "{\"type\":\"json\"}" | jq . 2>nul || curl -s -X POST %BASE_URL%/api/storage/switch -H "Content-Type: application/json" -d "{\"type\":\"json\"}"
echo.
echo.

:: Test registration with JSON storage
echo 📝 Testing Registration with JSON Storage...
curl -s -X POST %BASE_URL%/api/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"JSON Test User\",\"email\":\"jsontest@example.com\",\"password\":\"password123\",\"role\":\"patient\"}" | jq . 2>nul || curl -s -X POST %BASE_URL%/api/signup -H "Content-Type: application/json" -d "{\"name\":\"JSON Test User\",\"email\":\"jsontest@example.com\",\"password\":\"password123\",\"role\":\"patient\"}"
echo.
echo.

:: Test login with JSON storage
echo 🔐 Testing Login with JSON Storage...
curl -s -X POST %BASE_URL%/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"jsontest@example.com\",\"password\":\"password123\"}" | jq . 2>nul || curl -s -X POST %BASE_URL%/api/login -H "Content-Type: application/json" -d "{\"username\":\"jsontest@example.com\",\"password\":\"password123\"}"
echo.
echo.

:: Show updated storage info
echo 📊 Updated Storage Information:
curl -s %BASE_URL%/api/storage/info | jq . 2>nul || curl -s %BASE_URL%/api/storage/info
echo.
echo.

:: Show JSON file contents
echo 📄 JSON File Contents:
if exist "Login-RegistrationForm-MongoDB-main\data\users.json" (
    type "Login-RegistrationForm-MongoDB-main\data\users.json"
) else (
    echo ❌ JSON file not found
)
echo.
echo.

echo ✅ JSON Storage Test Complete!
echo.
echo 💡 Key Features:
echo    • Automatic fallback when MongoDB is unavailable
echo    • Same API endpoints work with both storage types
echo    • JSON file stored in: Login-RegistrationForm-MongoDB-main\data\users.json
echo    • Can switch storage types at runtime
echo.
echo 🔧 To switch back to MongoDB:
echo    POST %BASE_URL%/api/storage/switch
echo    Body: {"type":"mongodb"}
echo.
pause