// /src/utils/api.js
import axios from 'axios';

// Authentication API (Node.js/Express backend)
const authAPI = axios.create({ 
  baseURL: "http://localhost:3000/api",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Symptom Checker API (Python Flask)
const symptomAPI = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    'Content-Type': 'application/json',
  }
});

// Prescription Analyzer API (Python FastAPI)
const prescriptionAPI = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    'Content-Type': 'application/json',
  }
});

// Authentication functions
export const loginUser = (role, data) => {
  // Use different endpoints based on role
  if (role === 'patient') {
    return authAPI.post('/auth/patient/login', data);
  } else if (role === 'doctor') {
    return authAPI.post('/auth/doctor/login', data);
  } else if (role === 'authority') {
    return authAPI.post('/auth/authority/login', data);
  } else {
    // Generic login for backward compatibility
    return authAPI.post('/login', data);
  }
};

export const registerUser = (role, data) => {
  if (role === 'patient') {
    return authAPI.post('/auth/patient/register', data);
  } else if (role === 'doctor') {
    return authAPI.post('/auth/doctor/register', data);
  } else if (role === 'authority') {
    return authAPI.post('/auth/authority/register', data);
  } else {
    // Generic signup for backward compatibility
    return authAPI.post('/signup', data);
  }
};

// Symptom Checker functions
export const analyzeSymptoms = (data) => symptomAPI.post('/analyze', data);
export const getSymptoms = () => symptomAPI.get('/symptoms');
export const getDiseases = () => symptomAPI.get('/diseases');
export const getDiseaseInfo = (diseaseName) => symptomAPI.get(`/disease/${diseaseName}`);
export const predictDisease = (symptoms) => symptomAPI.post('/predict', { symptoms });

// Prescription Analyzer functions
export const analyzePrescription = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return prescriptionAPI.post('/analyze-prescription', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createMedicineOrder = (orderData) => prescriptionAPI.post('/create-order', orderData);
export const getOrder = (orderId) => prescriptionAPI.get(`/order/${orderId}`);
export const searchMedicines = (query, limit = 20) => prescriptionAPI.get(`/medicines/search?query=${query}&limit=${limit}`);
export const getMedicineInfo = (medicineName) => prescriptionAPI.get(`/medicines/${medicineName}`);

// Legacy functions for backward compatibility
export const getAppointments = (role) => authAPI.get(`/appointments?role=${role}`);
export const getMedicineStock = () => prescriptionAPI.get("/medicines/search");
export const updateStock = (id, qty) => prescriptionAPI.put(`/medicines/${id}`, { qty });

// Health check functions
export const checkAuthHealth = () => authAPI.get('/health').catch(() => ({ data: { status: 'unavailable' } }));
export const checkSymptomHealth = () => symptomAPI.get('/health').catch(() => ({ data: { status: 'unavailable' } }));
export const checkPrescriptionHealth = () => prescriptionAPI.get('/health').catch(() => ({ data: { status: 'unavailable' } }));

// System health check
export const checkSystemHealth = async () => {
  try {
    const [auth, symptom, prescription] = await Promise.all([
      checkAuthHealth(),
      checkSymptomHealth(), 
      checkPrescriptionHealth()
    ]);
    
    return {
      auth: auth.data.status,
      symptom: symptom.data.status,
      prescription: prescription.data.status,
      overall: (auth.data.status === 'healthy' || auth.data.status === 'OK') && 
               (symptom.data.status === 'healthy' || symptom.data.status === 'OK') && 
               (prescription.data.status === 'healthy' || prescription.data.status === 'OK') 
               ? 'healthy' : 'degraded'
    };
  } catch (error) {
    return {
      auth: 'error',
      symptom: 'error', 
      prescription: 'error',
      overall: 'error',
      error: error.message
    };
  }
};

// Request interceptors for authentication
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

symptomAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

prescriptionAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptors for error handling
const handleResponse = (response) => response;
const handleError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

authAPI.interceptors.response.use(handleResponse, handleError);
symptomAPI.interceptors.response.use(handleResponse, handleError);
prescriptionAPI.interceptors.response.use(handleResponse, handleError);

// Export APIs for direct use
export { authAPI, symptomAPI, prescriptionAPI };

// Default export for backward compatibility
export default authAPI;
