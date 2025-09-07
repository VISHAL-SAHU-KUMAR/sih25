@echo off
echo 🧪 SwasthyaSetu Registration Test
echo =============================

echo.
echo 🔍 Testing backend registration endpoints...
echo.

:: Check if curl is available
where curl >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ curl not found. Please install curl to run API tests.
    echo Alternatively, test manually using Postman or browser.
    goto :manual_test
)

:: Test patient registration
echo 📝 Testing Patient Registration...
curl -X POST http://localhost:3000/api/auth/patient/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Patient\",\"email\":\"patient@test.com\",\"password\":\"password123\",\"dateOfBirth\":\"1990-01-01\",\"gender\":\"male\"}" ^
  2>nul

echo.
echo.

:: Test doctor registration
echo 👨‍⚕️ Testing Doctor Registration...
curl -X POST http://localhost:3000/api/auth/doctor/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Dr. Test\",\"email\":\"doctor@test.com\",\"password\":\"password123\",\"specialization\":\"General Medicine\"}" ^
  2>nul

echo.
echo.

:: Test authority registration
echo 🏛️ Testing Authority Registration...
curl -X POST http://localhost:3000/api/auth/authority/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Authority\",\"email\":\"authority@test.com\",\"password\":\"password123\",\"department\":\"Health Ministry\"}" ^
  2>nul

echo.
echo.

:: Test health endpoint
echo 🔍 Testing Health Endpoint...
curl -X GET http://localhost:3000/health 2>nul

echo.
echo.
echo ✅ API tests completed!
echo Check the responses above for success/error messages.
goto :end

:manual_test
echo.
echo 📝 Manual Testing Instructions:
echo.
echo 1. Start the authentication backend:
echo    cd Login-RegistrationForm-MongoDB-main
echo    npm start
echo.
echo 2. Test registration endpoints:
echo.
echo    Patient Registration:
echo    POST http://localhost:3000/api/auth/patient/register
echo    Body: {"name":"Test Patient","email":"patient@test.com","password":"password123"}
echo.
echo    Doctor Registration:
echo    POST http://localhost:3000/api/auth/doctor/register
echo    Body: {"name":"Dr. Test","email":"doctor@test.com","password":"password123"}
echo.
echo    Authority Registration:
echo    POST http://localhost:3000/api/auth/authority/register
echo    Body: {"name":"Test Authority","email":"authority@test.com","password":"password123"}
echo.
echo 3. Check responses for success messages and tokens.

:end
echo.
echo 🚀 Next Steps:
echo 1. Start MongoDB: mongod --dbpath ./data/db
echo 2. Start Auth Backend: cd Login-RegistrationForm-MongoDB-main && npm start
echo 3. Start Frontend: cd frontend && PORT=3001 npm start
echo 4. Test registration at: http://localhost:3001/register
echo.
pause