import React, { useState } from 'react';
import { Heart, AlertTriangle, CheckCircle, HelpCircle, Calendar, User, Activity } from 'lucide-react';

const SymptomTracker = () => {
  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    age: '',
    gender: '',
    medicalHistory: '',
    severity: '5'
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const analyzeSymptoms = async () => {
    setLoading(true);

    // Simulate API call to Python backend
    setTimeout(() => {
      const mockAnalysis = generateMockAnalysis(formData.symptoms);
      setAnalysis(mockAnalysis);
      setLoading(false);
    }, 2000);
  };

  const generateMockAnalysis = (symptoms) => {
    const lowerSymptoms = symptoms.toLowerCase();

    if (lowerSymptoms.includes('fever') && lowerSymptoms.includes('cough')) {
      return {
        possibleCauses: ['Common Cold', 'Influenza', 'COVID-19', 'Upper Respiratory Infection'],
        urgencyLevel: 'Medium',
        urgencyColor: 'text-yellow-600',
        urgencyBg: 'bg-yellow-50',
        recommendations: [
          'Stay hydrated with plenty of fluids',
          'Get adequate rest and sleep',
          'Monitor temperature regularly',
          'Consider OTC fever reducer if needed',
          'Isolate to prevent spread if infectious'
        ],
        clarifyingQuestions: [
          'Any difficulty breathing or shortness of breath?',
          'Any chest pain or tightness?',
          'Recent travel or exposure to sick individuals?',
          'Any loss of taste or smell?'
        ]
      };
    } else if (lowerSymptoms.includes('headache') && lowerSymptoms.includes('nausea')) {
      return {
        possibleCauses: ['Migraine', 'Tension Headache', 'Dehydration', 'Food Poisoning'],
        urgencyLevel: 'Low',
        urgencyColor: 'text-green-600',
        urgencyBg: 'bg-green-50',
        recommendations: [
          'Rest in a dark, quiet room',
          'Stay hydrated',
          'Apply cold or warm compress to head',
          'Consider OTC pain reliever',
          'Avoid triggers like bright lights'
        ],
        clarifyingQuestions: [
          'Is this a new type of headache for you?',
          'Any visual changes or sensitivity to light?',
          'Any recent dietary changes?',
          'Stress levels recently?'
        ]
      };
    } else if (lowerSymptoms.includes('chest pain')) {
      return {
        possibleCauses: ['Muscle Strain', 'Acid Reflux', 'Anxiety', 'Cardiac Issues'],
        urgencyLevel: 'High',
        urgencyColor: 'text-red-600',
        urgencyBg: 'bg-red-50',
        recommendations: [
          'SEEK IMMEDIATE MEDICAL ATTENTION',
          'Do not drive yourself to hospital',
          'Call emergency services if severe',
          'Sit upright and stay calm',
          'Have someone stay with you'
        ],
        clarifyingQuestions: [
          'Is the pain radiating to arm, jaw, or back?',
          'Any shortness of breath?',
          'Any sweating or nausea with the pain?',
          'Does the pain worsen with movement?'
        ]
      };
    } else {
      return {
        possibleCauses: ['Minor Viral Infection', 'Stress-Related Symptoms', 'Lifestyle Factors'],
        urgencyLevel: 'Low',
        urgencyColor: 'text-green-600',
        urgencyBg: 'bg-green-50',
        recommendations: [
          'Monitor symptoms for changes',
          'Get adequate rest',
          'Stay hydrated',
          'Maintain healthy diet',
          'Consider stress management techniques'
        ],
        clarifyingQuestions: [
          'How long have you been experiencing these symptoms?',
          'Any recent changes in lifestyle or stress?',
          'Are symptoms getting better or worse?'
        ]
      };
    }
  };

  const getUrgencyIcon = (level) => {
    switch(level) {
      case 'High': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'Low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Medical Symptom Tracker</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered symptom analysis to help you understand possible conditions. 
            <span className="font-semibold text-red-600"> Always consult a healthcare professional for medical advice.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              Symptom Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Symptoms *
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  placeholder="e.g., fever, headache, cough, fatigue..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 days"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity (1-10)
                </label>
                <input
                  type="range"
                  name="severity"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Mild (1)</span>
                  <span className="font-medium">Current: {formData.severity}</span>
                  <span>Severe (10)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical History (Optional)
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  placeholder="Any relevant medical conditions, medications, allergies..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <button
                onClick={analyzeSymptoms}
                disabled={!formData.symptoms || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Analysis Results
            </h2>

            {!analysis && !loading && (
              <div className="text-center text-gray-500 py-12">
                <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Enter your symptoms and click "Analyze" to get started</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your symptoms...</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Possible Causes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Possible Causes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.possibleCauses.map((cause, index) => (
                      <span key={index} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Urgency Level */}
                <div className={`p-4 rounded-lg ${analysis.urgencyBg}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    {getUrgencyIcon(analysis.urgencyLevel)}
                    <span className="ml-2">Urgency Level: </span>
                    <span className={`ml-1 ${analysis.urgencyColor}`}>{analysis.urgencyLevel}</span>
                  </h3>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clarifying Questions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2 text-purple-600" />
                    Clarifying Questions
                  </h3>
                  <ul className="space-y-2">
                    {analysis.clarifyingQuestions.map((question, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-600 mr-2">?</span>
                        <span className="text-gray-700">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Medical Disclaimer</h4>
              <p className="text-red-700 text-sm">
                This AI tool is for informational purposes only and does not provide medical diagnosis. 
                Always consult with a qualified healthcare professional for proper medical advice, 
                diagnosis, and treatment. In case of emergency, call your local emergency number immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomTracker;
