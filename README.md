# 🏥 SwasthyaSetu - Healthcare Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org/)

Comprehensive healthcare platform combining modern web technologies with AI-powered features.

## 🌟 Features

- **Multi-Role Support**: Patients, Doctors, Authorities, Pharmacies
- **AI Symptom Checker**: ML-based disease prediction
- **Prescription OCR**: Automatic medicine extraction from images
- **Medical Chatbot**: 24/7 healthcare guidance
- **Multilingual**: English, Hindi, Bengali, Marathi, Telugu

## 🏗️ Architecture

| Component | Technology | Port | Purpose |
|-----------|------------|------|----------|
| Frontend | React 18 | 3001 | Main UI |
| Auth Backend | Node.js/Express | 3000 | Authentication |
| Symptom Checker | Python Flask | 5000 | AI analysis |
| Prescription Analyzer | FastAPI | 8000 | OCR processing |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+, Python 3.8+, MongoDB, Git

### Windows (Recommended)
```bash
# Clone repository
git clone <repo-url>
cd SwasthyaSetu-main

# Run automated setup
start_system.bat
```

### Linux/Mac
```bash
chmod +x start_system.sh
./start_system.sh
```

### Access Points
- Main App: http://localhost:3001
- API Docs: http://localhost:8000/docs
- System Status: Built-in monitor in top-right corner

## 📁 Structure

```
SwasthyaSetu-main/
├── frontend/                    # React main app
├── Login-RegistrationForm-MongoDB-main/  # Auth backend
├── ai/
│   ├── symptom-checker/         # AI symptom analysis
│   └── prescription-analyzer/   # OCR processing
├── SYSTEM_OVERVIEW.md           # Detailed docs
├── QUICK_START.md               # Setup guide
└── start_system.*               # Startup scripts
```

## 🔧 Configuration

**Auth Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/swasthyasetu
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3001
```

**Prescription Analyzer (.env):**
```env
COHERE_API_KEY=your-cohere-key
TESSERACT_PATH=tesseract
```

## 🌐 API Endpoints

### Auth API (3000)
- `POST /api/login` - User login
- `GET /health` - Health check

### Symptom Checker (5000)
- `POST /analyze` - Symptom analysis
- `GET /symptoms` - Available symptoms

### Prescription Analyzer (8000)
- `POST /api/analyze-prescription` - Image analysis
- `GET /docs` - API documentation

## 🛡️ Security

- JWT Authentication
- Rate Limiting
- Input Validation
- CORS Configuration
- Password Encryption

## 🏥 Medical Safety

- Emergency symptom detection
- Medical disclaimers
- Age-based risk assessment
- Professional recommendations

## 🛠️ Development

**Manual startup:**
```bash
# Terminal 1 - Auth
cd Login-RegistrationForm-MongoDB-main
npm start

# Terminal 2 - Symptom Checker
cd ai/symptom-checker
python run.py

# Terminal 3 - Prescription Analyzer
cd ai/prescription-analyzer/backend
python main.py

# Terminal 4 - Frontend
cd frontend
PORT=3001 npm start
```

## 🆘 Troubleshooting

- **Port conflicts**: Use different ports or kill existing processes
- **MongoDB issues**: Ensure MongoDB is running
- **Missing models**: Run training scripts first
- **CORS errors**: Check frontend URL configuration

### Health Checks
- Auth: http://localhost:3000/health
- Symptom: http://localhost:5000/health
- Prescription: http://localhost:8000/health

## 📚 Documentation

- [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) - Complete system guide
- [QUICK_START.md](QUICK_START.md) - Setup instructions
- Built-in API docs at http://localhost:8000/docs

---

**SwasthyaSetu** - *Bridging Healthcare with Technology* 🏥✨