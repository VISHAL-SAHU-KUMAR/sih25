const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // Basic Information
  doctorId: {
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
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  
  // Professional Information
  medicalLicenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    enum: [
      'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 
      'Gynecology', 'Orthopedics', 'Psychiatry', 'Neurology',
      'ENT', 'Ophthalmology', 'Dentistry', 'Emergency Medicine'
    ],
    required: true
  }],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number, // years of experience
    required: true,
    min: 0
  },
  
  // Location & Service Area
  location: {
    address: String,
    city: String,
    state: String,
    district: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  serviceRadius: {
    type: Number, // in kilometers
    default: 50
  },
  
  // Languages
  languages: [{
    type: String,
    enum: ['Hindi', 'English', 'Punjabi', 'Urdu', 'Bengali'],
    default: ['Hindi', 'English']
  }],
  
  // Availability
  availability: {
    schedule: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      slots: [{
        startTime: String, // "09:00"
        endTime: String,   // "12:00"
        isAvailable: {
          type: Boolean,
          default: true
        }
      }]
    }],
    consultationModes: [{
      type: String,
      enum: ['video', 'voice', 'chat'],
      default: ['video', 'voice']
    }],
    maxPatientsPerDay: {
      type: Number,
      default: 20
    }
  },
  
  // Platform Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  onlineStatus: {
    type: String,
    enum: ['online', 'offline', 'busy'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Performance Metrics
  stats: {
    totalConsultations: {
      type: Number,
      default: 0
    },
    completedConsultations: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    responseTime: {
      type: Number, // average in minutes
      default: 0
    }
  },
  
  // Workload Management
  workload: {
    currentPatients: {
      type: Number,
      default: 0
    },
    pendingAppointments: {
      type: Number,
      default: 0
    },
    weeklyHours: {
      type: Number,
      default: 0
    },
    lastAllocation: {
      type: Date
    }
  },
  
  // Emergency & Rural Healthcare
  emergencyAvailable: {
    type: Boolean,
    default: false
  },
  ruralHealthcareExperience: {
    type: Boolean,
    default: false
  },
  lowBandwidthOptimized: {
    type: Boolean,
    default: true
  },
  
  // Reviews and Feedback
  reviews: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Account Management
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Consultation Fees
  consultationFee: {
    video: {
      type: Number,
      default: 200
    },
    voice: {
      type: Number,
      default: 150
    },
    chat: {
      type: Number,
      default: 100
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'location.district': 1 });
doctorSchema.index({ isActive: 1, isVerified: 1 });
doctorSchema.index({ 'availability.schedule.day': 1 });
doctorSchema.index({ onlineStatus: 1 });
doctorSchema.index({ 'workload.currentPatients': 1 });

// Virtual for full name
doctorSchema.virtual('profile').get(function() {
  return {
    name: this.name,
    specialization: this.specialization,
    experience: this.experience,
    rating: this.stats.rating.average,
    languages: this.languages,
    consultationModes: this.availability.consultationModes
  };
});

// Method to check availability for a specific time slot
doctorSchema.methods.isAvailableAt = function(day, time) {
  const daySchedule = this.availability.schedule.find(s => s.day === day);
  if (!daySchedule) return false;
  
  return daySchedule.slots.some(slot => {
    const slotStart = parseInt(slot.startTime.replace(':', ''));
    const slotEnd = parseInt(slot.endTime.replace(':', ''));
    const checkTime = parseInt(time.replace(':', ''));
    
    return checkTime >= slotStart && checkTime < slotEnd && slot.isAvailable;
  });
};

// Method to update workload
doctorSchema.methods.updateWorkload = function(increment = true) {
  if (increment) {
    this.workload.currentPatients += 1;
  } else {
    this.workload.currentPatients = Math.max(0, this.workload.currentPatients - 1);
  }
  this.workload.lastAllocation = new Date();
  return this.save();
};

// Static method to find available doctors by specialization and location
doctorSchema.statics.findAvailableDoctors = function(filters = {}) {
  const query = {
    isActive: true,
    isVerified: true,
    onlineStatus: { $in: ['online', 'busy'] }
  };
  
  if (filters.specialization) {
    query.specialization = { $in: [filters.specialization] };
  }
  
  if (filters.district) {
    query['location.district'] = filters.district;
  }
  
  if (filters.language) {
    query.languages = { $in: [filters.language] };
  }
  
  return this.find(query)
    .sort({ 'workload.currentPatients': 1, 'stats.rating.average': -1 })
    .select('name specialization location availability stats workload consultationFee');
};

module.exports = mongoose.model('Doctor', doctorSchema);
