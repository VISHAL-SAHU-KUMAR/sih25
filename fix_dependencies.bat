@echo off
setlocal enabledelayedexpansion

echo.
echo 🔧 SwasthyaSetu Dependency Fix for Windows
echo ==========================================
echo.

:: Check Python version
for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Current Python version: !PYTHON_VERSION!

:: Upgrade pip, setuptools, and wheel first
echo.
echo 📦 Upgrading core Python tools...
python -m pip install --upgrade pip setuptools wheel

:: Install Microsoft C++ Build Tools compatible packages
echo.
echo 🛠️  Installing Windows-compatible packages...

:: Use pip's --only-binary option to avoid compilation
echo Installing NumPy (pre-compiled)...
python -m pip install --only-binary=all numpy==1.24.3

echo Installing SciPy (pre-compiled)...
python -m pip install --only-binary=all scipy==1.10.1

echo Installing scikit-learn (pre-compiled)...
python -m pip install --only-binary=all scikit-learn==1.3.0

echo Installing pandas (pre-compiled)...
python -m pip install --only-binary=all pandas==2.0.3

echo Installing OpenCV (pre-compiled)...
python -m pip install --only-binary=all opencv-python==4.8.1.78

echo Installing Pillow...
python -m pip install --only-binary=all Pillow==10.0.1

echo Installing other packages...
python -m pip install joblib requests Flask==2.3.3 Flask-CORS==4.0.0

echo.
echo ✅ Core packages installed. Now installing AI service dependencies...

:: Install symptom checker requirements (modified)
echo.
echo 🩺 Installing Symptom Checker dependencies...
cd ai\symptom-checker
python -m pip install --only-binary=all -r requirements.txt --force-reinstall
cd ..\..

:: Install prescription analyzer requirements (with workarounds)
echo.
echo 💊 Installing Prescription Analyzer dependencies...
cd ai\prescription-analyzer\backend

:: Install packages one by one to handle failures gracefully
python -m pip install streamlit==1.28.1
python -m pip install fastapi==0.104.1
python -m pip install uvicorn==0.24.0
python -m pip install python-multipart==0.0.6
python -m pip install aiofiles==23.2.1
python -m pip install python-dotenv==1.0.0
python -m pip install python-jose==3.3.0

:: Install easyocr (this might need special handling)
echo Installing EasyOCR...
python -m pip install --only-binary=all easyocr==1.7.0 || (
    echo ⚠️  EasyOCR failed, trying alternative...
    python -m pip install easyocr --no-deps
)

python -m pip install pytesseract==0.3.10
python -m pip install --only-binary=all scikit-image==0.22.0 || python -m pip install scikit-image --no-deps

:: Install NLP packages
python -m pip install spacy==3.7.2
python -m pip install fuzzywuzzy==0.18.0
python -m pip install python-Levenshtein==0.21.1

:: Download spacy model
echo Downloading spaCy English model...
python -m spacy download en_core_web_sm

:: Install LangChain packages
python -m pip install langchain==0.0.292
python -m pip install cohere==4.32
python -m pip install pydantic==2.5.0

cd ..\..\..

echo.
echo ✅ Installation complete!
echo.
echo 🚀 You can now run the system with: start_system.bat
echo.
pause