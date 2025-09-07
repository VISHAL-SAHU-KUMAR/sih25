const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Basic Information
  patientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true // allows multiple null values
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
    unique: true
  },
  
  // Demographics
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  // Contact & Location
  address: {
    street: String,
    village: String,
    tehsil: String,
    district: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      default: 'Punjab'
    },
    pincode: {
      type: String,
      match: /^[0-9]{6}$/
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Language Preference
  preferredLanguage: {
    type: String,
    enum: ['Hindi', 'English', 'Punjabi', 'Urdu'],
    default: 'Hindi'
  },
  
  // Medical Information
  medicalProfile: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    height: Number, // in cm
    weight: Number, // in kg
    
    // Medical History
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe'],
        default: 'Mild'
      },
      currentMedication: [String]
    }],
    
    allergies: [{
      allergen: String,
      reaction: String,
      severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe'],
        default: 'Mild'
      }
    }],
    
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      prescribedBy: String
    }],
    
    pastSurgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      complications: String
    }],
    
    familyHistory: [{
      relation: String,
      condition: String,
      ageOfOnset: Number
    }]
  },
  
  // Lifestyle Information
  lifestyle: {
    smokingStatus: {
      type: String,
      enum: ['Never', 'Former', 'Current'],
      default: 'Never'
    },
    alcoholConsumption: {
      type: String,
      enum: ['Never', 'Occasionally', 'Regularly'],
      default: 'Never'
    },
    exerciseFrequency: {
      type: String,
      enum: ['Never', 'Rarely', 'Sometimes', 'Regularly'],
      default: 'Never'
    },
    dietType: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan'],
      default: 'Vegetarian'
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relation: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    }
  },
  
  // Healthcare Access
  healthcareAccess: {
    nearestHospital: String,
    distanceToHospital: Number, // in km
    hasInsurance: {
      type: Boolean,
      default: false
    },
    insuranceProvider: String,
    economicStatus: {
      type: String,
      enum: ['BPL', 'APL', 'Middle Class', 'Upper Middle Class'],
      default: 'APL'
    }
  },
  
  // Platform Usage
  platformUsage: {
    totalConsultations: {
      type: Number,
      default: 0
    },
    lastConsultation: Date,
    preferredConsultationMode: {
      type: String,
      enum: ['video', 'voice', 'chat'],
      default: 'voice'
    },
    deviceType: {
      type: String,
      enum: ['smartphone', 'feature_phone', 'tablet', 'computer'],
      default: 'smartphone'
    },
    internetConnectivity: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'poor'
    }
  },
  
  // Recent Health Status
  recentHealthStatus: {
    lastSymptoms: [String],
    lastSymptomDate: Date,
    currentComplaints: [String],
    urgencyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Low'
    },
    lastVitalSigns: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number,
        recordedAt: Date
      },
      temperature: {
        value: Number,
        recordedAt: Date
      },
      heartRate: {
        value: Number,
        recordedAt: Date
      },
      oxygenSaturation: {
        value: Number,
        recordedAt: Date
      }
    }
  },
  
  // Consultation History Summary
  consultationSummary: {
    mostConsultedSpecialties: [String],
    frequentSymptoms: [String],
    commonDiagnoses: [String],
    medicationCompliance: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'Excellent'],
      default: 'Fair'
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['phone', 'aadhar', 'manual'],
    default: 'phone'
  },
  
  // Privacy & Consent
  dataConsent: {
    medicalDataSharing: {
      type: Boolean,
      default: false
    },
    emergencyDataAccess: {
      type: Boolean,
      default: true
    },
    researchParticipation: {
      type: Boolean,
      default: false
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
patientSchema.index({ phone: 1 }, { unique: true });
patientSchema.index({ 'address.district': 1 });
patientSchema.index({ age: 1, gender: 1 });
patientSchema.index({ isActive: 1, isVerified: 1 });
patientSchema.index({ 'recentHealthStatus.urgencyLevel': 1 });
patientSchema.index({ 'medicalProfile.chronicConditions.condition': 1 });

// Virtual for BMI calculation
patientSchema.virtual('bmi').get(function() {
  if (this.medicalProfile.weight && this.medicalProfile.height) {
    const heightInMeters = this.medicalProfile.height / 100;
    return (this.medicalProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Virtual for age calculation from DOB
patientSchema.virtual('calculatedAge').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return this.age;
});

// Method to update health status
patientSchema.methods.updateHealthStatus = function(symptoms, urgency = 'Low') {
  this.recentHealthStatus.lastSymptoms = symptoms;
  this.recentHealthStatus.lastSymptomDate = new Date();
  this.recentHealthStatus.currentComplaints = symptoms;
  this.recentHealthStatus.urgencyLevel = urgency;
  this.updatedAt = new Date();
  return this.save();
};

// Method to add consultation record
patientSchema.methods.addConsultationRecord = function(specialty) {
  this.platformUsage.totalConsultations += 1;
  this.platformUsage.lastConsultation = new Date();
  
  // Update most consulted specialties
  if (!this.consultationSummary.mostConsultedSpecialties.includes(specialty)) {
    this.consultationSummary.mostConsultedSpecialties.push(specialty);
  }
  
  return this.save();
};

// Static method to find patients by health urgency
patientSchema.statics.findUrgentPatients = function(district = null) {
  const query = {
    isActive: true,
    'recentHealthStatus.urgencyLevel': { $in: ['High', 'Emergency'] }
  };
  
  if (district) {
    query['address.district'] = district;
  }
  
  return this.find(query)
    .sort({ 'recentHealthStatus.lastSymptomDate': -1 })
    .select('name phone address recentHealthStatus medicalProfile.chronicConditions');
};

// Static method for patient analytics
patientSchema.statics.getPatientAnalytics = function(district = null, dateRange = 30) {
  const matchStage = {
    isActive: true,
    createdAt: {
      $gte: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000)
    }
  };
  
  if (district) {
    matchStage['address.district'] = district;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPatients: { $sum: 1 },
        averageAge: { $avg: '$age' },
        genderDistribution: {
          $push: '$gender'
        },
        urgencyLevels: {
          $push: '$recentHealthStatus.urgencyLevel'
        },
        chronicConditions: {
          $push: '$medicalProfile.chronicConditions.condition'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Patient', patientSchema);
