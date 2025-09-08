# Windows Setup Guide for SwasthyaSetu

## The Issue
You're encountering a NumPy compilation error because Windows doesn't have a C/C++ compiler installed by default. Python packages like NumPy, SciPy, and OpenCV need to compile native code during installation.

## Quick Fix (Recommended)

### Option 1: Use the Provided Fix Script
1. Run the dependency fix script I created:
   ```cmd
   fix_dependencies.bat
   ```
   This script will install pre-compiled versions of all packages to avoid compilation issues.

### Option 2: Install Visual Studio Build Tools
If you want the complete development environment:

1. **Download Microsoft C++ Build Tools**:
   - Go to https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Download "Build Tools for Visual Studio 2022"
   - Run the installer and select "C++ build tools" workload

2. **Alternative: Install Visual Studio Community**:
   - Download from https://visualstudio.microsoft.com/vs/community/
   - During installation, select "Desktop development with C++" workload

3. **Restart your command prompt** after installation

### Option 3: Use conda/miniconda (Alternative)
If pip continues to have issues:

1. **Install Miniconda**:
   ```cmd
   # Download from https://docs.conda.io/en/latest/miniconda.html
   ```

2. **Install packages with conda**:
   ```cmd
   conda install numpy pandas scikit-learn opencv
   conda install -c conda-forge easyocr pytesseract
   ```

## Verification Steps

After running the fix script, verify the installation:

```cmd
python -c "import numpy; print('NumPy version:', numpy.__version__)"
python -c "import pandas; print('Pandas version:', pandas.__version__)"
python -c "import sklearn; print('Scikit-learn version:', sklearn.__version__)"
python -c "import cv2; print('OpenCV version:', cv2.__version__)"
```

## Next Steps

1. **Run the system**:
   ```cmd
   start_system.bat
   ```

2. **If you still get errors**:
   - Check the logs in the `logs` directory
   - Try running individual services manually to isolate issues

## Common Windows-Specific Issues

### Issue: "Microsoft Visual C++ 14.0 is required"
**Solution**: Install Visual Studio Build Tools (Option 2 above)

### Issue: "Failed building wheel for [package]"
**Solution**: Use pre-compiled wheels:
```cmd
pip install --only-binary=all [package-name]
```

### Issue: PATH issues with Python/pip
**Solution**: Reinstall Python with "Add to PATH" option checked

### Issue: Long path names
**Solution**: Enable long path support in Windows:
```cmd
# Run as Administrator
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1
```

## System Requirements for SwasthyaSetu

- **OS**: Windows 10/11
- **Python**: 3.8+ (3.11 recommended)
- **Node.js**: 16+ (18 recommended)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **Internet**: Required for initial setup and AI services

## Troubleshooting

If the fix script doesn't work:

1. **Clear pip cache**:
   ```cmd
   pip cache purge
   ```

2. **Update pip and tools**:
   ```cmd
   python -m pip install --upgrade pip setuptools wheel
   ```

3. **Try installing packages individually**:
   ```cmd
   pip install --only-binary=all numpy==1.24.3
   pip install --only-binary=all pandas==2.0.3
   ```

4. **Check for Windows-specific wheels**:
   Visit https://www.lfd.uci.edu/~gohlke/pythonlibs/ for pre-compiled Windows packages

## Contact
If issues persist, the problem may be environment-specific. The fix script addresses the most common Windows compilation issues for Python packages.