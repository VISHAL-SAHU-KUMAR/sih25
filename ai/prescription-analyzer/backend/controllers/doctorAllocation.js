const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

class DoctorAllocationController {
  
  // Main doctor allocation algorithm
  async allocateDoctor(req, res) {
    try {
      const { 
        patientId, 
        specialty, 
        urgencyLevel, 
        preferredLanguage, 
        consultationMode, 
        district,
        symptoms 
      } = req.body;

      // Get patient details
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Find available doctors based on criteria
      const availableDoctors = await this.findBestMatchingDoctors({
        specialty,
        urgencyLevel,
        preferredLanguage: preferredLanguage || patient.preferredLanguage,
        consultationMode,
        district: district || patient.address.district,
        patientAge: patient.age,
        symptoms
      });

      if (availableDoctors.length === 0) {
        return res.status(404).json({ 
          error: 'No doctors available matching criteria',
          suggestedAlternatives: await this.getSuggestedAlternatives(specialty, district)
        });
      }

      // Apply allocation algorithm
      const selectedDoctor = await this.applyAllocationAlgorithm(availableDoctors, {
        urgencyLevel,
        patientHistory: await this.getPatientHistory(patientId),
        currentTime: new Date()
      });

      // Update doctor workload
      await selectedDoctor.updateWorkload(true);

      // Create appointment
      const appointment = await this.createAppointment({
        patientId,
        doctorId: selectedDoctor._id,
        specialty,
        urgencyLevel,
        consultationMode,
        symptoms
      });

      res.json({
        success: true,
        allocation: {
          doctor: {
            id: selectedDoctor._id,
            name: selectedDoctor.name,
            specialization: selectedDoctor.specialization,
            rating: selectedDoctor.stats.rating.average,
            estimatedWaitTime: this.calculateEstimatedWaitTime(selectedDoctor),
            consultationFee: selectedDoctor.consultationFee[consultationMode]
          },
          appointment: {
            id: appointment.appointmentId,
            scheduledTime: appointment.appointmentDate,
            mode: appointment.consultationMode
          }
        }
      });

    } catch (error) {
      console.error('Doctor allocation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Find best matching doctors
  async findBestMatchingDoctors(criteria) {
    const {
      specialty,
      urgencyLevel,
      preferredLanguage,
      consultationMode,
      district,
      patientAge,
      symptoms
    } = criteria;

    let query = {
      isActive: true,
      isVerified: true,
      onlineStatus: { $in: ['online', 'busy'] }
    };

    // Specialty matching
    if (specialty && specialty !== 'General Medicine') {
      query.specialization = { $in: [specialty] };
    }

    // Language preference
    if (preferredLanguage) {
      query.languages = { $in: [preferredLanguage] };
    }

    // Consultation mode support
    if (consultationMode) {
      query['availability.consultationModes'] = { $in: [consultationMode] };
    }

    // Location preference (same district first, then nearby)
    if (district) {
      query.$or = [
        { 'location.district': district },
        { 'location.district': { $in: await this.getNearbyDistricts(district) } }
      ];
    }

    // Emergency availability for urgent cases
    if (urgencyLevel === 'Emergency') {
      query.emergencyAvailable = true;
    }

    // Workload filter - exclude overloaded doctors
    query['workload.currentPatients'] = { 
      $lt: { $multiply: ['$availability.maxPatientsPerDay', 0.9] } 
    };

    const doctors = await Doctor.find(query)
      .select('name specialization location availability stats workload consultationFee languages')
      .sort({ 
        'workload.currentPatients': 1,
        'stats.rating.average': -1,
        'stats.responseTime': 1
      })
      .limit(10);

    return doctors;
  }

  // Advanced allocation algorithm
  async applyAllocationAlgorithm(doctors, context) {
    const { urgencyLevel, patientHistory, currentTime } = context;

    // Score each doctor based on multiple factors
    const scoredDoctors = await Promise.all(doctors.map(async (doctor) => {
      let score = 0;

      // Base availability score (40% weight)
      const workloadRatio = doctor.workload.currentPatients / doctor.availability.maxPatientsPerDay;
      score += (1 - workloadRatio) * 40;

      // Rating score (25% weight)
      score += (doctor.stats.rating.average / 5) * 25;

      // Response time score (20% weight)
      const avgResponseTime = doctor.stats.responseTime || 15;
      score += Math.max(0, (30 - avgResponseTime) / 30) * 20;

      // Specialization match score (10% weight)
      if (doctor.specialization.includes(context.specialty)) {
        score += 10;
      }

      // Urgency bonus (5% weight)
      if (urgencyLevel === 'Emergency' && doctor.emergencyAvailable) {
        score += 5;
      }

      // Patient history bonus - same doctor preference
      if (patientHistory && patientHistory.previousDoctors.includes(doctor._id)) {
        score += 3;
      }

      return { doctor, score };
    }));

    // Sort by score and return the best match
    scoredDoctors.sort((a, b) => b.score - a.score);
    return scoredDoctors[0].doctor;
  }

  // Get doctor workload analytics
  async getDoctorWorkloadAnalytics(req, res) {
    try {
      const { district, timeRange = '7d' } = req.query;
      
      const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let matchQuery = {
        isActive: true,
        isVerified: true
      };

      if (district && district !== 'All') {
        matchQuery['location.district'] = district;
      }

      const workloadData = await Doctor.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'doctorId',
            as: 'appointments'
          }
        },
        {
          $addFields: {
            recentAppointments: {
              $filter: {
                input: '$appointments',
                cond: { $gte: ['$$this.createdAt', startDate] }
              }
            }
          }
        },
        {
          $project: {
            name: 1,
            specialization: 1,
            'location.district': 1,
            'workload.currentPatients': 1,
            'availability.maxPatientsPerDay': 1,
            'stats.rating.average': 1,
            'stats.totalConsultations': 1,
            recentConsultations: { $size: '$recentAppointments' },
            workloadPercentage: {
              $multiply: [
                { $divide: ['$workload.currentPatients', '$availability.maxPatientsPerDay'] },
                100
              ]
            }
          }
        },
        {
          $sort: { workloadPercentage: -1 }
        }
      ]);

      res.json({
        success: true,
        data: workloadData,
        summary: {
          totalDoctors: workloadData.length,
          averageWorkload: workloadData.reduce((sum, doc) => sum + doc.workloadPercentage, 0) / workloadData.length,
          overloadedDoctors: workloadData.filter(doc => doc.workloadPercentage > 90).length
        }
      });

    } catch (error) {
      console.error('Workload analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Real-time allocation status
  async getAllocationStatus(req, res) {
    try {
      const currentTime = new Date();
      const last24Hours = new Date(currentTime - 24 * 60 * 60 * 1000);

      const [
        totalAllocations,
        successfulAllocations,
        failedAllocations,
        avgWaitTime,
        urgentAllocations
      ] = await Promise.all([
        Appointment.countDocuments({
          createdAt: { $gte: last24Hours }
        }),
        Appointment.countDocuments({
          createdAt: { $gte: last24Hours },
          status: { $in: ['confirmed', 'completed'] }
        }),
        Appointment.countDocuments({
          createdAt: { $gte: last24Hours },
          status: 'cancelled'
        }),
        Appointment.aggregate([
          { $match: { createdAt: { $gte: last24Hours }, 'analytics.waitTime': { $exists: true } } },
          { $group: { _id: null, avgWait: { $avg: '$analytics.waitTime' } } }
        ]),
        Appointment.countDocuments({
          createdAt: { $gte: last24Hours },
          'consultationReason.urgencyLevel': { $in: ['High', 'Emergency'] }
        })
      ]);

      const successRate = totalAllocations > 0 ? (successfulAllocations / totalAllocations) * 100 : 0;

      res.json({
        success: true,
        data: {
          totalAllocations,
          successfulAllocations,
          failedAllocations,
          successRate: Math.round(successRate * 100) / 100,
          avgWaitTime: avgWaitTime[0]?.avgWait || 0,
          urgentAllocations
        }
      });

    } catch (error) {
      console.error('Allocation status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Optimize doctor schedules
  async optimizeSchedules(req, res) {
    try {
      const { district, date } = req.body;
      
      // Get predicted patient demand
      const predictedDemand = await this.predictPatientDemand(district, date);
      
      // Get available doctors
      const doctors = await Doctor.find({
        isActive: true,
        'location.district': district
      });

      // Optimize schedule allocation
      const optimizedSchedules = await this.calculateOptimalSchedules(doctors, predictedDemand);

      res.json({
        success: true,
        data: {
          optimizedSchedules,
          predictedDemand,
          recommendations: await this.generateScheduleRecommendations(optimizedSchedules)
        }
      });

    } catch (error) {
      console.error('Schedule optimization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods
  async getPatientHistory(patientId) {
    const appointments = await Appointment.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('doctorId specialty consultation.diagnosis');
    
    return {
      previousDoctors: appointments.map(app => app.doctorId),
      commonSpecialties: [...new Set(appointments.map(app => app.specialty))],
      recentDiagnoses: appointments.map(app => app.consultation.diagnosis?.primary).filter(Boolean)
    };
  }

  calculateEstimatedWaitTime(doctor) {
    const baseWaitTime = 15; // minutes
    const workloadFactor = doctor.workload.currentPatients * 2;
    const responseTimeFactor = doctor.stats.responseTime || 10;
    
    return Math.max(5, baseWaitTime + workloadFactor + responseTimeFactor);
  }

  async createAppointment(appointmentData) {
    const appointmentId = `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const appointment = new Appointment({
      appointmentId,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      appointmentTime: {
        start: new Date(Date.now() + 30 * 60 * 1000).toTimeString().slice(0, 5),
        end: new Date(Date.now() + 60 * 60 * 1000).toTimeString().slice(0, 5),
        duration: 30
      },
      specialty: appointmentData.specialty,
      consultationMode: appointmentData.consultationMode,
      consultationReason: {
        chiefComplaint: appointmentData.symptoms[0] || 'General consultation',
        symptoms: appointmentData.symptoms,
        urgencyLevel: appointmentData.urgencyLevel
      },
      status: 'scheduled'
    });

    return await appointment.save();
  }

  async getNearbyDistricts(district) {
    // Define district proximity mapping for Punjab
    const districtProximity = {
      'Nabha': ['Patiala', 'Sangrur'],
      'Patiala': ['Nabha', 'Sangrur', 'Fatehgarh Sahib'],
      'Sangrur': ['Nabha', 'Patiala', 'Barnala'],
      'Barnala': ['Sangrur', 'Bathinda']
    };
    
    return districtProximity[district] || [];
  }

  async getSuggestedAlternatives(specialty, district) {
    // Suggest alternative specialties or nearby locations
    const alternatives = await Doctor.find({
      isActive: true,
      $or: [
        { 'location.district': { $in: await this.getNearbyDistricts(district) } },
        { specialization: { $in: ['General Medicine'] } }
      ]
    }).limit(5).select('name specialization location');

    return alternatives;
  }

  async predictPatientDemand(district, date) {
    // Simple prediction based on historical data
    const historicalData = await Appointment.aggregate([
      {
        $match: {
          'patientInfo.location.district': district,
          appointmentDate: {
            $gte: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000),
            $lte: new Date(date.getTime())
          }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$appointmentDate' },
            specialty: '$specialty'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return historicalData;
  }

  async calculateOptimalSchedules(doctors, predictedDemand) {
    // Implement schedule optimization logic
    return doctors.map(doctor => ({
      doctorId: doctor._id,
      name: doctor.name,
      currentSchedule: doctor.availability.schedule,
      recommendedSchedule: this.generateOptimizedSchedule(doctor, predictedDemand)
    }));
  }

  generateOptimizedSchedule(doctor, demand) {
    // Generate optimized schedule based on demand patterns
    // This is a simplified implementation
    return doctor.availability.schedule.map(daySchedule => ({
      ...daySchedule,
      optimizedSlots: this.redistributeSlots(daySchedule.slots, demand)
    }));
  }

  redistributeSlots(slots, demand) {
    // Redistribute slots based on demand patterns
    return slots; // Simplified - implement actual redistribution logic
  }

  async generateScheduleRecommendations(optimizedSchedules) {
    return [
      'Consider adding more slots during peak hours (2-6 PM)',
      'Emergency slots should be reserved during all active hours',
      'Distribute specialists across different time zones for better coverage'
    ];
  }
}

module.exports = new DoctorAllocationController();
