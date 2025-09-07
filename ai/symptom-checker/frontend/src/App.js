import React, { useState } from 'react';
import './App.css';

// Enhanced Header Component
const Header = () => (
  <header className="app-header">
    <div className="header-content">
      <div className="logo-section">
        <div className="logo">🩺</div>
        <h1>MediCheck AI</h1>
        <p className="tagline">Intelligent Symptom Analysis</p>
      </div>
    </div>
  </header>
);

// Enhanced Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-text">Analyzing your symptoms...</p>
  </div>
);

// Enhanced Symptom Form Component
const SymptomForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    symptoms: '',
    age: '',
    gender: '',
    duration: '',
    medicalHistory: ''
  });

  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (field) {
      case 'symptoms':
        if (!value.trim()) {
          errorMessage = 'Please describe your symptoms';
          isValid = false;
        }
        break;
      case 'age':
        const age = parseInt(value);
        if (!age || age < 1 || age > 120) {
          errorMessage = 'Please enter a valid age (1-120)';
          isValid = false;
        }
        break;
      case 'gender':
        if (!value) {
          errorMessage = 'Please select your gender';
          isValid = false;
        }
        break;
      default:
        break;
    }

    return { isValid, errorMessage };
  };

  const validateForm = () => {
    const newErrors = {};
    let isFormValid = true;

    // Validate required fields
    const requiredFields = ['symptoms', 'age', 'gender'];
    
    requiredFields.forEach(field => {
      const { isValid, errorMessage } = validateField(field, formData[field]);
      if (!isValid) {
        newErrors[field] = errorMessage;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBlur = (field, value) => {
    const { isValid, errorMessage } = validateField(field, value);
    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [field]: errorMessage
      }));
    }
  };

  return (
    <div className="symptom-form-container">
      <div className="form-header">
        <h2>Tell us about your symptoms</h2>
        <p className="form-subtitle">Please provide as much detail as possible for accurate analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="symptom-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="symptoms" className="form-label">
              <span className="label-icon">📝</span>
              Symptoms *
            </label>
            <textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => handleChange('symptoms', e.target.value)}
              onBlur={(e) => handleBlur('symptoms', e.target.value)}
              placeholder="Describe your symptoms in detail (e.g., 'fever for 3 days, headache, sore throat')"
              className={`form-textarea ${errors.symptoms ? 'error' : ''}`}
              rows="4"
              disabled={loading}
            />
            {errors.symptoms && <span className="error-text">{errors.symptoms}</span>}
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age" className="form-label">
                <span className="label-icon">🎂</span>
                Age *
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                onBlur={(e) => handleBlur('age', e.target.value)}
                placeholder="Enter your age"
                className={`form-input ${errors.age ? 'error' : ''}`}
                min="1"
                max="120"
                disabled={loading}
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                <span className="label-icon">👤</span>
                Gender *
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                onBlur={(e) => handleBlur('gender', e.target.value)}
                className={`form-select ${errors.gender ? 'error' : ''}`}
                disabled={loading}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="duration" className="form-label">
              <span className="label-icon">⏰</span>
              Duration
            </label>
            <input
              type="text"
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder="How long have you had these symptoms? (e.g., '3 days', '1 week')"
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="medicalHistory" className="form-label">
              <span className="label-icon">🏥</span>
              Medical History <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => handleChange('medicalHistory', e.target.value)}
              placeholder="Any relevant medical conditions, medications, allergies, or recent changes..."
              className="form-textarea"
              rows="3"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-analyze"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span className="btn-icon">🔍</span>
                Analyze Symptoms
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Enhanced Results Display Component
const ResultsDisplay = ({ analysis, onNewAnalysis }) => {
  if (!analysis) return null;

  if (analysis.error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <div className="error-content">
          <h3>Analysis Error</h3>
          <p>{analysis.error}</p>
          <button onClick={onNewAnalysis} className="btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getUrgencyIcon = (level) => {
    switch (level) {
      case 'EMERGENCY': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '⚡';
      case 'LOW': return '✅';
      default: return '📋';
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'EMERGENCY': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'LOW': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Analysis Results</h2>
        <button onClick={onNewAnalysis} className="btn-new-analysis">
          New Analysis
        </button>
      </div>

      {/* Enhanced Urgency Level */}
      <div 
        className="urgency-card" 
        style={{ borderColor: getUrgencyColor(analysis.urgency_level) }}
      >
        <div className="urgency-header">
          <span className="urgency-icon">
            {getUrgencyIcon(analysis.urgency_level)}
          </span>
          <div className="urgency-content">
            <h3 style={{ color: getUrgencyColor(analysis.urgency_level) }}>
              {analysis.urgency_level} Priority
            </h3>
            <p className="urgency-action">{analysis.urgency_action}</p>
            <p className="urgency-description">{analysis.urgency_description}</p>
          </div>
        </div>
      </div>

      {/* Enhanced Possible Causes */}
      <div className="result-section">
        <h3 className="section-title">
          <span className="section-icon">🔍</span>
          Possible Causes
        </h3>
        <div className="causes-grid">
          {analysis.possible_causes.map((cause, index) => (
            <div key={index} className="cause-card">
              <span className="cause-number">{index + 1}</span>
              <span className="cause-name">{cause}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced ML Analysis Results */}
      {analysis.ml_analysis && (
        <div className="result-section">
          <h3 className="section-title">
            <span className="section-icon">🤖</span>
            AI Analysis
          </h3>
          <div className="ml-analysis-card">
            <div className="confidence-meter">
              <span className="confidence-label">Confidence Level</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${analysis.ml_analysis.confidence_percentage}%` }}
                ></div>
              </div>
              <span className="confidence-value">
                {analysis.ml_analysis.confidence_percentage}%
              </span>
            </div>
            
            {analysis.ml_analysis.top_predictions && (
              <div className="predictions-list">
                <h4>Top Predictions:</h4>
                {analysis.ml_analysis.top_predictions.slice(0, 3).map((pred, index) => (
                  <div key={index} className="prediction-item">
                    <span className="prediction-name">{pred.disease}</span>
                    <span className="prediction-percentage">{pred.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Recommendations */}
      <div className="result-section">
        <h3 className="section-title">
          <span className="section-icon">💡</span>
          Recommendations
        </h3>
        <div className="recommendations-list">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <span className="rec-bullet">•</span>
              <span className="rec-text">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Clarifying Questions */}
      {analysis.clarifying_questions && analysis.clarifying_questions.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">
            <span className="section-icon">❓</span>
            Questions for Your Doctor
          </h3>
          <div className="questions-list">
            {analysis.clarifying_questions.map((question, index) => (
              <div key={index} className="question-item">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-text">{question}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Medical Disclaimer */}
      <div className="disclaimer-card">
        <div className="disclaimer-icon">⚠️</div>
        <div className="disclaimer-content">
          <h4>Important Medical Disclaimer</h4>
          <p>{analysis.disclaimer || "This AI analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns."}</p>
          <div className="disclaimer-points">
            <p>• This tool is for informational purposes only</p>
            <p>• Always consult healthcare professionals for medical advice</p>
            <p>• Call emergency services for serious symptoms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Main App Component
function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSymptomAnalysis = async (formData) => {
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: formData.symptoms,
          age: formData.age,
          gender: formData.gender,
          duration: formData.duration,
          medical_history: formData.medicalHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms. Please try again.');
      }

      const result = await response.json();
      setAnalysis(result);
      
      // Smooth scroll to results with enhanced timing
      setTimeout(() => {
        const resultsElement = document.querySelector('.results-container');
        if (resultsElement) {
          resultsElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 200);
      
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing symptoms.');
      console.error('Analysis error:', err);
      
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setError('');
    
    // Smooth scroll to top
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="container">
          {/* Show form when not loading and no results */}
          {!analysis && !loading && (
            <SymptomForm onSubmit={handleSymptomAnalysis} loading={loading} />
          )}
          
          {/* Show loading state */}
          {loading && <LoadingSpinner />}
          
          {/* Show error message */}
          {error && (
            <div className="error-message">
              <div className="error-icon">❌</div>
              <div className="error-content">
                <h3>Analysis Error</h3>
                <p>{error}</p>
                <button onClick={handleNewAnalysis} className="btn-secondary">
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Show results */}
          {analysis && <ResultsDisplay analysis={analysis} onNewAnalysis={handleNewAnalysis} />}
        </div>
      </main>
    </div>
  );
}

export default App;