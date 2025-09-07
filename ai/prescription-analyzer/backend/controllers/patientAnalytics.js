const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

class PatientAnalyticsController {

  // Get comprehensive patient analytics
  async getPatientAnalytics(req, res) {
    try {
      const { district, timeRange = '30d', ageGroup, gender } = req.query;
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let matchQuery = {
        isActive: true,
        createdAt: { $gte: startDate }
      };

      if (district && district !== 'All') {
        matchQuery['address.district'] = district;
      }

      if (gender && gender !== 'All') {
        matchQuery.gender = gender;
      }

      if (ageGroup && ageGroup !== 'All') {
        const [minAge, maxAge] = this.parseAgeGroup(ageGroup);
        matchQuery.age = { $gte: minAge, $lte: maxAge };
      }

      // Get basic demographics
      const demographics = await Patient.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalPatients: { $sum: 1 },
            avgAge: { $avg: '$age' },
            maleCount: { $sum: { $cond: [{ $eq: ['$gender', 'Male'] }, 1, 0] } },
            femaleCount: { $sum: { $cond: [{ $eq: ['$gender', 'Female'] }, 1, 0] } },
            ageGroups: {
              $push: {
                $switch: {
                  branches: [
                    { case: { $lt: ['$age', 18] }, then: '0-17' },
                    { case: { $lt: ['$age', 35] }, then: '18-34' },
                    { case: { $lt: ['$age', 50] }, then: '35-49' },
                    { case: { $lt: ['$age', 65] }, then: '50-64' }
                  ],
                  default: '65+'
                }
              }
            }
          }
        }
      ]);

      // Disease pattern analysis
      const diseasePatterns = await this.getDiseasePatterns(matchQuery);

      // Consultation trends
      const consultationTrends = await this.getConsultationTrends(matchQuery, days);

      // Health outcomes
      const healthOutcomes = await this.getHealthOutcomes(matchQuery);

      res.json({
        success: true,
        data: {
          demographics: demographics[0] || {},
          diseasePatterns,
          consultationTrends,
          healthOutcomes
        }
      });

    } catch (error) {
      console.error('Patient analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get urgent patients requiring immediate attention
  async getUrgentPatients(req, res) {
    try {
      const { district, limit = 20 } = req.query;

      let matchQuery = {
        isActive: true,
        'recentHealthStatus.urgencyLevel': { $in: ['High', 'Emergency'] }
      };

      if (district && district !== 'All') {
        matchQuery['address.district'] = district;
      }

      const urgentPatients = await Patient.find(matchQuery)
        .select('name age gender phone address recentHealthStatus medicalProfile.chronicConditions')
        .sort({ 'recentHealthStatus.lastSymptomDate': -1 })
        .limit(parseInt(limit))
        .populate({
          path: 'appointments',
          match: { status: { $in: ['scheduled', 'confirmed'] } },
          select: 'appointmentDate status consultationReason',
          options: { limit: 1, sort: { appointmentDate: 1 } }
        });

      // Enrich with additional context
      const enrichedPatients = await Promise.all(urgentPatients.map(async (patient) => {
        const recentAppointments = await Appointment.countDocuments({
          patientId: patient._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        return {
          ...patient.toObject(),
          recentConsultations: recentAppointments,
          riskScore: this.calculateRiskScore(patient)
        };
      }));

      res.json({
        success: true,
        data: enrichedPatients.sort((a, b) => b.riskScore - a.riskScore),
        summary: {
          totalUrgent: enrichedPatients.length,
          criticalRisk: enrichedPatients.filter(p => p.riskScore >= 8).length,
          highRisk: enrichedPatients.filter(p => p.riskScore >= 6 && p.riskScore < 8).length
        }
      });

    } catch (error) {
      console.error('Urgent patients error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get patient flow analysis
  async getPatientFlowAnalysis(req, res) {
    try {
      const { district, days = 30 } = req.query;
      const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

      let matchQuery = {
        createdAt: { $gte: startDate }
      };

      if (district && district !== 'All') {
        matchQuery['patientInfo.location.district'] = district;
      }

      // Daily patient flow
      const dailyFlow = await Appointment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              urgency: '$consultationReason.urgencyLevel'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            total: { $sum: '$count' },
            urgencyBreakdown: {
              $push: {
                level: '$_id.urgency',
                count: '$count'
              }
            }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Hourly patterns
      const hourlyPatterns = await Appointment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 },
            avgWaitTime: { $avg: '$analytics.waitTime' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Specialty demand patterns
      const specialtyDemand = await Appointment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$specialty',
            totalAppointments: { $sum: 1 },
            avgWaitTime: { $avg: '$analytics.waitTime' },
            completionRate: {
              $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        { $sort: { totalAppointments: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          dailyFlow,
          hourlyPatterns,
          specialtyDemand,
          summary: {
            totalAppointments: dailyFlow.reduce((sum, day) => sum + day.total, 0),
            avgDailyPatients: dailyFlow.reduce((sum, day) => sum + day.total, 0) / dailyFlow.length || 0,
            peakHour: hourlyPatterns.reduce((peak, hour) => 
              hour.count > peak.count ? hour : peak, { _id: 0, count: 0 })._id
          }
        }
      });

    } catch (error) {
      console.error('Patient flow analysis error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get patient satisfaction analytics
  async getPatientSatisfaction(req, res) {
    try {
      const { district, timeRange = '30d' } = req.query;
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let matchQuery = {
        createdAt: { $gte: startDate },
        'feedback.patientRating': { $exists: true }
      };

      if (district && district !== 'All') {
        matchQuery['patientInfo.location.district'] = district;
      }

      const satisfactionData = await Appointment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            avgRating: { $avg: '$feedback.patientRating' },
            ratingDistribution: {
              $push: '$feedback.patientRating'
            },
            avgTechnicalRating: { $avg: '$feedback.technicalRating' },
            commonComplaints: { $push: '$feedback.patientReview' }
          }
        }
      ]);

      // Rating distribution
      const ratingDist = [1, 2, 3, 4, 5].map(rating => {
        const count = satisfactionData[0]?.ratingDistribution.filter(r => r === rating).length || 0;
        return {
          rating,
          count,
          percentage: satisfactionData[0] ? (count / satisfactionData[0].totalRatings) * 100 : 0
        };
      });

      // Satisfaction by specialty
      const specialtySatisfaction = await Appointment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$specialty',
            avgRating: { $avg: '$feedback.patientRating' },
            totalRatings: { $sum: 1 }
          }
        },
        { $sort: { avgRating: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          overall: satisfactionData[0] || {},
          ratingDistribution: ratingDist,
          specialtySatisfaction
        }
      });

    } catch (error) {
      console.error('Patient satisfaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get chronic disease management analytics
  async getChronicDiseaseAnalytics(req, res) {
    try {
      const { district } = req.query;

      let matchQuery = {
        isActive: true,
        'medicalProfile.chronicConditions': { $exists: true, $ne: [] }
      };

      if (district && district !== 'All') {
        matchQuery['address.district'] = district;
      }

      const chronicDiseaseData = await Patient.aggregate([
        { $match: matchQuery },
        { $unwind: '$medicalProfile.chronicConditions' },
        {
          $group: {
            _id: '$medicalProfile.chronicConditions.condition',
            patientCount: { $sum: 1 },
            avgAge: { $avg: '$age' },
            severityBreakdown: {
              $push: '$medicalProfile.chronicConditions.severity'
            },
            genderDistribution: {
              $push: '$gender'
            }
          }
        },
        { $sort: { patientCount: -1 } }
      ]);

      // Calculate adherence rates and outcomes
      const diseaseOutcomes = await Promise.all(chronicDiseaseData.map(async (disease) => {
        const adherenceData = await this.calculateDiseaseAdherence(disease._id, matchQuery);
        return {
          ...disease,
          adherenceRate: adherenceData.adherenceRate,
          outcomeImprovement: adherenceData.outcomeImprovement
        };
      }));

      res.json({
        success: true,
        data: diseaseOutcomes,
        summary: {
          totalChronicPatients: chronicDiseaseData.reduce((sum, d) => sum + d.patientCount, 0),
          mostCommonCondition: chronicDiseaseData[0]?._id,
          avgPatientsPerCondition: chronicDiseaseData.reduce((sum, d) => sum + d.patientCount, 0) / chronicDiseaseData.length || 0
        }
      });

    } catch (error) {
      console.error('Chronic disease analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Predict patient no-show risk
  async predictNoShowRisk(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findOne({ appointmentId })
        .populate('patientId');

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const riskFactors = await this.calculateNoShowRiskFactors(appointment);
      const riskScore = this.calculateNoShowRisk(riskFactors);

      res.json({
        success: true,
        data: {
          appointmentId,
          riskScore,
          riskLevel: this.getRiskLevel(riskScore),
          riskFactors,
          recommendations: this.getNoShowPreventionRecommendations(riskScore, riskFactors)
        }
      });

    } catch (error) {
      console.error('No-show prediction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods
  parseAgeGroup(ageGroup) {
    const ageRanges = {
      '0-17': [0, 17],
      '18-34': [18, 34],
      '35-49': [35, 49],
      '50-64': [50, 64],
      '65+': [65, 120]
    };
    return ageRanges[ageGroup] || [0, 120];
  }

  async getDiseasePatterns(matchQuery) {
    return await Patient.aggregate([
      { $match: matchQuery },
      { $unwind: { path: '$medicalProfile.chronicConditions', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$medicalProfile.chronicConditions.condition',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  async getConsultationTrends(matchQuery, days) {
    const patientIds = await Patient.find(matchQuery).distinct('_id');
    
    return await Appointment.aggregate([
      {
        $match: {
          patientId: { $in: patientIds },
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            mode: '$consultationMode'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          consultations: {
            $push: {
              mode: '$_id.mode',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  async getHealthOutcomes(matchQuery) {
    const patientIds = await Patient.find(matchQuery).distinct('_id');
    
    return await Appointment.aggregate([
      {
        $match: {
          patientId: { $in: patientIds },
          status: 'completed',
          'consultation.followUp.required': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalCompletedConsultations: { $sum: 1 },
          followUpRequired: {
            $sum: { $cond: ['$consultation.followUp.required', 1, 0] }
          },
          avgSessionDuration: { $avg: '$session.actualDuration' },
          commonDiagnoses: { $push: '$consultation.diagnosis.primary' }
        }
      }
    ]);
  }

  calculateRiskScore(patient) {
    let score = 0;
    
    // Age factor
    if (patient.age > 65) score += 2;
    if (patient.age < 5) score += 2;
    
    // Urgency level
    if (patient.recentHealthStatus.urgencyLevel === 'Emergency') score += 4;
    if (patient.recentHealthStatus.urgencyLevel === 'High') score += 3;
    
    // Chronic conditions
    const chronicCount = patient.medicalProfile?.chronicConditions?.length || 0;
    score += Math.min(chronicCount, 3);
    
    // Recent symptoms timing
    const symptomAge = Date.now() - new Date(patient.recentHealthStatus.lastSymptomDate).getTime();
    const hoursOld = symptomAge / (1000 * 60 * 60);
    if (hoursOld < 2) score += 2;
    
    return Math.min(score, 10);
  }

  async calculateDiseaseAdherence(condition, matchQuery) {
    // Simplified adherence calculation
    const patients = await Patient.find({
      ...matchQuery,
      'medicalProfile.chronicConditions.condition': condition
    });

    // Mock adherence data - in real implementation, track medication compliance
    const adherenceRate = 75 + Math.random() * 20; // 75-95% range
    const outcomeImprovement = 60 + Math.random() * 30; // 60-90% range

    return {
      adherenceRate: Math.round(adherenceRate),
      outcomeImprovement: Math.round(outcomeImprovement)
    };
  }

  async calculateNoShowRiskFactors(appointment) {
    const patient = appointment.patientId;
    
    // Historical no-show rate
    const patientHistory = await Appointment.aggregate([
      { $match: { patientId: patient._id } },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          noShows: { $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] } }
        }
      }
    ]);

    const noShowRate = patientHistory[0] ? 
      (patientHistory[0].noShows / patientHistory[0].totalAppointments) * 100 : 0;

    return {
      historicalNoShowRate: noShowRate,
      appointmentLeadTime: (appointment.appointmentDate - appointment.createdAt) / (1000 * 60 * 60), // hours
      timeOfDay: new Date(appointment.appointmentDate).getHours(),
      dayOfWeek: new Date(appointment.appointmentDate).getDay(),
      patientAge: patient.age,
      urgencyLevel: appointment.consultationReason.urgencyLevel,
      consultationMode: appointment.consultationMode
    };
  }

  calculateNoShowRisk(factors) {
    let risk = 0;
    
    // Historical behavior
    risk += factors.historicalNoShowRate * 0.4;
    
    // Lead time (longer = higher risk)
    if (factors.appointmentLeadTime > 72) risk += 20;
    if (factors.appointmentLeadTime > 24) risk += 10;
    
    // Time factors
    if (factors.timeOfDay < 9 || factors.timeOfDay > 17) risk += 15;
    if (factors.dayOfWeek === 1 || factors.dayOfWeek === 6) risk += 10;
    
    // Urgency (less urgent = higher no-show risk)
    if (factors.urgencyLevel === 'Low') risk += 15;
    if (factors.urgencyLevel === 'Medium') risk += 10;
    
    return Math.min(Math.round(risk), 100);
  }

  getRiskLevel(score) {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }

  getNoShowPreventionRecommendations(riskScore, factors) {
    const recommendations = [];
    
    if (riskScore >= 70) {
      recommendations.push('Send confirmation call 24 hours before appointment');
      recommendations.push('Consider offering earlier appointment slot');
    }
    
    if (riskScore >= 40) {
      recommendations.push('Send SMS reminder 2 hours before appointment');
      recommendations.push('Provide clear appointment instructions');
    }
    
    if (factors.historicalNoShowRate > 30) {
      recommendations.push('Require deposit or advance payment');
      recommendations.push('Schedule follow-up within 2 weeks');
    }
    
    if (factors.consultationMode === 'video' && factors.patientAge > 60) {
      recommendations.push('Provide technical support contact');
      recommendations.push('Offer voice call as backup option');
    }
    
    return recommendations;
  }

  // Export patient analytics data
  async exportAnalyticsData(req, res) {
    try {
      const { district, format = 'json', reportType = 'summary' } = req.query;

      let data = {};

      switch (reportType) {
        case 'demographics':
          data = await this.generateDemographicsReport(district);
          break;
        case 'diseases':
          data = await this.generateDiseaseReport(district);
          break;
        case 'satisfaction':
          data = await this.generateSatisfactionReport(district);
          break;
        default:
          data = await this.generateSummaryReport(district);
      }

      if (format === 'csv') {
        const csvData = this.convertAnalyticsToCSV(data, reportType);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=patient-analytics-${reportType}.csv`);
        res.send(csvData);
      } else {
        res.json({
          success: true,
          reportType,
          district: district || 'All',
          generatedAt: new Date(),
          data
        });
      }

    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async generateDemographicsReport(district) {
    let matchQuery = { isActive: true };
    if (district && district !== 'All') {
      matchQuery['address.district'] = district;
    }

    return await Patient.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lt: ['$age', 18] }, then: '0-17' },
                  { case: { $lt: ['$age', 35] }, then: '18-34' },
                  { case: { $lt: ['$age', 50] }, then: '35-49' },
                  { case: { $lt: ['$age', 65] }, then: '50-64' }
                ],
                default: '65+'
              }
            },
            gender: '$gender'
          },
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      },
      { $sort: { '_id.ageGroup': 1, '_id.gender': 1 } }
    ]);
  }

  async generateDiseaseReport(district) {
    let matchQuery = { isActive: true };
    if (district && district !== 'All') {
      matchQuery['address.district'] = district;
    }

    return await Patient.aggregate([
      { $match: matchQuery },
      { $unwind: { path: '$medicalProfile.chronicConditions', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            condition: '$medicalProfile.chronicConditions.condition',
            severity: '$medicalProfile.chronicConditions.severity'
          },
          patientCount: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      },
      { $match: { '_id.condition': { $ne: null } } },
      { $sort: { patientCount: -1 } }
    ]);
  }

  async generateSatisfactionReport(district) {
    let matchQuery = {
      'feedback.patientRating': { $exists: true }
    };
    
    if (district && district !== 'All') {
      matchQuery['patientInfo.location.district'] = district;
    }

    return await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            specialty: '$specialty',
            consultationMode: '$consultationMode'
          },
          avgRating: { $avg: '$feedback.patientRating' },
          totalRatings: { $sum: 1 },
          avgTechnicalRating: { $avg: '$feedback.technicalRating' }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);
  }

  async generateSummaryReport(district) {
    const [demographics, diseases, satisfaction] = await Promise.all([
      this.generateDemographicsReport(district),
      this.generateDiseaseReport(district),
      this.generateSatisfactionReport(district)
    ]);

    return {
      demographics,
      diseases,
      satisfaction,
      summary: {
        totalPatients: demographics.reduce((sum, d) => sum + d.count, 0),
        mostCommonDisease: diseases[0]?._id.condition,
        avgSatisfaction: satisfaction.reduce((sum, s) => sum + s.avgRating, 0) / satisfaction.length || 0
      }
    };
  }

  convertAnalyticsToCSV(data, reportType) {
    let headers = [];
    let rows = [];

    switch (reportType) {
      case 'demographics':
        headers = ['Age Group', 'Gender', 'Count', 'Average Age'];
        rows = data.map(item => [
          item._id.ageGroup,
          item._id.gender,
          item.count,
          Math.round(item.avgAge * 100) / 100
        ]);
        break;

      case 'diseases':
        headers = ['Condition', 'Severity', 'Patient Count', 'Average Age'];
        rows = data.map(item => [
          item._id.condition,
          item._id.severity || 'Not Specified',
          item.patientCount,
          Math.round(item.avgAge * 100) / 100
        ]);
        break;

      case 'satisfaction':
        headers = ['Specialty', 'Consultation Mode', 'Average Rating', 'Total Ratings', 'Technical Rating'];
        rows = data.map(item => [
          item._id.specialty,
          item._id.consultationMode,
          Math.round(item.avgRating * 100) / 100,
          item.totalRatings,
          Math.round(item.avgTechnicalRating * 100) / 100
        ]);
        break;

      default:
        headers = ['Report Type', 'Total Records'];
        rows = [
          ['Demographics', data.demographics?.length || 0],
          ['Diseases', data.diseases?.length || 0],
          ['Satisfaction', data.satisfaction?.length || 0]
        ];
    }

    const csvRows = [headers.join(',')];
    rows.forEach(row => {
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }
}

module.exports = new PatientAnalyticsController();
