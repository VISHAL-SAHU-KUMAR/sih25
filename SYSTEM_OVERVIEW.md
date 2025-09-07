# SwasthyaSetu Healthcare System - Complete Overview

## 🏥 System Architecture

SwasthyaSetu is a comprehensive healthcare platform with multiple interconnected components:

### 1. Frontend Application (React)
- **Location**: `frontend/`
- **Purpose**: Main user interface for patients, doctors, and authorities
- **Features**:
  - Multi-language support (English, Hindi, Bengali, Marathi, Telugu)
  - Role-based dashboards (Patient, Doctor, Authority, Pharmacy)
  - Symptom tracker and chatbot integration
  - Prescription management and pharmacy view

### 2. Authentication Backend (Node.js/Express)
- **Location**: `Login-RegistrationForm-MongoDB-main/`
- **Purpose**: User authentication and registration
- **Database**: MongoDB with Mongoose
- **Features**:
  - JWT-based authentication
  - Role-based access control
  - Rate limiting and security middleware
  - Password encryption with bcryptjs

### 3. AI Symptom Checker
- **Location**: `ai/symptom-checker/`
- **Purpose**: Machine learning-based symptom analysis
- **Technology**: Python Flask + Scikit-learn
- **Features**:
  - ML model for disease prediction
  - Comprehensive symptom analysis
  - Emergency keyword detection
  - Age and gender-based risk assessment

### 4. AI Prescription Analyzer
- **Location**: `ai/prescription-analyzer/`
- **Purpose**: OCR and NLP-based prescription analysis
- **Technology**: Python FastAPI + OCR + Cohere AI
- **Features**:
  - Prescription image analysis
  - Medicine extraction and validation
  - Order creation and management
  - Medicine database integration

## 🔗 System Connections

### Port Configuration
- **Frontend**: Port 3000 (React development server)
- **Auth Backend**: Port 3000 (Express server)
- **Symptom Checker**: Port 5000 (Flask API)
- **Prescription Analyzer**: Port 8000 (FastAPI)

### API Integrations
1. **Frontend ↔ Auth Backend**: User authentication and session management
2. **Frontend ↔ Symptom Checker**: Symptom analysis and disease prediction
3. **Frontend ↔ Prescription Analyzer**: Prescription OCR and medicine ordering
4. **Cross-component**: CORS enabled for all services

## 📁 Project Structure

```
SwasthyaSetu-main/
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   ├── pages/                     # Route-based pages
│   │   ├── locales/                   # Multi-language translations
│   │   └── utils/api.js               # API integration utilities
│   └── package.json                   # Frontend dependencies
├── Login-RegistrationForm-MongoDB-main/ # Authentication backend
│   ├── src/
│   │   ├── index.js                   # Express server
│   │   └── mongodb.js                 # MongoDB connection
│   └── package.json                   # Backend dependencies
├── ai/
│   ├── symptom-checker/               # AI symptom analysis
│   │   ├── backend/                   # Flask API
│   │   ├── frontend/                  # React UI (standalone)
│   │   ├── models/                    # ML models and data
│   │   ├── database/                  # Training datasets
│   │   └── run.py                     # Application runner
│   └── prescription-analyzer/         # AI prescription OCR
│       ├── backend/                   # FastAPI server
│       ├── frontend/                  # React UI (standalone)
│       └── models/                    # AI models and data
└── netlify.toml                       # Deployment configuration
```

## 🚀 System Startup Guide

### Prerequisites
1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **MongoDB** (local or cloud instance)
4. **Tesseract OCR** (for prescription analysis)
5. **Git** (for version control)

### Environment Setup

#### 1. MongoDB Configuration
Create `.env` file in `Login-RegistrationForm-MongoDB-main/`:
```env
MONGODB_URI=mongodb://localhost:27017/swasthyasetu
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
PORT=3000
```

#### 2. AI Services Configuration
Create `.env` file in `ai/prescription-analyzer/backend/`:
```env
COHERE_API_KEY=your-cohere-api-key
TESSERACT_PATH=/usr/bin/tesseract
HOST=0.0.0.0
PORT=8000
RELOAD=true
LOG_LEVEL=info
```

### Starting the System

#### Method 1: Manual Startup (Recommended for Development)

1. **Start MongoDB**:
   ```bash
   mongod --dbpath /path/to/your/db
   ```

