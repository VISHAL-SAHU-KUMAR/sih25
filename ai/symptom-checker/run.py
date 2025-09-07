#!/usr/bin/env python3
"""
Medical Symptom Checker - Application Runner
This script handles the setup and running of the entire application.
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path
from config import config
import sys
from pathlib import Path

# Add backend folder to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR / "backend"))


from backend.model_trainer import MedicalModelTrainer

Config = config['development']   # 👈 force dev locally


def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n🔍 Checking dependencies...")
    
    required_packages = {
        'flask': 'flask',
        'pandas': 'pandas',
        'scikit-learn': 'sklearn',
        'joblib': 'joblib',
        'numpy': 'numpy'
    }
    
    missing_packages = []
    
    for package, import_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Missing dependencies: {', '.join(missing_packages)}")
        print("Install them with:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True


def setup_directories():
    """Create necessary directories"""
    print("\n📁 Setting up directories...")
    Config.ensure_directories()
    print("   ✅ Directories created")

def check_datasets():
    """Check if required datasets exist"""
    print("\n📊 Checking datasets...")
    
    files_exist, missing_files = Config.validate_required_files()
    
    if not files_exist:
        print("❌ Required dataset files are missing:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure the following files exist:")
        print("   - database/Training.csv")
        print("   - database/Testing.csv")
        return False
    
    print("   ✅ Training.csv found")
    print("   ✅ Testing.csv found")
    return True

def check_trained_model():
    """Check if trained model exists"""
    print("\n🤖 Checking trained model...")
    
    model_exists, existing_files = Config.check_model_files()
    
    if not model_exists:
        print("❌ Trained model not found")
        print("   Available model files:")
        for file in existing_files:
            print(f"     ✅ {file.name}")
        return False
    
    print("   ✅ Trained model found")
    return True

def train_model():
    """Train the machine learning model"""
    print("\n🚀 Starting model training...")
    print("   This may take several minutes...")
    
    try:
        # Import and run training
        success = MedicalModelTrainer()
        
        if success:
            print("   ✅ Model training completed successfully")
            return True
        else:
            print("   ❌ Model training failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Error during training: {str(e)}")
        return False

def start_backend():
    """Start the Flask backend server"""
    print("\n🔧 Starting backend server...")
    
    try:
        # Change to backend directory and start server
        backend_dir = Path(__file__).parent
        os.chdir(backend_dir)
        
        # Import and start Flask app
        from app import app
        
        print("   🚀 Backend server starting on http://localhost:5000")
        app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
        
    except Exception as e:
        print(f"   ❌ Error starting backend: {str(e)}")
        return False

def start_frontend():
    """Start the React frontend server"""
    print("\n⚛️  Starting frontend server...")
    
    frontend_dir = Path(__file__).parent / 'frontend'
    
    if not frontend_dir.exists():
        print("   ❌ Frontend directory not found")
        return False
    
    try:
        # Use npm.cmd for Windows
        npm_executable = "npm.cmd"  # works in Command Prompt / Git Bash

        # Check if node_modules exists, if not install dependencies
        node_modules = frontend_dir / 'node_modules'
        if not node_modules.exists():
            print("   📦 Installing frontend dependencies...")
            subprocess.run([npm_executable, 'install'], cwd=frontend_dir, check=True)
        
        print("   🚀 Frontend server starting on http://localhost:3000")
        subprocess.Popen(
            [npm_executable, 'start'], 
            cwd=frontend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        return True
        
    except subprocess.CalledProcessError:
        print("   ❌ npm not found. Please install Node.js and npm")
        return False
    except Exception as e:
        print(f"   ❌ Error starting frontend: {str(e)}")
        return False


import socket

def wait_for_port(host, port, timeout=30):
    import time
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except:
            time.sleep(1)
    return False

def open_browser():
    if wait_for_port('localhost', 3000, timeout=30):
        import webbrowser
        webbrowser.open('http://localhost:3000')
        print("   🌐 Opening application in browser...")
    else:
        print("   ⚠️ Frontend did not start in time. Open manually at http://localhost:3000")


def main():
    """Main application runner"""
    print("🏥 Medical Symptom Checker - Application Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Check dependencies
    if not check_dependencies():
        print("\n💡 Install dependencies with:")
        print("   pip install -r requirements.txt")
        return False
    
    # Setup directories
    setup_directories()
    
    # Check datasets
    if not check_datasets():
        return False
    
    # Check or train model
    if not check_trained_model():
        print("\n🤖 Training machine learning model...")
        if not train_model():
            print("❌ Model training failed. Cannot continue.")
            return False
    
    print("\n" + "=" * 60)
    print("🎉 Setup completed successfully!")
    
    # Start backend server in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend if available
    frontend_started = start_frontend()
    
    # Open browser
    if frontend_started:
        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()
    
    print("\n" + "=" * 60)
    print("🚀 Medical Symptom Checker is now running!")
    print("=" * 60)
    print("📱 Frontend: http://localhost:3000")
    print("🔧 Backend API: http://localhost:5000")
    print("📚 API Health: http://localhost:5000/health")
    print("=" * 60)
    print("\n⚠️  IMPORTANT MEDICAL DISCLAIMER:")
    print("This application is for educational purposes only.")
    print("Always consult healthcare professionals for medical advice.")
    print("Call emergency services for serious symptoms.")
    print("=" * 60)
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down Medical Symptom Checker...")
        return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            print("\n❌ Application failed to start properly.")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)