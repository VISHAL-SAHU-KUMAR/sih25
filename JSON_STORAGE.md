# 📄 JSON File Storage System for SwasthyaSetu

## 🎯 **Overview**

The SwasthyaSetu system now includes a **JSON file storage system** that can be used as an alternative to MongoDB for user authentication and registration. This is particularly useful for:

- **Testing environments** where MongoDB might not be available
- **Development setups** with minimal dependencies
- **Fallback scenarios** when MongoDB connection fails
- **Demonstration purposes** without requiring database setup

## 🏗️ **Architecture**

### **Hybrid Storage System**
```
┌─────────────────┐
│   UserStorage   │ ← Main Interface
├─────────────────┤
│ Auto-detection  │
│ MongoDB/JSON    │
└─────────┬───────┘
          │
    ┌─────▼─────┐         ┌─────────────┐
    │ MongoDB   │   OR    │ JSON File   │
    │ Storage   │         │ Storage     │
    └───────────┘         └─────────────┘
```

### **Key Components**

1. **`jsonStorage.js`** - Core JSON file operations
2. **`userStorage.js`** - Hybrid storage manager
3. **`users.json`** - Data file (auto-created)
4. **Environment variable** - `USE_JSON_STORAGE`

## 📁 **File Structure**

```
Login-RegistrationForm-MongoDB-main/
├── src/
│   ├── jsonStorage.js      # JSON storage implementation
│   ├── userStorage.js      # Hybrid storage manager
│   └── index.js           # Updated to use hybrid storage
├── data/
│   └── users.json         # User data file (auto-created)
└── .env                   # Storage configuration
```

## ⚙️ **Configuration**

### **Environment Variables**

Add to `.env` file:
```env
# Storage Configuration
USE_JSON_STORAGE=false    # true = JSON, false = MongoDB (default)
```

### **Automatic Detection**

The system automatically detects MongoDB availability:
- If MongoDB is **available** → Uses MongoDB
- If MongoDB is **unavailable** → Falls back to JSON storage
- Manual override via environment variable or API

## 🛠️ **Usage**

### **1. Enable JSON Storage**

**Method A: Environment Variable**
```env
USE_JSON_STORAGE=true
```

**Method B: Runtime API Call**
```bash
curl -X POST http://localhost:3000/api/storage/switch \
  -H "Content-Type: application/json" \
  -d '{"type":"json"}'
```

### **2. Check Storage Status**

```bash
curl http://localhost:3000/api/storage/info
```

**Response:**
```json
{
  "success": true,
  "storage": {
    "currentType": "JSON",
    "mongoAvailable": false,
    "useJSON": true,
    "stats": {
      "totalUsers": 3,
      "usersByRole": {
        "patient": 2,
        "doctor": 1
      },
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## 📊 **JSON File Format**

**`data/users.json`:**
```json
{
  "users": [
    {
      "id": "uuid-generated-id",
      "name": "John Doe",
      "email": "john@example.com",
      "password": "hashed-password",
      "role": "patient",
      "dateOfBirth": "1990-01-01",
      "gender": "male",
      "address": "123 Main St",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "isActive": true,
      "isVerified": false
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "version": "1.0",
    "description": "Temporary user storage for SwasthyaSetu",
    "totalUsers": 1
  }
}
```

## 🔧 **API Endpoints**

All existing endpoints work with both storage types:

### **Registration**
```bash
POST /api/auth/patient/register
POST /api/auth/doctor/register
POST /api/auth/authority/register
```

### **Login**
```bash
POST /api/auth/patient/login
POST /api/auth/doctor/login
POST /api/auth/authority/login
```

### **Storage Management**
```bash
GET  /api/storage/info          # Get storage information
POST /api/storage/switch        # Switch storage type
GET  /api/users                 # List all users (requires auth)
```

## 🧪 **Testing**

### **Run Test Script**
```bash
test_json_storage.bat
```

### **Manual Testing**

1. **Start server:**
   ```bash
   cd Login-RegistrationForm-MongoDB-main
   npm start
   ```

2. **Switch to JSON storage:**
   ```bash
   curl -X POST http://localhost:3000/api/storage/switch \
     -H "Content-Type: application/json" \
     -d '{"type":"json"}'
   ```

3. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/api/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

4. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test@example.com","password":"password123"}'
   ```

## 🔒 **Security Features**

- **Password Hashing**: bcrypt with salt rounds (same as MongoDB)
- **Input Validation**: Email validation, password strength
- **JWT Tokens**: Same token generation as MongoDB version
- **Rate Limiting**: Applied to all endpoints
- **File Permissions**: JSON file created with appropriate permissions

## 🔄 **Migration Between Storage Types**

### **MongoDB → JSON**
```bash
# Switch to JSON (existing MongoDB data remains)
curl -X POST http://localhost:3000/api/storage/switch \
  -d '{"type":"json"}'
```

### **JSON → MongoDB**
```bash
# Switch back to MongoDB (JSON data remains in file)
curl -X POST http://localhost:3000/api/storage/switch \
  -d '{"type":"mongodb"}'
```

**Note**: Data is not automatically migrated between storage types. Each maintains its own dataset.

## 📈 **Performance Considerations**

### **JSON Storage**
- ✅ **Pros**: No database setup, portable, version controllable
- ⚠️ **Cons**: File I/O for each operation, not suitable for high traffic

### **Recommended Usage**
- **Development**: JSON storage for quick setup
- **Testing**: JSON storage for isolated tests
- **Production**: MongoDB for performance and scalability

## 🛡️ **Error Handling**

### **File System Errors**
- Automatic directory creation
- Graceful fallback to default data structure
- Error logging for debugging

### **Storage Switching**
- Validates MongoDB availability before switching
- Maintains current storage on failed switches
- Clear error messages for invalid operations

## 💡 **Best Practices**

1. **Backup JSON Files**: Include `data/users.json` in your backups
2. **Environment Variables**: Use environment variables for production configuration
3. **Monitoring**: Check storage status via `/api/storage/info` endpoint
4. **Testing**: Use JSON storage for unit tests to avoid database dependencies

## 🚀 **Integration with Frontend**

The frontend automatically works with both storage types - no changes needed! The same API endpoints return the same response format regardless of storage backend.

**Example Frontend Code:**
```javascript
// This works with both MongoDB and JSON storage
const response = await registerUser('patient', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});
```

---

**The JSON storage system provides a flexible, portable alternative to MongoDB while maintaining full compatibility with the existing SwasthyaSetu frontend and API structure.** 🎉