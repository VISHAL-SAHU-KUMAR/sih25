# SwasthyaSetu Quick Start Guide

## 🚀 Quick Setup Instructions

### Prerequisites Check
Before running the system, ensure you have:

1. **Node.js** (v16+): Download from [nodejs.org](https://nodejs.org/)
2. **Python** (v3.8+): Download from [python.org](https://python.org/)
3. **MongoDB**: Download from [mongodb.com](https://www.mongodb.com/)
4. **Git**: Download from [git-scm.com](https://git-scm.com/)

### Environment Setup

#### 1. Create MongoDB Database
```bash
# Start MongoDB service
mongod --dbpath ./data/db

# Or use MongoDB Compass for GUI
```

#### 2. Create Environment Files

**For Authentication Backend (`Login-RegistrationForm-MongoDB-main/.env`):**
```env
MONGODB_URI=mongodb://localhost:27017/swasthyasetu
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
PORT=3000
```

**For Prescription Analyzer (`ai/prescription-analyzer/backend/.env`):**
```env
COHERE_API_KEY=your-cohere-api-key-here
TESSERACT_PATH=tesseract
HOST=0.0.0.0
PORT=8000
RELOAD=true
LOG_LEVEL=info
```

### 🖥️ For Windows Users

1. **Double-click `start_system.bat`** to run the automated setup
2. The script will:
   - Check all prerequisites
   - Install dependencies
   - Start all services
   - Provide a menu for easy access

### 🐧 For Linux/Mac Users

1. **Make the script executable:**
   ```bash
   chmod +x start_system.sh
   ```

2. **Run the startup script:**
   ```bash
   ./start_system.sh
   ```

### 📱 Manual Startup (Alternative)

If the automated scripts don't work, start services manually:

#### Terminal 1 - Authentication Backend
```bash
cd Login-RegistrationForm-MongoDB-main
npm install
npm start
# Runs on http://localhost:3000
```

#### Terminal 2 - Symptom Checker
```bash
cd ai/symptom-checker
pip install -r requirements.txt
python run.py
# API: http://localhost:5000
# UI: http://localhost:3000 (integrated)
```

#### Terminal 3 - Prescription Analyzer
```bash
cd ai/prescription-analyzer/backend
pip install fastapi uvicorn python-multipart pillow
python main.py
# Runs on http://localhost:8000
```

#### Terminal 4 - Main Frontend
```bash
cd frontend
npm install
PORT=3001 npm start
# Runs on http://localhost:3001
```

## 🔧 Configuration Updates

### Update API Endpoints
Edit `frontend/src/utils/api.js`:

```javascript
import axios from 'axios';

// Authentication API
const authAPI = axios.create({ 
  baseURL: "http://localhost:3000/api" 
});

// Symptom Checker API
const symptomAPI = axios.create({
  baseURL: "http://localhost:5000"
});

// Prescription Analyzer API
const prescriptionAPI = axios.create({
  baseURL: "http://localhost:8000/api"
});

// Export all APIs
export { authAPI, symptomAPI, prescriptionAPI };
export default authAPI; // Maintain backward compatibility
```

### Update CORS Settings
Ensure all backend services allow your frontend URL:

```javascript
// In each backend service
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
```

## 🌐 Access Points

Once everything is running:

| Service | URL | Description |
|---------|-----|-------------|
| **Main App** | http://localhost:3001 | Primary user interface |
| **Auth Backend** | http://localhost:3000 | User authentication |
| **Symptom Checker** | http://localhost:5000 | AI symptom analysis |
| **Prescription OCR** | http://localhost:8000 | Prescription analyzer |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or change port in package.json
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Start MongoDB manually
   mongod --dbpath ./data/db
   # Create data directory if needed
   mkdir -p ./data/db
   ```

3. **Python Packages Missing**
   ```bash
   # Install missing packages
   pip install -r requirements.txt
   # Or install individually
   pip install flask pandas scikit-learn
   ```

4. **Node Modules Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Health Checks

Visit these URLs to verify services:
- Auth: http://localhost:3000/health
- Symptom Checker: http://localhost:5000/health  
- Prescription Analyzer: http://localhost:8000/health

### Log Files

Check `logs/` directory for detailed error messages:
- `auth-backend.log`
- `symptom-checker.log`
- `prescription-analyzer.log`
- `main-frontend.log`

## 🎯 First Steps

1. **Start all services** using the provided scripts
2. **Open the main frontend** at http://localhost:3001
3. **Register a new account** or login with existing credentials
4. **Explore the features**:
   - Symptom tracking and analysis
   - Prescription upload and analysis
   - Multi-language support
   - Role-based dashboards

## 🔒 Security Notes

- Change default JWT secrets before production
- Configure proper CORS origins
- Set up MongoDB authentication
- Use HTTPS in production
- Regularly update dependencies

## 📞 Support

If you encounter issues:
1. Check the system logs in the `logs/` directory
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check port availability (3000, 3001, 5000, 8000)
5. Review the SYSTEM_OVERVIEW.md for detailed architecture

Happy coding! 🏥✨