2. **Start Authentication Backend**:
   ```bash
   cd Login-RegistrationForm-MongoDB-main
   npm install
   npm start
   # Runs on http://localhost:3000
   ```

3. **Start Symptom Checker**:
   ```bash
   cd ai/symptom-checker
   pip install -r requirements.txt
   python run.py
   # Runs Flask API on http://localhost:5000
   # Runs React UI on http://localhost:3000
   ```

4. **Start Prescription Analyzer**:
   ```bash
   cd ai/prescription-analyzer/backend
   pip install -r integration/requirements.txt
   python main.py
   # Runs on http://localhost:8000
   ```

5. **Start Main Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   # Runs on http://localhost:3001 (different port to avoid conflicts)
   ```

#### Method 2: Automated Startup

Use the built-in runners:

1. **Symptom Checker** (includes both backend and frontend):
   ```bash
   cd ai/symptom-checker
   python run.py
   ```

2. **Other services** need to be started manually as shown above.

## 🔧 Configuration Details

### Frontend API Configuration
Edit `frontend/src/utils/api.js` to match your backend URLs:
```javascript
const api = axios.create({ 
  baseURL: "http://localhost:3000/api"  // Auth backend
});

// Add additional API endpoints for AI services
const symptomAPI = axios.create({
  baseURL: "http://localhost:5000"     // Symptom checker
});

const prescriptionAPI = axios.create({
  baseURL: "http://localhost:8000"     // Prescription analyzer
});
```

### CORS Configuration
All backend services are configured with CORS enabled for local development:
- Frontend origins: `http://localhost:3000`, `http://localhost:3001`
- AI services accept all origins in development mode

## 🔄 Data Flow

### User Authentication Flow
1. User registers/logs in via frontend
2. Frontend sends credentials to auth backend (`/api/login`)
3. Backend validates against MongoDB
4. JWT token returned and stored in frontend
5. Token used for subsequent API calls

### Symptom Analysis Flow
1. User enters symptoms in frontend
2. Frontend sends to symptom checker API (`/analyze`)
3. AI processes symptoms using ML model
4. Risk assessment and disease predictions returned
5. Results displayed with safety warnings

### Prescription Analysis Flow
1. User uploads prescription image
2. Frontend sends to prescription analyzer (`/api/analyze-prescription`)
3. OCR extracts text from image
4. NLP processes and structures data
5. Medicine information and ordering options returned

## 🚨 Important Notes

### Security Considerations
- JWT secrets should be properly configured
- Rate limiting is enabled on authentication endpoints
- CORS is configured for development (restrict in production)
- Input validation is implemented across all services

### Medical Safety Features
- Emergency keyword detection in symptom checker
- Medical disclaimers prominently displayed
- Age-based risk assessment
- Recommendation to consult healthcare professionals

### Development vs Production
- Current configuration is for development
- Production deployment requires environment-specific configuration
- Database connections, API keys, and CORS settings need adjustment

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**: Multiple services use port 3000
   - Solution: Modify port in package.json or environment variables

2. **MongoDB Connection**: Authentication backend fails to start
   - Solution: Ensure MongoDB is running and connection string is correct

3. **AI Model Not Found**: Symptom checker returns errors
   - Solution: Run model training script first: `python ai/symptom-checker/backend/model_trainer.py`

4. **OCR Errors**: Prescription analyzer fails
   - Solution: Install Tesseract OCR and configure TESSERACT_PATH

5. **CORS Errors**: API calls blocked
   - Solution: Verify CORS configuration in backend services

### Health Check Endpoints
- Auth Backend: `http://localhost:3000/health`
- Symptom Checker: `http://localhost:5000/health`
- Prescription Analyzer: `http://localhost:8000/health`

## 🎯 Key Features

### Multi-Language Support
- Internationalization (i18n) implemented
- Supports: English, Hindi, Bengali, Marathi, Telugu
- Language switching via floating action button

### Role-Based Access
- **Patients**: Symptom tracking, appointments, prescriptions
- **Doctors**: Patient management, prescription writing
- **Authorities**: Analytics and oversight
- **Pharmacies**: Medicine inventory and orders

### AI-Powered Features
- **Symptom Analysis**: ML-based disease prediction
- **Prescription OCR**: Image-to-text extraction
- **Chatbot**: Healthcare guidance and support
- **Analytics**: Patient and medicine insights

This system represents a comprehensive healthcare platform integrating modern web technologies with AI capabilities for improved healthcare delivery and management.