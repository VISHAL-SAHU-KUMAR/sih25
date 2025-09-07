import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, } from 'recharts';
import { User, Calendar, Pill, FileText, Phone, Bell, Heart, Activity, MapPin, Search, Plus } from 'lucide-react';
import "./PatientDashboard.css";

const PatientDashboard = () => {
  const [patientInfo, setPatientInfo] = useState({
    name: "John Doe",
    dob: "1990-05-15",
    gender: "Male",
    bloodGroup: "O+",
    maritalStatus: "Single",
    photo: null,
    mobile: "+91 9876543210",
    email: "john.doe@email.com",
    address: "123 Main Street, Delhi, India",
    emergencyName: "Jane Doe",
    emergencyPhone: "+91 9876543211",
    conditions: "Hypertension",
    allergies: "Pollen",
    medications: "Lisinopril",
    surgeries: "None",
    familyDoctor: "Dr. Smith",
    govId: "AADHAAR123456789",
    insuranceProvider: "Health Plus",
    insuranceNumber: "HP123456789",
    insuranceCard: null,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [symptoms, setSymptoms] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');

  // Load patient info from localStorage
  useEffect(() => {
    const storedInfo = localStorage.getItem('patientProfile');
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setPatientInfo(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.log('Error parsing stored patient info');
      }
    }
  }, []);

  // Mock data
  const appointments = [
    { id: 1, doctor: "Dr. Rajesh Singh", specialty: "General Physician", date: "2025-09-10", time: "5:00 PM", status: "Upcoming", type: "Video Call" },
    { id: 2, doctor: "Dr. Priya Sharma", specialty: "Cardiologist", date: "2025-08-25", time: "2:30 PM", status: "Completed", type: "In-person" },
  ];

  const medicines = [
    { name: "Paracetamol 500mg", dosage: "1 tablet twice daily", remaining: 10, refillDate: "2025-09-15", status: "good" },
    { name: "Vitamin D3", dosage: "1 capsule daily", remaining: 5, refillDate: "2025-09-12", status: "medium" },
    { name: "Cough Syrup", dosage: "10ml thrice daily", remaining: 2, refillDate: "2025-09-08", status: "low" },
  ];

  const healthMetrics = [
    { date: 'Jan', bp: 120, weight: 70, sugar: 95 },
    { date: 'Feb', bp: 125, weight: 69, sugar: 98 },
    { date: 'Mar', bp: 118, weight: 71, sugar: 92 },
    { date: 'Apr', bp: 122, weight: 70, sugar: 96 },
  ];

  const symptomData = [
    { symptom: "Fever", frequency: 5, fill: "#FF6B6B" },
    { symptom: "Cough", frequency: 3, fill: "#4ECDC4" },
    { symptom: "Headache", frequency: 4, fill: "#45B7D1" },
    { symptom: "Fatigue", frequency: 2, fill: "#96CEB4" },
  ];

  const handleSymptomCheck = () => {
    if (symptoms.trim()) {
      const analyses = [
        "Based on your symptoms, it appears you might have a common cold. Consider rest and hydration. If symptoms persist for more than 3 days, consult a doctor.",
        "Your symptoms suggest possible seasonal allergies. Avoid known allergens and consider antihistamines. Consult an ENT specialist if symptoms worsen.",
        "These symptoms could indicate viral fever. Monitor your temperature and stay hydrated. Book a consultation if fever exceeds 102°F.",
      ];
      setAiAnalysis(analyses[Math.floor(Math.random() * analyses.length)]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Heart className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  SwasthyaSetu
                </h1>
                <p className="text-gray-600">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:block text-right">
                <p className="font-semibold text-gray-800">Welcome, {patientInfo.name}</p>
                <p className="text-sm text-gray-600">{patientInfo.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <User className="text-white w-5 h-5" />
              </div>
              <Bell className="text-gray-600 hover:text-blue-500 cursor-pointer w-6 h-6" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-indigo-500 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="text-indigo-500 w-5 h-5" />
                  <h3 className="text-sm font-medium text-gray-600">Next Appointment</h3>
                </div>
                <p className="text-xl font-bold text-gray-800">Today, 5:00 PM</p>
              </div>
              <button className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-500 hover:text-white transition-colors">
                View
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-green-500 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Pill className="text-green-500 w-5 h-5" />
                  <h3 className="text-sm font-medium text-gray-600">Active Prescriptions</h3>
                </div>
                <p className="text-xl font-bold text-gray-800">3 Medicines</p>
              </div>
              <button className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-500 hover:text-white transition-colors">
                Refill
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-red-500 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="text-red-500 w-5 h-5" />
                  <h3 className="text-sm font-medium text-gray-600">Reports Available</h3>
                </div>
                <p className="text-xl font-bold text-gray-800">2 New</p>
              </div>
              <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                Download
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-orange-500 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="text-orange-500 w-5 h-5" />
                  <h3 className="text-sm font-medium text-gray-600">Emergency Help</h3>
                </div>
                <p className="text-xl font-bold text-gray-800">24/7 Available</p>
              </div>
              <button className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                Call Now
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: Activity },
                { id: 'symptoms', name: 'AI Symptom Checker', icon: Heart },
                { id: 'prescriptions', name: 'Prescriptions', icon: Pill },
                { id: 'appointments', name: 'Appointments', icon: Calendar },
                { id: 'profile', name: 'Profile', icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-all duration-200`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Activity className="text-blue-500 w-5 h-5" />
                      <span>Health Metrics Trend</span>
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={healthMetrics}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="bp" stroke="#4F46E5" strokeWidth={2} name="Blood Pressure" />
                        <Line type="monotone" dataKey="sugar" stroke="#059669" strokeWidth={2} name="Blood Sugar" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Heart className="text-red-500 w-5 h-5" />
                      <span>Common Symptoms</span>
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={symptomData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="frequency"
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'symptoms' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                    <Heart className="text-purple-500 w-6 h-6" />
                    <span>AI Symptom Checker</span>
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                      type="text"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Describe your symptoms (e.g., fever, headache, cough)..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                    />
                    <button
                      onClick={handleSymptomCheck}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                    >
                      <Search className="w-4 h-4 inline mr-2" />
                      Analyze
                    </button>
                  </div>
                  {aiAnalysis && (
                    <div className="bg-white border-l-4 border-blue-500 p-6 rounded-r-lg shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <span>AI Analysis:</span>
                      </h4>
                      <p className="text-gray-700 mb-4">{aiAnalysis}</p>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md">
                          Book Consultation
                        </button>
                        <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md">
                          Get Second Opinion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold flex items-center space-x-2">
                    <Pill className="text-green-500 w-6 h-6" />
                    <span>Active Prescriptions</span>
                  </h3>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Medicine</span>
                  </button>
                </div>
                {medicines.map((medicine, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 mb-4 md:mb-0">
                        <h4 className="font-semibold text-xl text-gray-800 mb-1">{medicine.name}</h4>
                        <p className="text-gray-600 mb-3">{medicine.dosage}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className={`px-3 py-1 rounded-full font-medium ${
                            medicine.status === 'low' ? 'bg-red-100 text-red-700' : 
                            medicine.status === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {medicine.remaining} tablets left
                          </span>
                          <span className="text-gray-500 flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Refill by: {medicine.refillDate}</span>
                          </span>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md">
                        Order Refill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold flex items-center space-x-2">
                    <Calendar className="text-blue-500 w-6 h-6" />
                    <span>Appointments</span>
                  </h3>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                    Book New Consultation
                  </button>
                </div>
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow shadow-md">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-xl text-gray-800 mb-1">{appointment.doctor}</h4>
                        <p className="text-gray-600 mb-3">{appointment.specialty}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{appointment.date} at {appointment.time}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.type}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        appointment.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold flex items-center space-x-2">
                  <User className="text-blue-500 w-6 h-6" />
                  <span>Patient Profile</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-4 text-lg">Personal Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between"><strong>Name:</strong> <span>{patientInfo.name || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Email:</strong> <span>{patientInfo.email || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Date of Birth:</strong> <span>{patientInfo.dob || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Gender:</strong> <span>{patientInfo.gender || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Blood Group:</strong> <span>{patientInfo.bloodGroup || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Marital Status:</strong> <span>{patientInfo.maritalStatus || 'Not provided'}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-4 text-lg">Contact & Emergency</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between"><strong>Mobile:</strong> <span>{patientInfo.mobile || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Address:</strong> <span>{patientInfo.address || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Emergency Contact:</strong> <span>{patientInfo.emergencyName || 'Not provided'}</span></div>
                        <div className="flex justify-between"><strong>Emergency Phone:</strong> <span>{patientInfo.emergencyPhone || 'Not provided'}</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-4 text-lg">Medical Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between"><strong>Conditions:</strong> <span>{patientInfo.conditions || 'None reported'}</span></div>
                        <div className="flex justify-between"><strong>Allergies:</strong> <span>{patientInfo.allergies || 'None reported'}</span></div>
                        <div className="flex justify-between"><strong>Medications:</strong> <span>{patientInfo.medications || 'None reported'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl">
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;